import BarItem from "@/src/widgets/baritem";
import { windows_names } from "@/windows";
import { config, theme } from "@/options";
import WeatherService from "@/src/services/weather";
import { isVertical } from "../bar";

export function Weather() {
   if (!config.weather.enabled) {
      console.warn(
         "Bar: module weather requires config.weather.enabled = true",
      );
      return <box visible={false} />;
   }
   const conf = config.bar.modules.weather;
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
         onPrimaryClick={conf["on-click"]}
         onSecondaryClick={conf["on-click-right"]}
         onMiddleClick={conf["on-click-middle"]}
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
         format={conf.format}
      />
   );
}
