import { config } from "@/options";
import { icons } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import { windows_names } from "@/windows";
import AstalBluetooth from "gi://AstalBluetooth";
import { createBinding, createComputed } from "gnim";
import { isVertical } from "../bar";

export function Bluetooth() {
   const bluetooth = AstalBluetooth.get_default();
   const connected = createBinding(bluetooth, "isConnected");
   const powered = createBinding(bluetooth, "isPowered");
   const devices = createBinding(bluetooth, "devices");
   const adapter = createBinding(bluetooth, "adapter");
   const device = createComputed(
      () => (connected(), devices().find((device) => device.connected)),
   );

   return (
      <BarItem
         window={windows_names.bluetooth}
         onPrimaryClick={config.bar.modules.bluetooth["on-click"]}
         onSecondaryClick={config.bar.modules.bluetooth["on-click-right"]}
         onMiddleClick={config.bar.modules.bluetooth["on-click-middle"]}
         data={{
            icon: <image hexpand={isVertical} iconName={icons.bluetooth} />,
            status: (
               <label
                  label={powered((v) => (v ? "On" : "Off"))}
                  hexpand={isVertical}
               />
            ),
            "controller-address": (
               <label
                  label={adapter((adapter) => adapter.address)}
                  hexpand={isVertical}
               />
            ),
            "controller-alias": (
               <label
                  label={adapter((adapter) => adapter.alias)}
                  hexpand={isVertical}
               />
            ),
            "device-address": (
               <label
                  label={device((d) => (d ? d.address : ""))}
                  visible={connected}
                  hexpand={isVertical}
               />
            ),
            "device-alias": (
               <label
                  label={device((d) => (d ? d.alias : ""))}
                  visible={connected}
                  hexpand={isVertical}
               />
            ),
         }}
         format={config.bar.modules.bluetooth.format}
      />
   );
}
