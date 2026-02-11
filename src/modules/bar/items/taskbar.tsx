import { Gdk, Gtk } from "ags/gtk4";
import { createBinding, createComputed, createState, For } from "ags";
import { config, theme } from "@/options";
import { getAppInfo, truncateByFormat } from "@/src/lib/utils";
import { icons } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import Pango from "gi://Pango?version=1.0";
import GioUnix from "gi://GioUnix?version=2.0";
import AstalApps from "gi://AstalApps?version=0.1";
import { readFile, writeFileAsync } from "ags/file";
import GLib from "gi://GLib?version=2.0";
import { compositor } from "@/src/lib/compositor";
import { isVertical, orientation } from "../bar";

export interface TaskbarItem {
   wmclass: string;
   title: string;
   name: string;
   icon: string;
   windows: any[];
   app?: AstalApps.Application;
   isPinned: boolean;
}

function createItem(
   wmclass: string,
   windows: any[],
   isPinned: boolean,
   app: AstalApps.Application | null,
): TaskbarItem {
   const entry = app || getAppInfo(wmclass);
   return {
      wmclass: wmclass,
      title: windows[0]
         ? compositor.windowTitle(windows[0])
         : entry?.name || wmclass,
      name: entry?.name || wmclass,
      icon:
         entry?.iconName ||
         config.bar.modules.taskbar.icons[wmclass] ||
         icons.apps_default,
      windows: windows,
      isPinned: isPinned,
      app: entry || undefined,
   };
}

export function getItems(
   windows: any[],
   pinnedApps: string[],
   grouping: boolean,
) {
   const pinnedMap = new Map<string, TaskbarItem>();
   const activeItems: TaskbarItem[] = [];

   pinnedApps.forEach((appId) => {
      const appInfo = getAppInfo(appId);
      pinnedMap.set(appId, createItem(appId, [], true, appInfo));
   });

   windows.forEach((w) => {
      const appId = compositor.windowClass(w);
      const appInfo = getAppInfo(appId);
      const pinnedItem = pinnedMap.get(appInfo!.entry);

      if (pinnedItem) {
         pinnedItem.windows.push(w);
         if (pinnedItem.windows.length === 1) {
            pinnedItem.title = compositor.windowTitle(w);
         }
      } else {
         if (grouping) {
            const existingGroup = activeItems.find((i) => i.wmclass === appId);
            if (existingGroup) existingGroup.windows.push(w);
            else activeItems.push(createItem(appId, [w], false, null));
         } else {
            const item = createItem(appId, [w], false, null);
            item.title = compositor.windowTitle(w);
            activeItems.push(item);
         }
      }
   });

   return {
      pinned: Array.from(pinnedMap.values()),
      active: activeItems,
   };
}

const configDir = GLib.get_user_config_dir();
const configFile = `${configDir}/delta-shell/config.json`;

export const [pinnedEntries, setPinnedEntries] = createState<string[]>(
   config.bar.modules.taskbar.pinned,
);

export async function togglePin(entry: string) {
   const current = pinnedEntries.get();
   const newPinned = current.includes(entry)
      ? current.filter((e) => e !== entry)
      : [...current, entry];

   setPinnedEntries(newPinned);

   try {
      const configData = JSON.parse(await readFile(configFile));
      configData.bar.modules.taskbar.pinned = newPinned;
      await writeFileAsync(configFile, JSON.stringify(configData, null, 2));
   } catch (error) {
      console.error("Taskbar: failed to save pinned apps:", error);
   }
}

