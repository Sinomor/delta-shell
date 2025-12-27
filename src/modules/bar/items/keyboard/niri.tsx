import AstalNiri from "gi://AstalNiri";
import { bash } from "@/src/lib/utils";
import { createBinding, createState, onCleanup } from "ags";
import { compositor, config, theme } from "@/options";
import BarItem from "@/src/widgets/baritem";
import { isVertical } from "../../bar";
import { icons } from "@/src/lib/icons";
const niri = compositor.peek() === "niri" ? AstalNiri.get_default() : null;

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
   if (!niri) {
      console.warn("Bar: keyboard module skipped: niri is not active");
      return <box visible={false} />;
   }
   const conf = config.bar.modules.keyboard;
   updateLayout();
   let niriconnect: number;

   onCleanup(() => {
      if (niriconnect) niri.disconnect(niriconnect);
   });

   return (
      <BarItem
         onPrimaryClick={conf["on-click"]}
         onSecondaryClick={conf["on-click-right"]}
         onMiddleClick={conf["on-click-middle"]}
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
                  pixelSize={theme["icon-size"].normal}
               />
            ),
         }}
         format={conf.format}
      />
   );
}
