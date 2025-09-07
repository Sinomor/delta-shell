import { compositor } from "@/options";
import { Keyboard_Niri } from "./keyboard/niri";
import { Keyboard_Hypr } from "./keyboard/hypr";
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
