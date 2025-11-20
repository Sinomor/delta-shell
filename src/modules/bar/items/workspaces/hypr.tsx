import { Gdk, Gtk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import AstalApps from "gi://AstalApps?version=0.1";
import { createBinding, createComputed, For } from "ags";
import { icons } from "@/src/lib/icons";
import BarItem, { FunctionsList } from "@/src/widgets/baritem";
import { compositor, config, theme } from "@/options";
import { attachHoverScroll, getAppInfo } from "@/src/lib/utils";
import { isVertical, orientation } from "../../bar";
const apps_icons = config.bar.modules.workspaces["taskbar-icons"];
const hyprland =
   compositor.get() === "hyprland" ? AstalHyprland.get_default() : null;

export function Workspaces_Hypr({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
   if (!hyprland) {
      console.warn("Workspaces_Hypr: Hyprland compositor not active");
      return <box />;
   }
   const monitors = createBinding(hyprland, "monitors").as((monitors) =>
      monitors.filter((monitor) => monitor.model === gdkmonitor.model),
   );

   function AppButton({ client }: { client: AstalHyprland.Client }) {
      const classes = createBinding(hyprland!, "focusedClient").as(
         (fcsClient) => {
            const classes = ["taskbar-button"];
            if (!fcsClient || !client.class || !fcsClient.pid) return classes;
            const isFocused = fcsClient.pid === client?.pid;
            if (isFocused) classes.push("focused");
            return classes;
         },
      );

      const hasWindow = createBinding(hyprland!, "clients").as((clients) =>
         clients
            .map((e) => e.class.toLowerCase())
            .includes(client.class.toLowerCase()),
      );

      const appInfo = getAppInfo(client.class);
      const iconName =
         apps_icons[client.class] || appInfo?.iconName || icons.apps_default;

      const indicatorValign = () => {
         switch (config.bar.position) {
            case "top":
               return Gtk.Align.START;
            case "bottom":
               return Gtk.Align.END;
            case "right":
            case "left":
               return Gtk.Align.CENTER;
         }
      };

      const indicatorHalign = () => {
         switch (config.bar.position) {
            case "top":
            case "bottom":
               return Gtk.Align.CENTER;
            case "right":
               return Gtk.Align.END;
            case "left":
               return Gtk.Align.START;
         }
      };

      return (
         <box cssClasses={classes}>
            <Gtk.GestureClick
               onPressed={(ctrl, _, x, y) => {
                  const button = ctrl.get_current_button();
                  if (button === Gdk.BUTTON_PRIMARY) {
                     client.focus();
                  } else if (button === Gdk.BUTTON_MIDDLE) {
                     client.kill();
                  }
               }}
               button={0}
            />
            <overlay hexpand={isVertical}>
               <box
                  $type={"overlay"}
                  class={"indicator"}
                  valign={indicatorValign()}
                  halign={indicatorHalign()}
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

   function WorkspaceButton({ ws }: { ws: AstalHyprland.Workspace }) {
      const classNames = createBinding(hyprland!, "focusedWorkspace").as(
         (fws) => {
            const classes = ["bar-item"];

            const active = fws.id == ws.id;
            active && classes.push("active");

            return classes;
         },
      );

      return (
         <BarItem
            cssClasses={classNames}
            orientation={orientation}
            hexpand={isVertical}
         >
            <label class={"workspace"} label={ws.id.toString()} />
            {config.bar.modules.workspaces.taskbar && (
               <For
                  each={createBinding(ws, "clients").as((clients) =>
                     clients.sort((a, b) => a.pid - b.pid),
                  )}
               >
                  {(client: AstalHyprland.Client) => (
                     <AppButton client={client} />
                  )}
               </For>
            )}
         </BarItem>
      );
   }

   function Workspaces({ monitor }: { monitor: AstalHyprland.Monitor }) {
      const workspaces = createBinding(hyprland!, "workspaces").as(
         (workspaces) =>
            workspaces
               .filter((ws) => ws.monitor?.model === monitor.model)
               .sort((a, b) => a.id - b.id),
      );

      return (
         <box
            spacing={theme.bar.spacing}
            orientation={orientation}
            hexpand={isVertical}
            class={"workspaces"}
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
         <For each={monitors}>
            {(monitor) => <Workspaces monitor={monitor} />}
         </For>
      </box>
   );
}
