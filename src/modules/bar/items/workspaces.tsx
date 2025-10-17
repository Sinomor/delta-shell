import { compositor } from "@/options";
import { Workspaces_Niri } from "./workspaces/niri";
import { Workspaces_Hypr } from "./workspaces/hypr";
import { With } from "ags";
import { Gdk } from "ags/gtk4";

export function Workspaces({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
   return (
      <box>
         <With value={compositor}>
            {(comp) => {
               if (comp === "niri")
                  return <Workspaces_Niri gdkmonitor={gdkmonitor} />;
               if (comp === "hyprland")
                  return <Workspaces_Hypr gdkmonitor={gdkmonitor} />;
               return <box />;
            }}
         </With>
      </box>
   );
}
