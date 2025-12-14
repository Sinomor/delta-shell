import AstalBattery from "gi://AstalBattery";
import { BatteryIcon } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import { createBinding } from "gnim";
import { windows_names } from "@/windows";
import { isVertical } from "../bar";
import { config } from "@/options";

export function Battery() {
   const conf = config.bar.modules.battery;
   const battery = AstalBattery.get_default();
   const percentage = createBinding(battery, "percentage");

   return (
      <BarItem
         window={windows_names.power}
         onPrimaryClick={conf["on-click"]}
         onSecondaryClick={conf["on-click-right"]}
         onMiddleClick={conf["on-click-middle"]}
         visible={createBinding(battery, "isPresent")}
         data={{
            icon: (
               <image
                  hexpand={isVertical}
                  pixelSize={20}
                  iconName={BatteryIcon}
               />
            ),
            percent: (
               <label
                  label={percentage((v) => Math.floor(v * 100).toString())}
                  hexpand={isVertical}
               />
            ),
         }}
         format={conf.format}
      />
   );
}
