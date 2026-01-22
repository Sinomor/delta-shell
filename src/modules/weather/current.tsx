import { Gtk } from "ags/gtk4";
import { createBinding, With } from "ags";
import Weather from "@/src/services/weather";
import { t } from "@/i18n";

function getDescription(weatherCode: number): string {
   const key = `modules.weather.codes.${weatherCode}`;
   const value = t(key);
   return value === key ? t("common.notFound") : value;
}

export function Current() {
   const weather = Weather.get_default();

   const data = createBinding(weather, "data").as((data) => {
      if (!data.hourly)
         return {
            feels: "",
            temp: "",
            units: "",
            desc: "",
         };

      const current = data.hourly[0];
      return {
         feels: t("modules.weather.feelsLike", {
            value: current.apparent_temperature,
            unit: current.units.temperature
         }),
         temp: current.temperature.toString(),
         units: current.units.temperature.toString(),
         desc: getDescription(current.weather_code),
      };
   });

   return (
      <box orientation={Gtk.Orientation.VERTICAL} class={"current"}>
         <label label={data((d) => d.desc)} />
         <box halign={Gtk.Align.CENTER}>
            <label label={data.as((d) => d.temp)} class={"temp"} />
            <label
               label={data((d) => d.units)}
               valign={Gtk.Align.START}
               class={"units"}
               marginTop={10}
            />
         </box>
         <label label={data((d) => d.feels)} />
      </box>
   );
}
