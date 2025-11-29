import BarItem from "@/src/widgets/baritem";
import AstalWp from "gi://AstalWp";
import { Gtk } from "ags/gtk4";
import { VolumeIcon } from "@/src/lib/icons";
import { hide_all_windows, windows_names } from "@/windows";
import { toggleWindow } from "@/src/lib/utils";
import app from "ags/gtk4/app";
import { isVertical } from "../bar";
import { config } from "@/options";
import { createBinding } from "gnim";

export function Volume() {
   const speaker = AstalWp.get_default()?.get_default_speaker();
   const volume = createBinding(speaker, "volume");

   return (
      <BarItem
         window={windows_names.volume}
         onPrimaryClick={config.bar.modules.volume["on-click"]}
         onSecondaryClick={config.bar.modules.volume["on-click-right"]}
         onMiddleClick={config.bar.modules.volume["on-click-middle"]}
         onScrollUp={config.bar.modules.volume["on-scroll-up"]}
         onScrollDown={config.bar.modules.volume["on-scroll-down"]}
         data={{
            icon: (
               <image
                  hexpand={isVertical}
                  iconName={VolumeIcon}
                  pixelSize={20}
               />
            ),
            percent: (
               <label
                  hexpand={isVertical}
                  label={volume((v) => Math.floor(v * 100).toString())}
               />
            ),
         }}
         format={config.bar.modules.volume.format}
      />
   );
}
