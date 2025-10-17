import { theme } from "@/options";
import { Gtk } from "ags/gtk4";
import { WeatherModule } from "../../weather/weather";

export function WeatherPage() {
   return (
      <box
         $type={"named"}
         name={"weather"}
         class={"qs-menu-page"}
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
      >
         <WeatherModule showArrow={true} />
      </box>
   );
}
