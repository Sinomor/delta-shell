import { config, theme } from "@/options";
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
         onPrimaryClick={config.bar.modules.bluetooth["on-click"].get()}
         onSecondaryClick={config.bar.modules.bluetooth["on-click-right"].get()}
         onMiddleClick={config.bar.modules.bluetooth["on-click-middle"].get()}
         data={{
            icon: <image hexpand={isVertical} iconName={icons.bluetooth} />,
            status: (
               <label
                  label={createBinding(bluetooth, "isPowered").as((v) =>
                     v ? "On" : "Off",
                  )}
               />
            ),
            "controller-address": (
               <label
                  label={createBinding(bluetooth, "adapter").as((adapter) =>
                     adapter.address.toString(),
                  )}
               />
            ),
            "controller-alias": (
               <label
                  label={createBinding(bluetooth, "adapter").as((adapter) =>
                     adapter.alias.toString(),
                  )}
               />
            ),
            "device-address": (
               <label
                  label={createBinding(bluetooth, "devices").as((d) => {
                     for (const device of d) {
                        if (device.connected) return device.address;
                     }
                     return "";
                  })}
                  visible={bluetoothconnected}
               />
            ),
            "device-alias": (
               <label
                  label={createBinding(bluetooth, "devices").as((d) => {
                     for (const device of d) {
                        if (device.connected) return device.alias;
                     }
                     return "";
                  })}
                  visible={bluetoothconnected}
               />
            ),
         }}
         format={config.bar.modules.bluetooth.format.get()}
      />
   );
}
