import { compositor } from "@/options";
import { KeyboardNiri } from "./keyboard/niri";
import { KeyboardHypr } from "./keyboard/hypr";
import { With } from "ags";

export function Keyboard() {
   return (
      <box>
         <With value={compositor}>
            {(comp) => {
               if (comp === "niri") return <KeyboardNiri />;
               if (comp === "hyprland") return <KeyboardHypr />;
               return <box />;
            }}
         </With>
      </box>
   );
}
