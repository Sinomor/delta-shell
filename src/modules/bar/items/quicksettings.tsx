import { icons } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import { windows_names } from "@/windows";
import { isVertical } from "../bar";
import { config } from "@/options";

export function QuickSettings() {
   return (
      <BarItem
         window={windows_names.quicksettings}
         onPrimaryClick={config.bar.modules.quicksettings["on-click"]}
         onSecondaryClick={config.bar.modules.quicksettings["on-click-right"]}
         onMiddleClick={config.bar.modules.quicksettings["on-click-middle"]}
         data={{
            icon: (
               <image
                  hexpand={isVertical}
                  pixelSize={20}
                  iconName={icons.settings}
               />
            ),
         }}
         format={config.bar.modules.quicksettings.format}
      />
   );
}
