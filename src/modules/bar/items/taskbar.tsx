import { compositor } from "@/options";
import { With } from "ags";
import { Gdk } from "ags/gtk4";
import { TaskbarNiri } from "./taskbar/niri";

export function Taskbar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
   return (
      <box>
         <With value={compositor}>
            {(comp) => {
               if (comp === "niri")
                  return <TaskbarNiri gdkmonitor={gdkmonitor} />;
               console.warn(
                  `Bar: workspaces module skipped: compositor ${compositor} not supported`,
               );
               return <box visible={false} />;
            }}
         </With>
      </box>
   );
}
