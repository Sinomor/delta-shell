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

export function Weather() {
   if (!config.weather.enabled) return <box visible={false} />;
   const weather = WeatherService.get_default();

   const data = weather.data((data) => {
      if (!data)
         return {
            icon: "",
            temp: "",
            wind: "",
            "temp-units": "",
            "wind-units": "",
         };

      const current = data.hourly[0];
      return {
         icon: current.icon,
         temp: current.temperature.toString(),
         wind: current.wind_speed.toString(),
         "temp-units": current.units.temperature.toString(),
         "wind-units": current.units.wind_speed.toString(),
      };
   });

   return (
      <BarItem
         window={windows_names.weather}
         onPrimaryClick={config.bar.modules.weather["on-click"]}
         onSecondaryClick={config.bar.modules.weather["on-click-right"]}
         onMiddleClick={config.bar.modules.weather["on-click-middle"]}
         visible={data((d) => d.temp !== "")}
         data={{
            icon: (
               <image
                  iconName={data((d) => d.icon)}
                  pixelSize={20}
                  hexpand={isVertical}
               />
            ),
            temp: <label label={data((d) => d.temp)} hexpand={isVertical} />,
            "wind-speed": (
               <label label={data((d) => d.wind)} hexpand={isVertical} />
            ),
            "temp-units": (
               <label
                  label={data((d) => d["temp-units"])}
                  hexpand={isVertical}
               />
            ),
            "wind-units": (
               <label
                  label={data((d) => d["wind-units"])}
                  hexpand={isVertical}
               />
            ),
         }}
         format={config.bar.modules.weather.format}
      />
   );
}
