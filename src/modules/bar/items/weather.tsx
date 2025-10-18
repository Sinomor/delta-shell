import app from "ags/gtk4/app";
import GLib from "gi://GLib";
import { createBinding, createComputed, onCleanup, With } from "ags";
import BarItem from "@/src/widgets/baritem";
import { Gtk } from "ags/gtk4";
import { toggleWindow } from "@/src/lib/utils";
import { hide_all_windows, windows_names } from "@/windows";
import { config, theme } from "@/options";
import WeatherService from "@/src/services/weather";
import { isVertical } from "../bar";
const weather = WeatherService.get_default();

export function Weather() {
   if (!config.weather.enabled.get()) return <box />;

   const data = weather.data.as((data) => {
      if (!data)
         return {
            icon: "",
            temp: "",
         };

      const current = data.hourly[0];
      return {
         icon: current.icon,
         temp: isVertical
            ? `${current.temperature}`
            : `${current.temperature}${current.units.temperature}`,
      };
   });
   return (
      <BarItem
         window={windows_names.weather}
         onPrimaryClick={() => {
            if (!app.get_window(windows_names.weather)?.visible)
               hide_all_windows();
            toggleWindow(windows_names.weather);
         }}
         hexpand={isVertical}
      >
         <box
            visible={data.as((d) => d.temp !== "")}
            spacing={theme.bar.spacing}
            hexpand={isVertical}
            orientation={
               isVertical
                  ? Gtk.Orientation.VERTICAL
                  : Gtk.Orientation.HORIZONTAL
            }
         >
            <image
               iconName={data.as((d) => d.icon)}
               pixelSize={20}
               valign={Gtk.Align.CENTER}
            />
            <label label={data.as((d) => d.temp)} valign={Gtk.Align.CENTER} />
         </box>
      </BarItem>
   );
}
