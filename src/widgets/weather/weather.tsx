import Gtk from "gi://Gtk";
import { hide_all_windows, windows_names } from "@/windows";
import { BarItemPopup } from "../common/baritempopup";
import { createComputed } from "ags";
import { Current } from "./items/current";
import { icons } from "@/src/lib/icons";
import { Days } from "./items/days";
import { Hours } from "./items/hours";
import { config, theme } from "@/options";
import WeatherService from "@/src/services/weather";
const weather = WeatherService.get_default();

function ScanningIndicator() {
   const className = weather.loading.as((scanning) => {
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
   const data = weather.location.as((location) => {
      if (!location)
         return {
            label: "",
         };

      return {
         label: `${location.city}, ${location.country_code}`,
      };
   });

   return (
      <box class={"header"} valign={Gtk.Align.CENTER} spacing={theme.spacing}>
         <image iconName={icons.location} pixelSize={20} />
         <label label={data.as((d) => d.label)} />
         <box hexpand />
         <button
            focusOnClick={false}
            class={"refresh"}
            onClicked={() => weather.update()}
         >
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
         widthRequest={340}
         orientation={Gtk.Orientation.VERTICAL}
      >
         <Header />
         <Current />
         <Hours />
         <Days />
      </box>
   );
}

export default function () {
   return (
      <BarItemPopup name={windows_names.weather} module={"weather"}>
         <Weather />
      </BarItemPopup>
   );
}
