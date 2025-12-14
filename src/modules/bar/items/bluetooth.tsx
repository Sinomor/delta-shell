import { config } from "@/options";
import { icons } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import { windows_names } from "@/windows";
import AstalBluetooth from "gi://AstalBluetooth";
import { createBinding, createComputed } from "gnim";
import { isVertical } from "../bar";
import { truncateByFormat } from "@/src/lib/utils";

export function Bluetooth() {
   const conf = config.bar.modules.bluetooth;
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
         onPrimaryClick={conf["on-click"]}
         onSecondaryClick={conf["on-click-right"]}
         onMiddleClick={conf["on-click-middle"]}
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
                  label={adapter((a) =>
                     truncateByFormat(
                        a.address,
                        "controller-address",
                        conf.format,
                     ),
                  )}
                  hexpand={isVertical}
               />
            ),
            "controller-alias": (
               <label
                  label={adapter((a) =>
                     truncateByFormat(a.alias, "controller-alias", conf.format),
                  )}
                  hexpand={isVertical}
               />
            ),
            "device-address": (
               <label
                  label={device((d) =>
                     d
                        ? truncateByFormat(
                             d.address,
                             "device-address",
                             conf.format,
                          )
                        : "",
                  )}
                  visible={connected}
                  hexpand={isVertical}
               />
            ),
            "device-alias": (
               <label
                  label={device((d) =>
                     d
                        ? truncateByFormat(d.alias, "device-alias", conf.format)
                        : "",
                  )}
                  visible={connected}
                  hexpand={isVertical}
               />
            ),
         }}
         format={conf.format}
      />
   );
}
