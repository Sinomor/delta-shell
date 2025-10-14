import AstalBattery from "gi://AstalBattery";
import { BatteryIcon } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import { createBinding } from "gnim";
import { hide_all_windows, windows_names } from "@/windows";
import app from "ags/gtk4/app";
import { toggleWindow } from "@/src/lib/utils";
const battery = AstalBattery.get_default();

export function Battery() {
   return (
      <BarItem
         window={windows_names.power}
         onPrimaryClick={() => {
            if (!app.get_window(windows_names.power)?.visible)
               hide_all_windows();
            toggleWindow(windows_names.power);
         }}
      >
         <image
            visible={createBinding(battery, "isPresent")}
            pixelSize={20}
            iconName={BatteryIcon}
         />
      </BarItem>
   );
}
