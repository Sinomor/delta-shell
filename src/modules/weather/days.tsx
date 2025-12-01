import { Gtk } from "ags/gtk4";
import { DailyWeather } from "@/src/services/weather";
import { For } from "ags";
import { icons } from "@/src/lib/icons";
import { theme } from "@/options";
import WeatherService from "@/src/services/weather";
const weather = WeatherService.get_default();

function formatDate(timestamp: number): string {
   const date = new Date(timestamp * 1000);
   return date.toLocaleDateString([], {
      day: "2-digit",
      month: "2-digit",
   });
}

function formateWeekDay(timestamp: number): string {
   const date = new Date(timestamp * 1000);
   const today = new Date();
   const weekday = date.toLocaleDateString([], {
      weekday: "short",
   });
   if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
   )
      return "Today";
   else return weekday;
}

function Day({ day }: { day: DailyWeather }) {
   return (
      <box
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
         class={"day"}
      >
         <label label={formateWeekDay(day.time)} />
         <image iconName={day.icon} pixelSize={32} />
         <box orientation={Gtk.Orientation.VERTICAL}>
            <label
               label={`${day.temperature_max}${day.units.temperature_max}`}
            />
            <label
               label={`${day.temperature_min}${day.units.temperature_min}`}
            />
         </box>
         <box visible={day.precipitation_probability !== 0}>
            <image iconName={icons.droplet} />
            <label label={`${day.precipitation_probability}%`} />
         </box>
      </box>
   );
}

export function Days() {
   const days = weather.data((data) => {
      if (!data) return [];
      return data?.daily;
   });

   return (
      <box
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
         class={"forecast"}
      >
         <box spacing={theme.spacing}>
            <image iconName={icons.calendar} pixelSize={20} />
            <label label={"Daily forecast"} valign={Gtk.Align.CENTER} />
         </box>
         <scrolledwindow
            vscrollbarPolicy={Gtk.PolicyType.NEVER}
            hscrollbar_policy={Gtk.PolicyType.EXTERNAL}
         >
            <box spacing={theme.spacing}>
               <For each={days}>{(day) => <Day day={day} />}</For>
            </box>
         </scrolledwindow>
      </box>
   );
}
