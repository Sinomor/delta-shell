import { Astal, Gdk, Gtk } from "ags/gtk4";
import AstalNiri from "gi://AstalNiri";
import AstalApps from "gi://AstalApps";
import { createBinding, createComputed, For } from "ags";
import { compositor, config, theme } from "@/options";
import { attachHoverScroll, bash, getAppInfo } from "@/src/lib/utils";
import { icons } from "@/src/lib/icons";
import BarItem, { FunctionsList } from "@/src/widgets/baritem";
import { isVertical } from "../../bar";
const apps_icons = config.bar.modules.workspaces["taskbar-icons"];
const niri = compositor.get() === "niri" ? AstalNiri.get_default() : null;

export function Workspaces_Niri({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
   if (!niri) {
      console.warn("Workspaces_Niri: Niri compositor not active");
      return <box />;
   }

   const outputs = createBinding(niri, "outputs").as((outputs) =>
      outputs.filter((output) => output.model === gdkmonitor.model),
   );

   function AppButton({ client }: { client: AstalNiri.Window }) {
      const classes = createBinding(niri!, "focusedWindow").as((fcsClient) => {
         const classes = ["taskbar-button"];
         if (!fcsClient || !client.app_id || !fcsClient.app_id) return classes;
         const isFocused = fcsClient.id === client?.id;
         if (isFocused) classes.push("focused");
         return classes;
      });

      const appInfo = getAppInfo(client.app_id);
      const iconName =
         apps_icons[client.app_id] || appInfo?.iconName || icons.apps_default;

      const indicatorValign = config.bar.position.as((p) => {
         switch (p) {
            case "top":
               return Gtk.Align.START;
            case "bottom":
               return Gtk.Align.END;
            case "right":
            case "left":
               return Gtk.Align.CENTER;
         }
      });

      const indicatorHalign = config.bar.position.as((p) => {
         switch (p) {
            case "top":
            case "bottom":
               return Gtk.Align.CENTER;
            case "right":
               return Gtk.Align.END;
            case "left":
               return Gtk.Align.START;
         }
      });

      return (
         <box cssClasses={classes}>
            <Gtk.GestureClick
               onPressed={(ctrl, _, x, y) => {
                  const button = ctrl.get_current_button();
                  if (button === Gdk.BUTTON_PRIMARY) {
                     client.focus(client.id);
                  } else if (button === Gdk.BUTTON_MIDDLE) {
                     bash(`niri msg action close-window --id ${client.id}`);
                  }
               }}
               button={0}
            />
            <overlay hexpand={isVertical}>
               <box
                  $type={"overlay"}
                  class={"indicator"}
                  valign={indicatorValign.get()}
                  halign={indicatorHalign.get()}
               />
               <image
                  tooltipText={client.title}
                  halign={Gtk.Align.CENTER}
                  valign={Gtk.Align.CENTER}
                  iconName={iconName}
                  pixelSize={20}
               />
            </overlay>
         </box>
      );
   }

   function WorkspaceButton({ ws }: { ws: AstalNiri.Workspace }) {
      const classNames = createBinding(niri!, "focusedWorkspace").as((fws) => {
         const classes = ["bar-item"];

         const active = fws?.id == ws.id;
         if (active) {
            classes.push("active");
         }

         return classes;
      });

      return (
         <BarItem
            cssClasses={classNames}
            orientation={
               isVertical
                  ? Gtk.Orientation.VERTICAL
                  : Gtk.Orientation.HORIZONTAL
            }
            hexpand={isVertical}
         >
            <Gtk.GestureClick
               onPressed={(ctrl) => {
                  const button = ctrl.get_current_button();
                  if (button === Gdk.BUTTON_PRIMARY) ws.focus();
               }}
            />
            <label class={"workspace"} label={ws.idx.toString()} />
            {config.bar.modules.workspaces.taskbar.get() && (
               <For
                  each={createBinding(ws, "windows").as((clients) => clients)}
               >
                  {(client: AstalNiri.Window) => <AppButton client={client} />}
               </For>
            )}
         </BarItem>
      );
   }

   function Workspaces({ output }: { output: AstalNiri.Output }) {
      const workspaces = createBinding(output, "workspaces").as((workspaces) =>
         workspaces.sort((a, b) => a.idx - b.idx),
      );

      return (
         <box
            spacing={theme.bar.spacing}
            orientation={
               isVertical
                  ? Gtk.Orientation.VERTICAL
                  : Gtk.Orientation.HORIZONTAL
            }
            hexpand={isVertical}
            class={"workspaces"}
            $={(self) =>
               attachHoverScroll(self, ({ dy }) => {
                  if (dy < 0) {
                     FunctionsList[
                        config.bar.modules.workspaces["on-scroll-up"].get()
                     ]();
                  } else if (dy > 0) {
                     FunctionsList[
                        config.bar.modules.workspaces["on-scroll-down"].get()
                     ]();
                  }
               })
            }
         >
            <For each={workspaces}>{(ws) => <WorkspaceButton ws={ws} />}</For>
         </box>
      );
   }

   return (
      <box
         orientation={
            isVertical ? Gtk.Orientation.VERTICAL : Gtk.Orientation.HORIZONTAL
         }
         hexpand={isVertical}
      >
         <For each={outputs}>{(output) => <Workspaces output={output} />}</For>
      </box>
   );
}
