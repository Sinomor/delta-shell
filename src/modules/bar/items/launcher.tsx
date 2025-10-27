import { icons } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import { windows_names } from "@/windows";
import { config } from "@/options";
import { isVertical } from "../bar";

export function Launcher() {
   return (
      <BarItem
         window={windows_names.applauncher}
         onPrimaryClick={config.bar.modules.launcher["on-click"].get()}
         onSecondaryClick={config.bar.modules.launcher["on-click-right"].get()}
         onMiddleClick={config.bar.modules.launcher["on-click-middle"].get()}
         data={{
            icon: (
               <image
                  hexpand={isVertical}
                  iconName={icons.search}
                  pixelSize={20}
               />
            ),
         }}
         format={config.bar.modules.launcher.format.get()}
      />
   );
}
