import AstalBattery from "gi://AstalBattery";
import { BatteryIcon } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import { createBinding } from "gnim";
import { hide_all_windows, windows_names } from "@/windows";
import app from "ags/gtk4/app";
import { toggleWindow } from "@/src/lib/utils";
import { isVertical } from "../bar";
import { config } from "@/options";
const battery = AstalBattery.get_default();

export function Battery() {
   return (
      <BarItem
         window={windows_names.power}
         onPrimaryClick={config.bar.modules.battery["on-click"].get()}
         onSecondaryClick={config.bar.modules.battery["on-click-right"].get()}
         onMiddleClick={config.bar.modules.battery["on-click-middle"].get()}
         data={{
            icon: (
               <image
                  hexpand={isVertical}
                  visible={createBinding(battery, "isPresent")}
                  pixelSize={20}
                  iconName={BatteryIcon}
               />
            ),
            percent: (
               <label
                  label={createBinding(battery, "percentage").as(
                     (p) => `${Math.floor(p * 100)}`,
                  )}
                  hexpand={isVertical}
               />
            ),
         }}
         format={config.bar.modules.battery.format.get()}
      />
   );
}
