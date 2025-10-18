import { getNetworkIconBinding } from "@/src/lib/icons";
import { toggleWindow } from "@/src/lib/utils";
import BarItem from "@/src/widgets/baritem";
import { hide_all_windows, windows_names } from "@/windows";
import app from "ags/gtk4/app";
import AstalNetwork from "gi://AstalNetwork";
import { createBinding, createComputed } from "gnim";
import { isVertical } from "../bar";
const network = AstalNetwork.get_default();

export function Network() {
   return (
      <BarItem
         window={windows_names.network}
         onPrimaryClick={() => {
            if (!app.get_window(windows_names.network)?.visible)
               hide_all_windows();
            toggleWindow(windows_names.network);
         }}
         hexpand={isVertical}
      >
         <image
            hexpand={isVertical}
            visible={createComputed(
               [
                  createBinding(network, "primary"),
                  ...(network.wifi !== null
                     ? [createBinding(network.wifi, "enabled")]
                     : []),
               ],
               (primary, enabled) => {
                  if (
                     primary === AstalNetwork.Primary.WIRED &&
                     network.wired.internet === AstalNetwork.Internet.CONNECTED
                  )
                     return true;
                  return enabled;
               },
            )}
            pixelSize={20}
            iconName={getNetworkIconBinding()}
         />
      </BarItem>
   );
}
