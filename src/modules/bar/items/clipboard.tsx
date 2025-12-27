import { icons } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import { windows_names } from "@/windows";
import { config, theme } from "@/options";
import { isVertical } from "../bar";
import { dependencies } from "@/src/lib/utils";

export function Clipboard() {
   if (!config.clipboard.enabled) {
      console.warn(
         "Bar: module clipboard requires config.clipboard.enabled = true",
      );
      return <box visible={false} />;
   }
   if (!dependencies("wl-paste", "cliphist")) {
      console.warn("Bar: module clipboard requires cliphist to be installed");
   }
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
                  pixelSize={theme["icon-size"].normal}
               />
            ),
         }}
         format={conf.format}
      />
   );
}
