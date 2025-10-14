import { theme } from "@/options";
import { Gtk } from "ags/gtk4";
import { VolumeModule } from "../../volume/volume";

export function VolumePage() {
   return (
      <box
         $type={"named"}
         name={"volume"}
         heightRequest={500}
         widthRequest={410}
         cssClasses={["qs-menu-page", "bluetooth-page"]}
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
      >
         <VolumeModule showArrow={true} />
      </box>
   );
}
