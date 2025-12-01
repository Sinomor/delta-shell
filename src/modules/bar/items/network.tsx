import { getNetworkIconBinding } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import { windows_names } from "@/windows";
import AstalNetwork from "gi://AstalNetwork";
import { createBinding, createComputed } from "gnim";
import { isVertical } from "../bar";
import { config } from "@/options";

export function Network() {
   const network = AstalNetwork.get_default();
   const wifi = network.wifi;
   const wired = network.wired;
   const primary = createBinding(network, "primary");
   const connectivity = createBinding(network, "connectivity");
   const device = createComputed(() => {
      connectivity();
      if (primary() === AstalNetwork.Primary.WIRED) {
         if (wired.internet === AstalNetwork.Internet.CONNECTED) {
            return wired.device;
         }
      }
      if (primary() === AstalNetwork.Primary.WIFI) {
         return wifi.device;
      }
   });

   const status = createComputed(() => {
      connectivity();
      if (
         primary() === AstalNetwork.Primary.WIRED &&
         network.wired.internet === AstalNetwork.Internet.CONNECTED
      )
         return "On";
      if (wifi !== null) return wifi.enabled ? "On" : "Off";
      return "";
   });

   const ifname = device((d) => (d ? d.interface.toString() : ""));

   const essid = createComputed(() => {
      device();
      if (primary() === AstalNetwork.Primary.WIFI) {
         return wifi.ssid;
      }
      return "";
   });

   const strength = createComputed(() => {
      device();
      if (primary() === AstalNetwork.Primary.WIFI) {
         return wifi.strength.toString();
      }
      return "";
   });

   const frequency = createComputed(() => {
      device();
      if (primary() === AstalNetwork.Primary.WIFI) {
         return (wifi.frequency / 1000).toFixed(1).toString();
      }
      return "";
   });

   return (
      <BarItem
         window={windows_names.network}
         onPrimaryClick={config.bar.modules.network["on-click"]}
         onSecondaryClick={config.bar.modules.network["on-click-right"]}
         onMiddleClick={config.bar.modules.network["on-click-middle"]}
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
                  label={status}
                  hexpand={isVertical}
                  visible={status((status) => status !== "")}
               />
            ),
            ifname: <label label={ifname} hexpand={isVertical} />,
            essid: (
               <label
                  label={essid}
                  visible={essid((essid) => essid !== "")}
                  hexpand={isVertical}
               />
            ),
            strength: (
               <label
                  label={strength}
                  visible={strength((strength) => strength !== "")}
                  hexpand={isVertical}
               />
            ),
            frequency: (
               <label
                  label={frequency}
                  visible={frequency((frequency) => frequency !== "")}
                  hexpand={isVertical}
               />
            ),
         }}
         format={config.bar.modules.network.format}
      />
   );
}
