import { icons } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import { windows_names } from "@/windows";
import { config } from "@/options";
import { isVertical } from "../bar";

export function Clipboard() {
   return (
      <BarItem
         window={windows_names.clipboard}
         onPrimaryClick={config.bar.modules.clipboard["on-click"]}
         onSecondaryClick={config.bar.modules.clipboard["on-click-right"]}
         onMiddleClick={config.bar.modules.clipboard["on-click-middle"]}
         data={{
            icon: (
               <image
                  hexpand={isVertical}
                  iconName={icons.clipboard}
                  pixelSize={20}
               />
            ),
         }}
         format={config.bar.modules.clipboard.format}
      />
   );
}
