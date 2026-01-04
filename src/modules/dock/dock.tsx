import { Gdk, Gtk } from "ags/gtk4";
import AstalNiri from "gi://AstalNiri";
import {
   createBinding,
   createComputed,
   createEffect,
   createState,
   For,
   With,
} from "ags";
import { compositor, config, theme } from "@/options";
import { bash, getAppInfo, truncateByFormat } from "@/src/lib/utils";
import { icons } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import Pango from "gi://Pango?version=1.0";
import GioUnix from "gi://GioUnix?version=2.0";
import AstalApps from "gi://AstalApps?version=0.1";
import { readFile, writeFileAsync } from "ags/file";
import GLib from "gi://GLib?version=2.0";
import { setIgnore, setPopup, setRevealed } from "@/src/windows/dock";

const niri = compositor.peek() === "niri" ? AstalNiri.get_default() : null;

export interface TaskbarItem {
   wmclass: string;
   title: string;
   name: string;
   icon: string;
   windows: AstalNiri.Window[];
   app?: AstalApps.Application;
   isPinned: boolean;
}

function createItem(
   wmclass: string,
   windows: AstalNiri.Window[],
   isPinned: boolean,
   app: AstalApps.Application | null,
): TaskbarItem {
   const entry = app || getAppInfo(wmclass);
   return {
      wmclass: wmclass,
      title: windows[0]?.title || entry?.name || wmclass,
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
   windows: AstalNiri.Window[],
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
      const appId = w.appId;
      const appInfo = getAppInfo(appId);
      const pinnedItem = pinnedMap.get(appInfo!.entry);

      if (pinnedItem) {
         pinnedItem.windows.push(w);
         if (pinnedItem.windows.length === 1) {
            pinnedItem.title = w.title;
         }
      } else {
         if (grouping) {
            const existingGroup = activeItems.find((i) => i.wmclass === appId);
            if (existingGroup) existingGroup.windows.push(w);
            else activeItems.push(createItem(appId, [w], false, null));
         } else {
            const item = createItem(appId, [w], false, null);
            item.title = w.title;
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

   const focusedWindow = createBinding(niri!, "focusedWindow");
   const isFocused = focusedWindow((fw) =>
      item.windows.some((w) => fw && w.id === fw.id),
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
      switch (config.dock.position) {
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
         config.dock.position === "top" || config.dock.position === "bottom"
            ? config.dock.position === "top"
               ? Gtk.Align.START
               : Gtk.Align.END
            : Gtk.Align.CENTER,
      halign:
         config.dock.position === "left" || config.dock.position === "right"
            ? config.dock.position === "left"
               ? Gtk.Align.START
               : Gtk.Align.END
            : Gtk.Align.CENTER,
   };

   function handleClick() {
      if (item.windows.length === 0) {
         item.app?.launch();
      } else if (item.windows.length === 1) {
         item.windows[0].focus(item.windows[0].id);
      } else {
         const focused = item.windows.findIndex((w) => w.is_focused);
         const next = (focused + 1) % item.windows.length;
         item.windows[next].focus(item.windows[next].id);
      }
   }

   function handleCloseAll() {
      for (const window of item.windows) {
         bash(`niri msg action close-window --id ${window.id}`);
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
         cssClasses={classes}
         tooltipText={
            item.windows.length > 0
               ? createBinding(item.windows[0], "title")
               : item.name
         }
         $={(self) => (overlay = self)}
         vexpand
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
            >
               {item.windows.slice(0, 3).map((w) => {
                  const isWindowFocused = focusedWindow(
                     (fw) => fw && fw.id === w.id,
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
                  bash(
                     `niri msg action close-window --id ${item.windows[0].id}`,
                  );
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
                     pixelSize={32}
                     vexpand
                     halign={Gtk.Align.CENTER}
                     valign={Gtk.Align.CENTER}
                  />
               ),
               title: (
                  <label
                     label={
                        item.windows.length > 0
                           ? createBinding(item.windows[0], "title").as((t) =>
                                truncateByFormat(t, "title", mainFormat),
                             )
                           : item.name
                     }
                     visible={hasWindows}
                  />
               ),
               name: <label label={item.name} />,
            }}
         />
         <popover
            hasArrow={false}
            widthRequest={300}
            position={popoverPosition}
            onShow={() => {
               setPopup(true);
               setRevealed(true);
            }}
            onHide={() => {
               setPopup(false);
            }}
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
                           window.focus(window.id);
                           popover.popdown();
                        }}
                     >
                        <box spacing={theme.spacing}>
                           <label
                              label={createBinding(window, "title")}
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
                                       bash(
                                          `niri msg action close-window --id ${window.id}`,
                                       );
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

export function DockModule({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
   if (!niri) {
      console.warn("Bar: taskbar skipped: niri is not active");
      return <box visible={false} />;
   }

   const windows = createBinding(niri!, "windows").as((windows) =>
      windows
         .filter((w) => (w.workspace.output = gdkmonitor.model))
         .sort((a, b) => a.id - b.id),
   );
   const focusedWorkspace = createBinding(niri!, "focusedWorkspace");
   createEffect(() => {
      const fws = focusedWorkspace();
      const count = windows().filter((w) => w.workspace.id === fws.id).length;
      if (count > 0) {
         setIgnore(false);
         setRevealed(false);
      } else setIgnore(true);
   });
   const items = createComputed(() =>
      getItems(windows(), pinnedEntries(), config.bar.modules.taskbar.grouped),
   );

   return (
      <box spacing={theme.spacing} class={"taskbar"}>
         <box
            spacing={theme.bar.spacing}
            visible={items((i) => i.pinned.length > 0)}
         >
            <For each={items((i) => i.pinned)}>
               {(item: TaskbarItem) => <AppButton item={item} />}
            </For>
         </box>
         <Gtk.Separator
            visible={items((i) => i.pinned.length > 0 && i.active.length > 0)}
         />
         <box
            spacing={theme.bar.spacing}
            visible={items((i) => i.active.length > 0)}
         >
            <For each={items((i) => i.active)}>
               {(item: TaskbarItem) => <AppButton item={item} />}
            </For>
         </box>
      </box>
   );
   return (
      <BarItem
         class={"taskbar"}
         data={{
            pinned: (
               <box spacing={theme.bar.spacing}>
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
               />
            ),
            windows: (
               <box spacing={theme.bar.spacing}>
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
