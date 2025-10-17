import { theme } from "@/options";
import { Gtk } from "ags/gtk4";
import { PowerModule } from "../../power/power";

export function PowerPage() {
   return (
      <box
         $type={"named"}
         name={"power"}
         class={"qs-menu-page"}
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
      >
         <PowerModule showArrow={true} />
      </box>
   );
}
