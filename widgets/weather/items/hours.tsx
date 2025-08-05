import options from "@/options";
import { Gtk } from "ags/gtk4";
import { HourlyWeather, weatherData } from "@/services/weather";
import { createComputed, For } from "ags";
import { icons } from "@/utils/icons";

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
         spacing={options.theme.spacing}
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
   const hours = createComputed([weatherData], (weatherData) => {
      if (!weatherData) return [];
      return weatherData?.hourly;
   });

   return (
      <box
         orientation={Gtk.Orientation.VERTICAL}
         spacing={options.theme.spacing}
         class={"forecast"}
      >
         <box spacing={options.theme.spacing}>
            <image iconName={icons.clock} pixelSize={20} />
            <label label={"Hourly forecast"} />
         </box>
         <scrolledwindow
            vscrollbarPolicy={Gtk.PolicyType.NEVER}
            hscrollbar_policy={Gtk.PolicyType.EXTERNAL}
         >
            <box spacing={options.theme.spacing}>
               <For each={hours}>{(hour) => <Hour hour={hour} />}</For>
            </box>
         </scrolledwindow>
      </box>
   );
}
