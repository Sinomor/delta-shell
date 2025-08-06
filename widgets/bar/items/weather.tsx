import app from "ags/gtk4/app";
import GLib from "gi://GLib";
import { createBinding, createComputed, onCleanup, With } from "ags";
import BarItem from "@/widgets/common/baritem";
import { weatherData } from "@/services/weather";
import { Gtk } from "ags/gtk4";
import { getWeatherIcon } from "@/utils/icons";
import { toggleWindow } from "@/utils/utils";
import { hide_all_windows, windows_names } from "@/windows";
import { config, theme } from "@/options";

export function Weather() {
   if (!config.weather.enabled.get()) return <box />;

   const data = createComputed([weatherData], (data) => {
      if (!data)
         return {
            icon: "",
            temp: "",
         };

      const current = data.hourly[0];
      return {
         icon: current.icon,
         temp: `${current.temperature}${current.units.temperature}`,
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
      >
         <box
            visible={data.as((d) => d.temp !== "")}
            spacing={theme.bar.spacing}
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
