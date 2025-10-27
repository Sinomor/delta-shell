import AstalNiri from "gi://AstalNiri";
import { bash } from "@/src/lib/utils";
import { createState, onCleanup } from "ags";
import { compositor, config } from "@/options";
import BarItem from "@/src/widgets/baritem";
import { isVertical } from "../../bar";
import { icons } from "@/src/lib/icons";

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
   const niri = AstalNiri.get_default();
   let niriconnect: number;

   onCleanup(() => {
      if (niriconnect) niri.disconnect(niriconnect);
   });

   return (
      <BarItem
         onPrimaryClick={config.bar.modules.keyboard["on-click"].get()}
         onSecondaryClick={config.bar.modules.keyboard["on-click-right"].get()}
         onMiddleClick={config.bar.modules.keyboard["on-click-middle"].get()}
         $={() => {
            niriconnect = niri.connect("keyboard-layout-switched", () => {
               updateLayout();
            });
         }}
         data={{
            lang: <label hexpand={isVertical} label={layout_name} />,
            icon: (
               <image
                  hexpand={isVertical}
                  iconName={icons.keyboard}
                  pixelSize={20}
               />
            ),
         }}
         format={config.bar.modules.keyboard.format.get()}
      />
   );
}
