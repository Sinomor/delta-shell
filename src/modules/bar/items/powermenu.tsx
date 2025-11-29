import { icons } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import { windows_names } from "@/windows";
import { config } from "@/options";
import { isVertical } from "../bar";

export function PowerMenu() {
   return (
      <BarItem
         window={windows_names.powermenu}
         onPrimaryClick={config.bar.modules.powermenu["on-click"]}
         onSecondaryClick={config.bar.modules.powermenu["on-click-right"]}
         onMiddleClick={config.bar.modules.powermenu["on-click-middle"]}
         data={{
            icon: (
               <image
                  hexpand={isVertical}
                  iconName={icons.powermenu.shutdown}
                  pixelSize={20}
               />
            ),
         }}
         format={config.bar.modules.powermenu.format}
      />
   );
}
