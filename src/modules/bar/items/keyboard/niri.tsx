import AstalNiri from "gi://AstalNiri";
import { bash } from "@/src/lib/utils";
import { createBinding, createEffect, createState, onCleanup } from "ags";
import { compositor, config } from "@/options";
import BarItem from "@/src/widgets/baritem";
import { isVertical } from "../../bar";
import { icons } from "@/src/lib/icons";

const [layout_name, layout_name_set] = createState("?");

function updateLayout() {
   bash(`niri msg keyboard-layouts | grep "*"`)
      .then((layout) => {
         const match = layout.match(/\* \d+ ([A-Za-z]+)/)!;
         if (layout.includes("English")) {
            layout_name_set("En");
         } else if (layout.includes("Russian")) {
            layout_name_set("Ru");
         } else {
            layout_name_set(match[1].substring(0, 2));
         }
      })
      .catch((err) => {
         print(`Failed to get keyboard layout: ${err}`);
      });
}

export function KeyboardNiri() {
   const niri = AstalNiri.get_default();
   updateLayout();
   let niriconnect: number;

   onCleanup(() => {
      if (niriconnect) niri.disconnect(niriconnect);
   });

   return (
      <BarItem
         onPrimaryClick={config.bar.modules.keyboard["on-click"]}
         onSecondaryClick={config.bar.modules.keyboard["on-click-right"]}
         onMiddleClick={config.bar.modules.keyboard["on-click-middle"]}
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
         format={config.bar.modules.keyboard.format}
      />
   );
}
