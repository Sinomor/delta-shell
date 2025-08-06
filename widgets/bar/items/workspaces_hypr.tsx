import { Gdk, Gtk } from "ags/gtk4";
import { range } from "../../../utils/utils";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import AstalApps from "gi://AstalApps?version=0.1";
import { createBinding, createComputed, For } from "ags";
import { icons } from "@/utils/icons";
import BarItem from "@/widgets/common/baritem";
import { config, theme } from "@/options";
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
   const clients = createBinding(hyprland, "clients").as((clients) =>
      clients
         .filter((w) => w.workspace.id == ws.id)
         .sort((a, b) => a.pid - b.pid),
   );

   const classNames = createBinding(hyprland, "focusedWorkspace").as((fws) => {
      const classes = ["bar-item"];

      const active = fws.id == ws.id;
      active && classes.push("active");

      return classes;
   });

   return (
      <BarItem cssClasses={classNames} onPrimaryClick={() => ws.focus()}>
         <label class={"workspace"} label={ws.id.toString()} />
         <For each={clients}>
            {(client) => {
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
      </BarItem>
   );
}

export function Workspaces_Hypr() {
   const workspaces = createBinding(hyprland, "workspaces").as((workspaces) =>
      workspaces.sort((a, b) => a.id - b.id),
   );
   let lastScrollTime = 0;
   const scrollDelay = 400;

   return (
      <box spacing={theme.bar.spacing} class={"workspaces"}>
         <Gtk.EventControllerScroll
            flags={Gtk.EventControllerScrollFlags.VERTICAL}
            onScroll={(event, dx, dy) => {
               const now = Date.now();
               if (now - lastScrollTime < scrollDelay) return;

               lastScrollTime = now;

               if (dy < 0) {
                  hyprland.dispatch("workspace", "+1");
               } else if (dy > 0) {
                  hyprland.dispatch("workspace", "-1");
               }
            }}
         />
         <For each={workspaces}>{(ws) => <WorkspaceButton ws={ws} />}</For>
      </box>
   );
}
