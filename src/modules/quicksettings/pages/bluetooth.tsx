import { theme } from "@/options";
import { Gtk } from "ags/gtk4";
import { BluetoothModule } from "../../bluetooth/bluetooth";

export function BluetoothPage() {
   return (
      <box
         $type={"named"}
         name={"bluetooth"}
         class={"qs-menu-page"}
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
      >
         <BluetoothModule showArrow={true} />
      </box>
   );
}
