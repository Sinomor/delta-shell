import { Gdk, Gtk } from "ags/gtk4";
import AstalNiri from "gi://AstalNiri";
import { createBinding, createComputed, For, With } from "ags";
import { compositor, config, theme } from "@/options";
import { attachHoverScroll, bash, getAppInfo } from "@/src/lib/utils";
import { icons } from "@/src/lib/icons";
import BarItem, { FunctionsList } from "@/src/widgets/baritem";
import { isVertical, orientation } from "../../bar";
const niri = compositor.peek() === "niri" ? AstalNiri.get_default() : null;

export function WorkspacesNiri({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
   if (!niri) {
      console.warn("Workspaces_Niri: Niri compositor not active");
      return <box visible={false} />;
   }
   const output = createBinding(niri, "outputs").as((outputs) =>
      outputs.find((output) => output.model === gdkmonitor.model),
   );

   function AppButton({ client }: { client: AstalNiri.Window }) {
      const apps_icons = config.bar.modules.workspaces["taskbar-icons"];
      const appInfo = getAppInfo(client.app_id);
      const format = config.bar.modules.workspaces["app-format"];
      const iconName =
         apps_icons[client.app_id] || appInfo?.iconName || icons.apps_default;
      const title = createBinding(client, "title");
      const classes = createBinding(niri!, "focusedWindow").as((fcsClient) => {
         const classes = ["taskbar-button"];
         if (!fcsClient || !client.app_id || !fcsClient.app_id) return classes;
         const isFocused = fcsClient.id === client?.id;
         if (isFocused) classes.push("focused");
         return classes;
      });

      const hasIndicator = format.includes("{indicator}");

      const formatWithoutIndicator = format
         .replace(/\{indicator\}\s*/g, "")
         .trim();
      const mainFormat = formatWithoutIndicator
         ? formatWithoutIndicator
         : "{icon}";

      const indicatorValign =
         config.bar.position === "top"
            ? Gtk.Align.START
            : config.bar.position === "bottom"
              ? Gtk.Align.END
              : Gtk.Align.CENTER;

      const indicatorHalign =
         config.bar.position === "left"
            ? Gtk.Align.START
            : config.bar.position === "right"
              ? Gtk.Align.END
              : Gtk.Align.CENTER;

      return (
         <overlay hexpand={isVertical} cssClasses={classes}>
            {hasIndicator && (
               <box
                  $type={"overlay"}
                  class={"indicator"}
                  valign={indicatorValign}
                  halign={indicatorHalign}
                  vexpand
                  hexpand
               />
            )}
            <BarItem
               format={mainFormat}
               onPrimaryClick={() => client.focus(client.id)}
               onMiddleClick={() =>
                  bash(`niri msg action close-window --id ${client.id}`)
               }
               data={{
                  icon: (
                     <image
                        iconName={iconName}
                        pixelSize={20}
                        hexpand={isVertical}
                     />
                  ),
                  title: <label label={title} hexpand={isVertical} />,
                  name: (
                     <label
                        label={appInfo?.name.trim() || client.app_id}
                        hexpand={isVertical}
                     />
                  ),
               }}
               tooltipText={title}
            />
         </overlay>
      );
   }

   function WorkspaceButton({ ws }: { ws: AstalNiri.Workspace }) {
      const format = config.bar.modules.workspaces["workspace-format"];
      const windows = createBinding(ws, "windows");
      const windowCount = windows((w) => w.length);
      const focusedWorkspace = createBinding(niri!, "focusedWorkspace");
      const visible = createComputed(() => {
         if (config.bar.modules.workspaces["hide-empty"]) {
            return windowCount() > 0 || focusedWorkspace().id === ws.id;
         }
         return true;
      });
      const classNames = focusedWorkspace((fws) => {
         const classes = ["bar-item", "workspace"];
         const active = fws.id == ws.id;
         if (active) classes.push("active");
         return classes;
      });

      return format === "" ? (
         <box
            cssClasses={classNames}
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.CENTER}
            visible={visible}
         >
            <Gtk.GestureClick
               onPressed={(ctrl, _, x, y) => {
                  const button = ctrl.get_current_button();
                  if (button === Gdk.BUTTON_PRIMARY) ws.focus();
               }}
            />
         </box>
      ) : (
         <BarItem
            cssClasses={classNames}
            onPrimaryClick={() => ws.focus()}
            format={format}
            visible={visible}
            data={{
               id: <label label={ws.idx.toString()} hexpand={isVertical} />,
               name: <label label={ws.name} hexpand={isVertical} />,
               count: (
                  <label
                     label={windowCount((c) => c.toString())}
                     hexpand={isVertical}
                  />
               ),
               windows: (
                  <box
                     orientation={orientation}
                     spacing={theme.bar.spacing}
                     visible={windowCount((c) => c > 0)}
                  >
                     <For each={windows}>
                        {(client: AstalNiri.Window) => (
                           <AppButton client={client} />
                        )}
                     </For>
                  </box>
               ),
            }}
         />
      );
   }

   function Workspaces({ output }: { output: AstalNiri.Output }) {
      const format = config.bar.modules.workspaces["workspace-format"];
      const workspaces = createBinding(output, "workspaces").as((workspaces) =>
         workspaces.sort((a, b) => a.idx - b.idx),
      );

      return (
         <box
            spacing={theme.bar.spacing}
            orientation={orientation}
            hexpand={isVertical}
            cssClasses={["workspaces", format === "" ? "compact" : ""]}
            $={(self) =>
               attachHoverScroll(self, ({ dy }) => {
                  if (dy < 0) {
                     FunctionsList[
                        config.bar.modules.workspaces[
                           "on-scroll-up"
                        ] as keyof typeof FunctionsList
                     ]();
                  } else if (dy > 0) {
                     FunctionsList[
                        config.bar.modules.workspaces[
                           "on-scroll-down"
                        ] as keyof typeof FunctionsList
                     ]();
                  }
               })
            }
         >
            {format === "" ? (
               <box
                  class={"content"}
                  orientation={orientation}
                  spacing={theme.bar.spacing}
               >
                  <For each={workspaces}>
                     {(ws) => <WorkspaceButton ws={ws} />}
                  </For>
               </box>
            ) : (
               <For each={workspaces}>
                  {(ws) => <WorkspaceButton ws={ws} />}
               </For>
            )}
         </box>
      );
   }

   return (
      <box orientation={orientation} hexpand={isVertical}>
         <With value={output}>
            {(output) => output && <Workspaces output={output} />}
         </With>
      </box>
   );
}
