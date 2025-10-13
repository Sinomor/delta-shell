import { windows_names } from "@/windows";
import { BarItemPopup } from "../widgets/baritempopup";
import { WeatherModule } from "../modules/weather/weather";

export function WeatherWindow() {
   return (
      <BarItemPopup name={windows_names.weather} module={"weather"}>
         <box class={"main"}>
            <WeatherModule />
         </box>
      </BarItemPopup>
   );
}
