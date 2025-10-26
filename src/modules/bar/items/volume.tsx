import BarItem from "@/src/widgets/baritem";
import AstalWp from "gi://AstalWp";
const speaker = AstalWp.get_default()?.get_default_speaker();
import { Gtk } from "ags/gtk4";
import { VolumeIcon } from "@/src/lib/icons";
import { hide_all_windows, windows_names } from "@/windows";
import { toggleWindow } from "@/src/lib/utils";
import app from "ags/gtk4/app";
import { isVertical } from "../bar";

export function Volume() {
   return (
      <BarItem
         window={windows_names.volume}
         onPrimaryClick={() => toggleWindow(windows_names.volume)}
         hexpand={isVertical}
      >
         <Gtk.EventControllerScroll
            flags={Gtk.EventControllerScrollFlags.VERTICAL}
            onScroll={(event, dx, dy) => {
               if (dy < 0) speaker.set_volume(speaker.volume + 0.01);
               else if (dy > 0) speaker.set_volume(speaker.volume - 0.01);
            }}
         />
         <image hexpand={isVertical} iconName={VolumeIcon} pixelSize={20} />
      </BarItem>
   );
}
