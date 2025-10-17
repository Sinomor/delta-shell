import { theme } from "@/options";
import { NetworkModule } from "@/src/modules/network/network";
import { Gtk } from "ags/gtk4";

export function NetworkPage() {
   return (
      <box
         $type={"named"}
         name={"network"}
         class={"qs-menu-page"}
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
      >
         <NetworkModule showArrow={true} />
      </box>
   );
}
