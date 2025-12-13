import { Gdk, Gtk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { createBinding, createComputed, For, With } from "ags";
import { icons } from "@/src/lib/icons";
import BarItem, { FunctionsList } from "@/src/widgets/baritem";
import { compositor, config, theme } from "@/options";
import { attachHoverScroll, getAppInfo } from "@/src/lib/utils";
import { isVertical, orientation } from "../../bar";
const hyprland =
   compositor.peek() === "hyprland" ? AstalHyprland.get_default() : null;

export function WorkspacesHypr({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
   if (!hyprland) {
      console.warn("Workspaces_Hypr: Hyprland compositor not active");
      return <box visible={false} />;
   }
   const monitor = createBinding(hyprland, "monitors").as((monitors) =>
      monitors.find((monitor) => monitor.model === gdkmonitor.model),
   );

   function AppButton({ client }: { client: AstalHyprland.Client }) {
      const apps_icons = config.bar.modules.workspaces["taskbar-icons"];
      const appInfo = getAppInfo(client.class);
      const format = config.bar.modules.workspaces["app-format"];
      const iconName =
         apps_icons[client.class] || appInfo?.iconName || icons.apps_default;
      const title = createBinding(client, "title");
      const classes = createBinding(hyprland!, "focusedClient").as(
         (fcsClient) => {
            const classes = ["taskbar-button"];
            if (!fcsClient || !client.class || !fcsClient.pid) return classes;
            const isFocused = fcsClient.pid === client?.pid;
            if (isFocused) classes.push("focused");
            return classes;
         },
      );

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
               onPrimaryClick={() => client.focus()}
               onMiddleClick={() => client.kill()}
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
                        label={appInfo?.name.trim() || client.class}
                        hexpand={isVertical}
                     />
                  ),
               }}
               tooltipText={title}
            />
         </overlay>
      );
   }

   function WorkspaceButton({ ws }: { ws: AstalHyprland.Workspace }) {
      const format = config.bar.modules.workspaces["workspace-format"];
      const clients = createBinding(ws, "clients");
      const clientsCount = clients((w) => w.length);
      const focusedWorkspace = createBinding(hyprland!, "focusedWorkspace");
      const visible = createComputed(() => {
         if (config.bar.modules.workspaces["hide-empty"]) {
            return clientsCount() > 0 || focusedWorkspace().id === ws.id;
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
            data={{
               id: <label label={ws.id.toString()} hexpand={isVertical} />,
               name: <label label={ws.name} hexpand={isVertical} />,
               count: (
                  <label
                     label={clientsCount((c) => c.toString())}
                     hexpand={isVertical}
                  />
               ),
               windows: (
                  <box
                     orientation={orientation}
                     spacing={theme.bar.spacing}
                     visible={clientsCount((c) => c > 0)}
                  >
                     <For each={clients}>
                        {(client) => <AppButton client={client} />}
                     </For>
                  </box>
               ),
            }}
         />
      );
   }

   function Workspaces({ monitor }: { monitor: AstalHyprland.Monitor }) {
      const format = config.bar.modules.workspaces["workspace-format"];
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
         <With value={monitor}>
            {(monitor) => monitor && <Workspaces monitor={monitor} />}
         </With>
      </box>
   );
}
