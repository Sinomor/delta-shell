import { Gtk } from "ags/gtk4";
import { For } from "ags";
import { icons } from "@/src/lib/icons";
import { theme } from "@/options";
import { HourlyWeather } from "@/src/services/weather";
import WeatherService from "@/src/services/weather";
const weather = WeatherService.get_default();

function formatHour(timestamp: number): string {
   const date = new Date(timestamp * 1000);
   const now = new Date();
   const hour = date.toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
   });
   if (date.getHours() === now.getHours()) return "Now";
   else return hour;
}

function Hour({ hour }: { hour: HourlyWeather }) {
   return (
      <box
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
         class={"hour"}
      >
         <label label={`${formatHour(hour.time)}`} />
         <image iconName={hour.icon} pixelSize={32} />
         <label label={`${hour.temperature}${hour.units.temperature}`} />
         <box visible={hour.precipitation_probability !== 0}>
            <image iconName={icons.droplet} />
            <label label={`${hour.precipitation_probability}%`} />
         </box>
      </box>
   );
}

export function Hours() {
   const hours = weather.data.as((data) => {
      if (!data) return [];
      return data?.hourly;
   });

   return (
      <box
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
         class={"forecast"}
      >
         <box spacing={theme.spacing}>
            <image iconName={icons.clock} pixelSize={20} />
            <label label={"Hourly forecast"} />
         </box>
         <scrolledwindow
            vscrollbarPolicy={Gtk.PolicyType.NEVER}
            hscrollbar_policy={Gtk.PolicyType.EXTERNAL}
         >
            <box spacing={theme.spacing}>
               <For each={hours}>{(hour) => <Hour hour={hour} />}</For>
            </box>
         </scrolledwindow>
      </box>
   );
}
