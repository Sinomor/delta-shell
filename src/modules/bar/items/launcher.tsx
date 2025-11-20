import { icons } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import { windows_names } from "@/windows";
import { config } from "@/options";
import { isVertical } from "../bar";

export function Launcher() {
   return (
      <BarItem
         window={windows_names.applauncher}
         onPrimaryClick={config.bar.modules.launcher["on-click"]}
         onSecondaryClick={config.bar.modules.launcher["on-click-right"]}
         onMiddleClick={config.bar.modules.launcher["on-click-middle"]}
         data={{
            icon: (
               <image
                  hexpand={isVertical}
                  iconName={icons.search}
                  pixelSize={20}
               />
            ),
         }}
         format={config.bar.modules.launcher.format}
      />
   );
}
