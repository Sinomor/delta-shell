import { icons } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import { windows_names } from "@/windows";
import { config, theme } from "@/options";
import { isVertical } from "../bar";

export function PowerMenu() {
   const conf = config.bar.modules.powermenu;

   return (
      <BarItem
         window={windows_names.powermenu}
         onPrimaryClick={conf["on-click"]}
         onSecondaryClick={conf["on-click-right"]}
         onMiddleClick={conf["on-click-middle"]}
         data={{
            icon: (
               <image
                  hexpand={isVertical}
                  iconName={icons.powermenu.shutdown}
                  pixelSize={theme["icon-size"].normal}
               />
            ),
         }}
         format={conf.format}
      />
   );
}
