import Gdk from "gi://Gdk";
import Gtk from "gi://Gtk";
import app from "ags/gtk4/app";
import { hide_all_windows, windows_names } from "@/windows";
import Adw from "gi://Adw?version=1";
import { BarItemPopup } from "../common/baritempopup";
import { isLoading, updateWeatherData, weatherData } from "@/services/weather";
import { createComputed } from "ags";
import { Current } from "./items/current";
import { currentLocation } from "@/services/location";
import { icons } from "@/utils/icons";
import { Days } from "./items/days";
import { Hours } from "./items/hours";
import { config, theme } from "@/options";

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
      <box valign={Gtk.Align.CENTER} spacing={theme.spacing}>
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
   return (
      <box
         class={"main"}
         spacing={theme.spacing}
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
         name={windows_names.weather}
         module={"weather"}
         gdkmonitor={gdkmonitor}
      >
         <Weather />
      </BarItemPopup>
   );
}
