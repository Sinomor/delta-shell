import { compositor } from "@/options";
import { WorkspacesNiri } from "./workspaces/niri";
import { WorkspacesHypr } from "./workspaces/hypr";
import { With } from "ags";
import { Gdk } from "ags/gtk4";

export function Workspaces({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
   return (
      <box>
         <With value={compositor}>
            {(comp) => {
               if (comp === "niri")
                  return <WorkspacesNiri gdkmonitor={gdkmonitor} />;
               if (comp === "hyprland")
                  return <WorkspacesHypr gdkmonitor={gdkmonitor} />;
               return <box />;
            }}
         </With>
      </box>
   );
}
