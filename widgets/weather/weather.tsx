import Gdk from "gi://Gdk";
import Gtk from "gi://Gtk";
import app from "ags/gtk4/app";
import { hide_all_windows } from "@/windows";
import options from "@/options";
import Adw from "gi://Adw?version=1";
import { BarItemPopup } from "../common/baritempopup";
import { isLoading, updateWeatherData, weatherData } from "@/services/weather";
import { createComputed } from "ags";
import { Current } from "./items/current";
import { currentLocation } from "@/services/location";
import { icons } from "@/utils/icons";
import { Days } from "./items/days";
import { Hours } from "./items/hours";
const { name, margin } = options.weather;

export function getWeatherBackground(weatherCode: number, isDay: boolean) {
   const colors = {
      clear: isDay
         ? ["#592B19", "#CC6143", "#D18268"]
         : ["#171D52", "#3F4DBA", "#5E68BD"],
      cloudy: ["#23262C", "#525D66", "#6B8394"],
      party_cloudy: ["#1C2F75", "#585D6D", "#747B99"],
      fog: ["#131B45", "#2A5476", "#918EAF"],
      rain: ["#233361", "#2F4997", "#252731"],
      snow: ["#353A47", "#455762", "#414F83"],
      thunder: ["#2F2B38", "#50406D", "#2C1C4D"],
   } as Record<string, any>;

   const types = {
      0: "clear",
      1: "clear",
      2: "party_cloudy",
      3: "cloudy",
      45: "fog",
      48: "fog",
      51: "rain",
      53: "rain",
      55: "rain",
      56: "rain",
      57: "rain",
      61: "rain",
      63: "rain",
      65: "rain",
      66: "rain",
      67: "rain",
      71: "rain",
      73: "snow",
      75: "snow",
      77: "snow",
      80: "rain",
      81: "rain",
      82: "rain",
      85: "snow",
      86: "snow",
      95: "thunder",
      96: "thunder",
      99: "thunder",
   } as Record<number, any>;

   const type = types[weatherCode];

   const [color1, color2, color3] = colors[type];

   return `
        background: linear-gradient(180deg, ${color1}, ${color2}, ${color3});
    `;
}

function ScanningIndicator() {
   const className = isLoading.as((scanning) => {
      const classes = ["scanning"];
      if (scanning) {
         classes.push("active");
      }
      return classes;
   });

   return (
      <image iconName={icons.refresh} pixelSize={20} cssClasses={className} />
   );
}

function Header() {
   const data = createComputed([currentLocation], (location) => {
      if (!location)
         return {
            label: "",
         };

      return {
         label: `${location.city}, ${location.country_code}`,
      };
   });

   return (
      <box valign={Gtk.Align.CENTER} spacing={options.theme.spacing}>
         <image iconName={icons.location} pixelSize={20} />
         <label label={data.as((d) => d.label)} />
         <box hexpand />
         <button class={"refresh"} onClicked={() => updateWeatherData()}>
            <ScanningIndicator />
         </button>
      </box>
   );
}

function Weather() {
   const data = createComputed([weatherData], (data) => {
      if (!data)
         return {
            bg: getWeatherBackground(0, true),
         };

      const current = data.hourly[0];
      return {
         bg: getWeatherBackground(current.weather_code, current.is_day),
      };
   });
   return (
      <box
         class={"main"}
         css={data.as((d) => d.bg)}
         spacing={options.theme.spacing}
         widthRequest={360}
         orientation={Gtk.Orientation.VERTICAL}
      >
         <Header />
         <Current />
         <Hours />
         <Days />
      </box>
   );
}

export default function (gdkmonitor: Gdk.Monitor) {
   return (
      <BarItemPopup
         name={name}
         module={"weather"}
         gdkmonitor={gdkmonitor}
         margin={margin.get()}
      >
         <Weather />
      </BarItemPopup>
   );
}
