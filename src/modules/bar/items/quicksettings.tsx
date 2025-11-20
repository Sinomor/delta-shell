import { icons } from "@/src/lib/icons";
import app from "ags/gtk4/app";
import BarItem from "@/src/widgets/baritem";
import { hide_all_windows, windows_names } from "@/windows";
import { toggleWindow } from "@/src/lib/utils";
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
