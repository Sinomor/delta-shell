import { Gtk } from "ags/gtk4";
import {
   HourlyWeather,
   updateWeatherData,
   weatherData,
} from "@/services/weather";
import { createComputed, With } from "ags";
import { icons } from "@/utils/icons";

function getDescription(weatherCode: number) {
   const descriptions = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      56: "Light freezing drizzle",
      57: "Dense freezing drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      66: "Light freezing rain",
      67: "Heavy freezing rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      77: "Snow grains",
      80: "Slight rains showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow nshowers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
   } as Record<number, any>;

   return descriptions[weatherCode];
}

export function Current() {
   const data = createComputed([weatherData], (data) => {
      if (!data)
         return {
            feels: "",
            temp: "",
            units: "",
            desc: "",
         };

      const current = data.hourly[0];
      return {
         feels: `Feels like ${current.apparent_temperature}${current.units.temperature}`,
         temp: `${current.temperature}`,
         units: `${current.units.temperature}`,
         desc: getDescription(current.weather_code),
      };
   });

   return (
      <box orientation={Gtk.Orientation.VERTICAL}>
         <label label={data.as((d) => d.desc)} />
         <box halign={Gtk.Align.CENTER}>
            <label
               label={data.as((d) => d.temp)}
               css={`
                  font-size: 40pt;
               `}
            />
            <label
               label={data.as((d) => d.units)}
               valign={Gtk.Align.START}
               css={`
                  font-size: 18pt;
               `}
               marginTop={10}
            />
         </box>
         <label label={data.as((d) => d.feels)} />
      </box>
   );
}
