import BarItem from "@/src/widgets/baritem";
import AstalWp from "gi://AstalWp";
import { Gtk } from "ags/gtk4";
import { VolumeIcon } from "@/src/lib/icons";
import { windows_names } from "@/windows";
import { isVertical } from "../bar";
import { config } from "@/options";
import { createBinding } from "gnim";

export function Volume() {
   const conf = config.bar.modules.volume;
   const speaker = AstalWp.get_default()?.get_default_speaker();
   const volume = createBinding(speaker, "volume");

   return (
      <BarItem
         window={windows_names.volume}
         onPrimaryClick={conf["on-click"]}
         onSecondaryClick={conf["on-click-right"]}
         onMiddleClick={conf["on-click-middle"]}
         onScrollUp={conf["on-scroll-up"]}
         onScrollDown={conf["on-scroll-down"]}
         data={{
            icon: (
               <image
                  hexpand={isVertical}
                  iconName={VolumeIcon}
                  pixelSize={config.bar.icon_size}
               />
            ),
            percent: (
               <label
                  hexpand={isVertical}
                  label={volume((v) => Math.floor(v * 100).toString())}
               />
            ),
         }}
         format={conf.format}
      />
   );
}
