import { icons } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import { windows_names } from "@/windows";
import { config } from "@/options";
import { isVertical } from "../bar";

export function Launcher() {
   const conf = config.bar.modules.launcher;

   return (
      <BarItem
         window={windows_names.applauncher}
         onPrimaryClick={conf["on-click"]}
         onSecondaryClick={conf["on-click-right"]}
         onMiddleClick={conf["on-click-middle"]}
         data={{
            icon: (
               <image
                  hexpand={isVertical}
                  iconName={icons.search}
                  pixelSize={20}
               />
            ),
         }}
         format={conf.format}
      />
   );
}