function AppButton({ item }: { item: TaskbarItem }) {
   const conf = config.bar.modules.taskbar;
   const DesktopAppInfo =
      item.app && GioUnix.DesktopAppInfo.new(item.app.entry);
   let popover: Gtk.Popover;
   let overlay: Gtk.Overlay;

   const focusedWindow = compositor.focusedWindow();
   const isFocused = focusedWindow((fw) =>
      item.windows.some(
         (w) => fw && compositor.windowId(w) === compositor.windowId(fw),
      ),
   );

   const classes = isFocused((focused) => {
      const cls = ["taskbar-button"];
      if (focused) cls.push("focused");
      return cls;
   });

   const hasIndicator = conf["window-format"].includes("{indicator}");
   const mainFormat =
      conf["window-format"].replace(/\{indicator\}\s*/g, "").trim() || "{icon}";

   const popoverPosition = (() => {
      switch (config.bar.position) {
         case "top":
            return Gtk.PositionType.BOTTOM;
         case "bottom":
            return Gtk.PositionType.TOP;
         case "left":
            return Gtk.PositionType.RIGHT;
         case "right":
            return Gtk.PositionType.LEFT;
      }
   })();

   const indicatorAlign = {
      valign:
         config.bar.position === "top" || config.bar.position === "bottom"
            ? config.bar.position === "top"
               ? Gtk.Align.START
               : Gtk.Align.END
            : Gtk.Align.CENTER,
      halign:
         config.bar.position === "left" || config.bar.position === "right"
            ? config.bar.position === "left"
               ? Gtk.Align.START
               : Gtk.Align.END
            : Gtk.Align.CENTER,
   };

   function handleClick() {
      if (item.windows.length === 0) {
         item.app?.launch();
      } else if (item.windows.length === 1) {
         compositor.focusWindow(item.windows[0]);
      } else {
         const focused = item.windows.findIndex((w) =>
            compositor.windowIsFocused(w),
         );
         const next = (focused + 1) % item.windows.length;
         compositor.focusWindow(item.windows[next]);
      }
   }

   function handleCloseAll() {
      for (const window of item.windows) {
         compositor.closeWindow(window);
      }
      popover?.popdown();
   }

   async function handleTogglePin() {
      if (item.app) {
         await togglePin(item.app.entry);
         popover?.popdown();
      }
   }

   const hasWindows = item.windows.length > 0;
   const hasActions =
      DesktopAppInfo && DesktopAppInfo.list_actions().length > 0;

   return (
      <overlay
         hexpand={isVertical}
         cssClasses={classes}
         tooltipText={
            item.windows.length > 0
               ? createBinding(item.windows[0], "title").as((t) =>
                    compositor.windowTitle(item.windows[0]),
                 )
               : item.name
         }
         $={(self) => (overlay = self)}
      >
         {hasIndicator && hasWindows && (
            <box
               $type="overlay"
               class="indicators"
               spacing={theme.bar.spacing / 2}
               hexpand
               vexpand
               valign={indicatorAlign.valign}
               halign={indicatorAlign.halign}
               orientation={orientation}
            >
               {item.windows.slice(0, 3).map((w) => {
                  const isWindowFocused = focusedWindow(
                     (fw) =>
                        fw &&
                        compositor.windowId(fw) === compositor.windowId(w),
                  );
                  return (
                     <box
                        cssClasses={isWindowFocused((f) => [
                           "indicator",
                           f ? "focused" : "",
                        ])}
                     />
                  );
               })}
            </box>
         )}
         <Gtk.GestureClick
            button={0}
            onPressed={(ctrl) => {
               const button = ctrl.get_current_button();
               if (button === Gdk.BUTTON_PRIMARY) {
                  handleClick();
               } else if (button === Gdk.BUTTON_MIDDLE && hasWindows) {
                  compositor.closeWindow(item.windows[0]);
               } else if (button === Gdk.BUTTON_SECONDARY) {
                  popover.set_parent(overlay);
                  popover.popup();
               }
            }}
         />
         <BarItem
            format={mainFormat}
            hasTooltip={false}
            data={{
               icon: (
                  <image
                     iconName={item.icon}
                     pixelSize={conf["window-icon-size"]}
                     hexpand={isVertical}
                  />
               ),
               title: (
                  <label
                     label={
                        item.windows.length > 0
                           ? createBinding(item.windows[0], "title").as((t) =>
                                truncateByFormat(
                                   compositor.windowTitle(item.windows[0]),
                                   "title",
                                   mainFormat,
                                ),
                             )
                           : item.name
                     }
                     hexpand={isVertical}
                     visible={hasWindows}
                  />
               ),
               name: <label label={item.name} hexpand={isVertical} />,
            }}
         />
         <popover
            hasArrow={false}
            widthRequest={300}
            position={popoverPosition}
            $={(self) => (popover = self)}
            $type="overlay"
         >
            <box
               orientation={Gtk.Orientation.VERTICAL}
               spacing={theme.spacing / 2}
            >
               {hasWindows &&
                  item.windows.map((window) => (
                     <button
                        class={"context-item"}
                        onClicked={() => {
                           compositor.focusWindow(window);
                           popover.popdown();
                        }}
                     >
                        <box spacing={theme.spacing}>
                           <label
                              label={createBinding(window, "title").as((t) =>
                                 compositor.windowTitle(window),
                              )}
                              xalign={0}
                              hexpand
                              valign={Gtk.Align.CENTER}
                              ellipsize={Pango.EllipsizeMode.END}
                              maxWidthChars={1}
                           />
                           <box tooltipText={"Close"}>
                              <Gtk.GestureClick
                                 onPressed={(ctrl) => {
                                    if (
                                       ctrl.get_current_button() ===
                                       Gdk.BUTTON_PRIMARY
                                    ) {
                                       compositor.closeWindow(window);
                                       popover.popdown();
                                    }
                                 }}
                              />
                              <image
                                 iconName={icons.close}
                                 pixelSize={theme["icon-size"].normal}
                              />
                           </box>
                        </box>
                     </button>
                  ))}
               {hasActions && (
                  <>
                     {hasWindows && <Gtk.Separator />}
                     {DesktopAppInfo.list_actions().map((action) => (
                        <button
                           class="context-item"
                           onClicked={() => {
                              DesktopAppInfo.launch_action(action, null);
                              popover.popdown();
                           }}
                        >
                           <label
                              halign={Gtk.Align.START}
                              label={DesktopAppInfo.get_action_name(action)}
                              hexpand
                           />
                        </button>
                     ))}
                  </>
               )}
               {item.app && (
                  <>
                     <Gtk.Separator />
                     <button class="context-item" onClicked={handleTogglePin}>
                        <label
                           label={item.isPinned ? "Unpin" : "Pin"}
                           halign={Gtk.Align.START}
                           hexpand
                        />
                     </button>
                  </>
               )}
               {hasWindows && (
                  <>
                     {!item.app && <Gtk.Separator />}
                     <button class="context-item" onClicked={handleCloseAll}>
                        <label
                           label={
                              item.windows.length > 1 ? "Close All" : "Close"
                           }
                           halign={Gtk.Align.START}
                           hexpand
                        />
                     </button>
                  </>
               )}
            </box>
         </popover>
      </overlay>
   );
}

export function Taskbar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
   if (!compositor.isHyprland() && !compositor.isNiri()) {
      console.warn("Bar: taskbar skipped: no compositor available");
      return <box visible={false} />;
   }

   const windows = compositor.monitorWindows(gdkmonitor);

   const items = createComputed(() =>
      getItems(windows(), pinnedEntries(), config.bar.modules.taskbar.grouped),
   );

   return (
      <BarItem
         class={"taskbar"}
         data={{
            pinned: (
               <box orientation={orientation} spacing={theme.bar.spacing}>
                  <For each={items((i) => i.pinned)}>
                     {(item: TaskbarItem) => <AppButton item={item} />}
                  </For>
               </box>
            ),
            separator: (
               <Gtk.Separator
                  visible={items(
                     (i) => i.pinned.length > 0 && i.active.length > 0,
                  )}
                  orientation={orientation}
               />
            ),
            windows: (
               <box orientation={orientation} spacing={theme.bar.spacing}>
                  <For each={items((i) => i.active)}>
                     {(item: TaskbarItem) => <AppButton item={item} />}
                  </For>
               </box>
            ),
         }}
         format={config.bar.modules.taskbar.format}
      />
   );
}
