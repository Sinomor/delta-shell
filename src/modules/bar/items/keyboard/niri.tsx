import AstalNiri from "gi://AstalNiri";
import { bash } from "@/src/lib/utils";
import { createState, onCleanup } from "ags";
import { compositor } from "@/options";
import BarItem from "@/src/widgets/baritem";
const niri = AstalNiri.get_default();

const [layout_name, layout_name_set] = createState("?");

function updateLayout() {
   bash(`niri msg keyboard-layouts | grep "*"`)
      .then((layout) => {
         if (layout.includes("English")) {
            layout_name_set("En");
         } else if (layout.includes("Russian")) {
            layout_name_set("Ru");
         } else {
            layout_name_set("?");
         }
      })
      .catch((err) => {
         print(`Failed to get keyboard layout: ${err}`);
      });
}
if (compositor.get() === "niri") updateLayout();

export function Keyboard_Niri() {
   let niriconnect: number;

   onCleanup(() => {
      if (niriconnect) niri.disconnect(niriconnect);
   });

   return (
      <BarItem
         onPrimaryClick={() => bash("niri msg action switch-layout next")}
         $={() => {
            niriconnect = niri.connect("keyboard-layout-switched", () => {
               updateLayout();
            });
         }}
      >
         <label label={layout_name((s) => s)} />
      </BarItem>
   );
}
