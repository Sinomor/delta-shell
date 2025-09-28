import { Gdk, Gtk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import AstalApps from "gi://AstalApps?version=0.1";
import { createBinding, createComputed, For } from "ags";
import { icons } from "@/src/lib/icons";
import BarItem from "@/src/widgets/common/baritem";
import { config, theme } from "@/options";
import { attachHoverScroll } from "@/src/lib/utils";
const hyprland = AstalHyprland.get_default();
const apps_icons = config.bar.workspaces.taskbar_icons.get();

type AppButtonProps = {
   app?: AstalApps.Application;
   client: AstalHyprland.Client;
};

const application = new AstalApps.Apps();

function AppButton({ app, client }: AppButtonProps) {
   const classes = createBinding(hyprland, "focusedClient").as((fcsClient) => {
      const classes = ["taskbar-button"];
      if (!fcsClient || !client.class || !fcsClient.pid) return classes;
      const isFocused = fcsClient.pid === client?.pid;
      if (isFocused) classes.push("focused");
      return classes;
   });

   const hasWindow = createBinding(hyprland, "clients").as((clients) =>
      clients
         .map((e) => e.class.toLowerCase())
         .includes(client.class.toLowerCase()),
   );

   const iconName = app
      ? (apps_icons[app.iconName] ?? app.iconName)
      : apps_icons[client.class] || icons.apps_default;

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
         <overlay>
            <image
               $type="overlay"
               tooltipText={client.title}
               halign={Gtk.Align.CENTER}
               valign={Gtk.Align.CENTER}
               iconName={iconName}
               pixelSize={18}
            />
            <box
               class="indicator"
               valign={config.bar.position.as((p) =>
                  p === "top" ? Gtk.Align.START : Gtk.Align.END,
               )}
               halign={Gtk.Align.CENTER}
               visible={hasWindow}
            />
         </overlay>
      </box>
   );
}

function WorkspaceButton({ ws }: { ws: AstalHyprland.Workspace }) {
   const classNames = createBinding(hyprland, "focusedWorkspace").as((fws) => {
      const classes = ["bar-item"];

      const active = fws.id == ws.id;
      active && classes.push("active");

      return classes;
   });

   return (
      <BarItem cssClasses={classNames} onPrimaryClick={() => ws.focus()}>
         <label class={"workspace"} label={ws.id.toString()} />
         {config.bar.workspaces.taskbar.get() && (
            <For
               each={createBinding(hyprland, "clients").as((clients) =>
                  clients
                     .filter((w) => w.workspace.id == ws.id)
                     .sort((a, b) => a.pid - b.pid),
               )}
            >
               {(client: AstalHyprland.Client) => {
                  for (const app of application.list) {
                     if (
                        client.class &&
                        app.entry
                           .split(".desktop")[0]
                           .toLowerCase()
                           .match(client.class.toLowerCase())
                     ) {
                        return <AppButton app={app} client={client} />;
                     }
                  }
                  return <AppButton client={client} />;
               }}
            </For>
         )}
      </BarItem>
   );
}

function Workspaces({ monitor }: { monitor: AstalHyprland.Monitor }) {
   const workspaces = createBinding(hyprland, "workspaces").as((workspaces) =>
      workspaces
         .filter((ws) => ws.monitor?.model === monitor.model)
         .sort((a, b) => a.id - b.id),
   );

   return (
      <box
         spacing={theme.bar.spacing}
         class={"workspaces"}
         $={(self) =>
            attachHoverScroll(self, ({ dy }) => {
               if (dy < 0) {
                  hyprland.dispatch("workspace", "+1");
               } else if (dy > 0) {
                  hyprland.dispatch("workspace", "-1");
               }
            })
         }
      >
         <For each={workspaces}>{(ws) => <WorkspaceButton ws={ws} />}</For>
      </box>
   );
}

export function Workspaces_Hypr({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
   const monitors = createBinding(hyprland, "monitors").as((monitors) =>
      monitors.filter((monitor) => monitor.model === gdkmonitor.model),
   );

   return (
      <box>
         <For each={monitors}>
            {(monitor) => <Workspaces monitor={monitor} />}
         </For>
      </box>
   );
}
