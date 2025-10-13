import { theme } from "@/options";
import { icons } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import AstalBluetooth from "gi://AstalBluetooth";
import { createBinding, createComputed } from "gnim";
const bluetooth = AstalBluetooth.get_default();

export function Bluetooth() {
   const bluetoothconnected = createComputed(
      [
         createBinding(bluetooth, "devices"),
         createBinding(bluetooth, "isConnected"),
      ],
      (d, _) => {
         for (const device of d) {
            if (device.connected) return true;
         }
         return false;
      },
   );
   return (
      <BarItem>
         <image iconName={icons.bluetooth} />
      </BarItem>
   );
}
