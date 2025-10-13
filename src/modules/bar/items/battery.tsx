import AstalBattery from "gi://AstalBattery";
import { BatteryIcon } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import { createBinding } from "gnim";
const battery = AstalBattery.get_default();

export function Battery() {
   return (
      <BarItem>
         <image
            visible={createBinding(battery, "isPresent")}
            pixelSize={20}
            iconName={BatteryIcon}
         />
      </BarItem>
   );
}
