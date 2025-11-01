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
            wind: "",
            "temp-units": "",
            "wind-units": "",
         };

      const current = data.hourly[0];
      return {
         icon: current.icon,
         temp: `${current.temperature}`,
         wind: `${current.wind_speed}`,
         "temp-units": `${current.units.temperature}`,
         "wind-units": `${current.units.wind_speed}`,
      };
   });
   return (
      <BarItem
         window={windows_names.weather}
         onPrimaryClick={config.bar.modules.weather["on-click"].get()}
         onSecondaryClick={config.bar.modules.weather["on-click-right"].get()}
         onMiddleClick={config.bar.modules.weather["on-click-middle"].get()}
         visible={data.as((d) => d.temp !== "")}
         data={{
            icon: (
               <image
                  iconName={data.as((d) => d.icon)}
                  pixelSize={20}
                  hexpand={isVertical}
               />
            ),
            temp: <label label={data.as((d) => d.temp)} hexpand={isVertical} />,
            "wind-speed": (
               <label label={data.as((d) => d.wind)} hexpand={isVertical} />
            ),
            "temp-units": (
               <label
                  label={data.as((d) => d["temp-units"])}
                  hexpand={isVertical}
               />
            ),
            "wind-units": (
               <label
                  label={data.as((d) => d["wind-units"])}
                  hexpand={isVertical}
               />
            ),
         }}
         format={config.bar.modules.weather.format.get()}
      />
   );
}
