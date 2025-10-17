import { Astal, Gdk, Gtk } from "ags/gtk4";
import AstalNiri from "gi://AstalNiri";
import AstalApps from "gi://AstalApps";
import { createBinding, createComputed, For } from "ags";
import { compositor, config, theme } from "@/options";
import { attachHoverScroll, bash, getAppInfo } from "@/src/lib/utils";
import { icons } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
const niri = AstalNiri.get_default();
const apps_icons = config.bar.workspaces.taskbar_icons.get();

type AppButtonProps = {
   app?: AstalApps.Application;
   client: AstalNiri.Window;
};

const application = new AstalApps.Apps();

function AppButton({ client }: AppButtonProps) {
   const classes = createBinding(niri, "focusedWindow").as((fcsClient) => {
      const classes = ["taskbar-button"];
      if (!fcsClient || !client.app_id || !fcsClient.app_id) return classes;
      const isFocused = fcsClient.id === client?.id;
      if (isFocused) classes.push("focused");
      return classes;
   });

   const appInfo = getAppInfo(client.app_id);
   const iconName = apps_icons[client.app_id] || appInfo.iconName;

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
         <overlay>
            <image
               $type="overlay"
               tooltipText={client.title}
               halign={Gtk.Align.CENTER}
               valign={Gtk.Align.CENTER}
               iconName={iconName}
               pixelSize={20}
            />
            <box
               class="indicator"
               valign={config.bar.position.as((p) =>
                  p === "top" ? Gtk.Align.START : Gtk.Align.END,
               )}
               halign={Gtk.Align.CENTER}
            />
         </overlay>
      </box>
   );
}

function WorkspaceButton({ ws }: { ws: AstalNiri.Workspace }) {
   const classNames = createBinding(niri, "focusedWorkspace").as((fws) => {
      const classes = ["bar-item"];

      const active = fws?.id == ws.id;
      if (active) {
         classes.push("active");
      }

      return classes;
   });

   return (
      <BarItem cssClasses={classNames} onPrimaryClick={() => ws.focus()}>
         <label class={"workspace"} label={ws.idx.toString()} />
         {config.bar.workspaces.taskbar.get() && (
            <For
               each={createBinding(ws, "windows").as((clients) =>
                  clients.sort((a, b) => a.id - b.id),
               )}
            >
               {(client: AstalNiri.Window) => <AppButton client={client} />}
            </For>
         )}
      </BarItem>
   );
}

function Workspaces({ output }: { output: AstalNiri.Output }) {
   const workspaces = createBinding(output, "workspaces").as((workspaces) =>
      workspaces.sort((a, b) => a.id - b.id),
   );

   return (
      <box
         spacing={theme.bar.spacing}
         class={"workspaces"}
         $={(self) =>
            attachHoverScroll(self, ({ dy }) => {
               if (dy < 0) {
                  AstalNiri.msg.focus_workspace_up();
               } else if (dy > 0) {
                  AstalNiri.msg.focus_workspace_down();
               }
            })
         }
      >
         <For each={workspaces}>{(ws) => <WorkspaceButton ws={ws} />}</For>
      </box>
   );
}

export function Workspaces_Niri({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
   const outputs = createBinding(niri, "outputs").as((outputs) =>
      outputs.filter((output) => output.model === gdkmonitor.model),
   );

   return (
      <box>
         <For each={outputs}>{(output) => <Workspaces output={output} />}</For>
      </box>
   );
}
