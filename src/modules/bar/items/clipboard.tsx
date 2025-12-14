import { icons } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import { windows_names } from "@/windows";
import { config } from "@/options";
import { isVertical } from "../bar";

export function Clipboard() {
   const conf = config.bar.modules.clipboard;

   return (
      <BarItem
         window={windows_names.clipboard}
         onPrimaryClick={conf["on-click"]}
         onSecondaryClick={conf["on-click-right"]}
         onMiddleClick={conf["on-click-middle"]}
         data={{
            icon: (
               <image
                  hexpand={isVertical}
                  iconName={icons.clipboard}
                  pixelSize={20}
               />
            ),
         }}
         format={conf.format}
      />
   );
}
