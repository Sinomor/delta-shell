import { theme } from "@/options";
import { icons } from "@/src/lib/icons";
import { toggleWindow } from "@/src/lib/utils";
import BarItem from "@/src/widgets/baritem";
import { hide_all_windows, windows_names } from "@/windows";
import app from "ags/gtk4/app";
import AstalBluetooth from "gi://AstalBluetooth";
import { createBinding, createComputed } from "gnim";
import { isVertical } from "../bar";
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
      <BarItem
         window={windows_names.bluetooth}
         onPrimaryClick={() => {
            if (!app.get_window(windows_names.bluetooth)?.visible)
               hide_all_windows();
            toggleWindow(windows_names.bluetooth);
         }}
         hexpand={isVertical}
      >
         <image hexpand={isVertical} iconName={icons.bluetooth} />
      </BarItem>
   );
}
