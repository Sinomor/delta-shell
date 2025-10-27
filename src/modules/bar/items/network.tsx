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
         }}
         format={config.bar.modules.network.format.get()}
      />
   );
}
