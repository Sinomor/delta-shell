import BarItem from "@/src/widgets/baritem";
import AstalWp from "gi://AstalWp";
const speaker = AstalWp.get_default()?.get_default_speaker();
import { Gtk } from "ags/gtk4";
import { VolumeIcon } from "@/src/lib/icons";

export function Volume() {
   return (
      <BarItem>
         <Gtk.EventControllerScroll
            flags={Gtk.EventControllerScrollFlags.VERTICAL}
            onScroll={(event, dx, dy) => {
               if (dy < 0) speaker.set_volume(speaker.volume + 0.01);
               else if (dy > 0) speaker.set_volume(speaker.volume - 0.01);
            }}
         />
         <image iconName={VolumeIcon} pixelSize={20} />
      </BarItem>
   );
}
