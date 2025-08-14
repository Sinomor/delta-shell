import { compositor } from "@/options";
import { Keyboard_Niri } from "./keyboard_niri";
import { Keyboard_Hypr } from "./keyboard_hypr";
import { With } from "ags";

export function Keyboard() {
   return (
      <box>
         <With value={compositor}>
            {(comp) => {
               if (comp === "niri") return <Keyboard_Niri />;
               if (comp === "hyprland") return <Keyboard_Hypr />;
               return <box />;
            }}
         </With>
      </box>
   );
}
