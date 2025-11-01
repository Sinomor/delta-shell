import { getNetworkIconBinding } from "@/src/lib/icons";
import { toggleWindow } from "@/src/lib/utils";
import BarItem from "@/src/widgets/baritem";
import { hide_all_windows, windows_names } from "@/windows";
import app from "ags/gtk4/app";
import AstalNetwork from "gi://AstalNetwork";
import { createBinding, createComputed } from "gnim";
import { isVertical } from "../bar";
import { config } from "@/options";
const network = AstalNetwork.get_default();

export function Network() {
   const wifi = network.wifi;
   const wired = network.wired;

   const ifname = createComputed(
      [
         createBinding(network, "primary"),
         createBinding(network, "connectivity"),
      ],
      (primary, connectivity) => {
         if (primary === AstalNetwork.Primary.WIRED) {
            if (wired.internet === AstalNetwork.Internet.CONNECTED) {
               return wired.device.interface;
            }
         }
         if (primary === AstalNetwork.Primary.WIFI) {
            return wifi.device.interface;
         }
         return "N/A";
      },
   );

   const essid = createComputed(
      [
         createBinding(network, "primary"),
         createBinding(network, "connectivity"),
      ],
      (primary, connectivity) => {
         if (primary === AstalNetwork.Primary.WIFI) {
            return wifi.ssid;
         }
         return "N/A";
      },
   );

   const strength = createComputed(
      [
         createBinding(network, "primary"),
         createBinding(network, "connectivity"),
      ],
      (primary, connectivity) => {
         if (primary === AstalNetwork.Primary.WIFI) {
            return wifi.strength.toString();
         }
         return "N/A";
      },
   );

   const frequency = createComputed(
      [
         createBinding(network, "primary"),
         createBinding(network, "connectivity"),
      ],
      (primary, connectivity) => {
         if (primary === AstalNetwork.Primary.WIFI) {
            return `${(wifi.frequency / 1000).toFixed(1)}`;
         }
         return "N/A";
      },
   );

   return (
      <BarItem
         window={windows_names.network}
         onPrimaryClick={config.bar.modules.network["on-click"].get()}
         onSecondaryClick={config.bar.modules.network["on-click-right"].get()}
         onMiddleClick={config.bar.modules.network["on-click-middle"].get()}
         data={{
            icon: (
               <image
                  hexpand={isVertical}
                  pixelSize={20}
                  iconName={getNetworkIconBinding()}
               />
            ),
            status: (
               <label
                  label={createComputed(
                     [
                        createBinding(network, "primary"),
                        ...(network.wifi !== null
                           ? [createBinding(network.wifi, "enabled")]
                           : []),
                     ],
                     (primary, enabled) => {
                        if (
                           primary === AstalNetwork.Primary.WIRED &&
                           network.wired.internet ===
                              AstalNetwork.Internet.CONNECTED
                        )
                           return "On";
                        return enabled ? "On" : "Off";
                     },
                  )}
                  hexpand={isVertical}
               />
            ),
            ifname: <label label={ifname} hexpand={isVertical} />,
            essid: (
               <label
                  label={essid}
                  visible={essid.as((essid) => essid !== "N/A")}
                  hexpand={isVertical}
               />
            ),
            strength: (
               <label
                  label={strength}
                  visible={strength.as((strength) => strength !== "N/A")}
                  hexpand={isVertical}
               />
            ),
            frequency: (
               <label
                  label={frequency}
                  visible={frequency.as((frequency) => frequency !== "N/A")}
                  hexpand={isVertical}
               />
            ),
         }}
         format={config.bar.modules.network.format.get()}
      />
   );
}
