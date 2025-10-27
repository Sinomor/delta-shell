import BarItem from "@/src/widgets/baritem";
import AstalWp from "gi://AstalWp";
const speaker = AstalWp.get_default()?.get_default_speaker();
import { Gtk } from "ags/gtk4";
import { VolumeIcon } from "@/src/lib/icons";
import { hide_all_windows, windows_names } from "@/windows";
import { toggleWindow } from "@/src/lib/utils";
import app from "ags/gtk4/app";
import { isVertical } from "../bar";
import { config } from "@/options";
import { createBinding } from "gnim";

export function Volume() {
   return (
      <BarItem
         window={windows_names.volume}
         onPrimaryClick={config.bar.modules.volume["on-click"].get()}
         onSecondaryClick={config.bar.modules.volume["on-click-right"].get()}
         onMiddleClick={config.bar.modules.volume["on-click-middle"].get()}
         onScrollUp={config.bar.modules.volume["on-scroll-up"].get()}
         onScrollDown={config.bar.modules.volume["on-scroll-down"].get()}
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
                  label={createBinding(speaker, "volume").as((volume) =>
                     Math.floor(volume * 100).toString(),
                  )}
               />
            ),
         }}
         format={config.bar.modules.volume.format.get()}
      />
   );
}
