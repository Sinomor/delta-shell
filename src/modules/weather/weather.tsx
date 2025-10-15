import Gtk from "gi://Gtk";
import { hide_all_windows, windows_names } from "@/windows";
import { createComputed, With } from "ags";
import { Current } from "./current";
import { icons } from "@/src/lib/icons";
import { Days } from "./days";
import { Hours } from "./hours";
import { config, theme } from "@/options";
import WeatherService from "@/src/services/weather";
import { qs_page_set } from "../quicksettings/quicksettings";
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

function Header({ showArrow = false }: { showArrow?: boolean }) {
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
         {showArrow && (
            <button
               cssClasses={["qs-header-button", "qs-page-prev"]}
               focusOnClick={false}
               onClicked={() => qs_page_set("main")}
            >
               <image iconName={icons.arrow.left} pixelSize={20} />
            </button>
         )}
         <image iconName={icons.location} pixelSize={20} />
         <label label={data.as((d) => d.label)} />
         <box hexpand />
         <button
            focusOnClick={false}
            cssClasses={["qs-header-button", "qs-page-prev", "refresh"]}
            onClicked={() => weather.update()}
         >
            <ScanningIndicator />
         </button>
         <switch
            class={"toggle"}
            valign={Gtk.Align.CENTER}
            active={weather.running}
            onNotifyActive={() => weather.toggle()}
         />
      </box>
   );
}

export function WeatherModule({ showArrow = false }: { showArrow?: boolean }) {
   return (
      <box
         class={"weather"}
         spacing={theme.spacing}
         widthRequest={340}
         heightRequest={550}
         orientation={Gtk.Orientation.VERTICAL}
      >
         <Header showArrow={showArrow} />
         <With value={weather.running}>
            {(running) =>
               running && (
                  <box
                     orientation={Gtk.Orientation.VERTICAL}
                     spacing={theme.spacing}
                  >
                     <Current />
                     <Hours />
                     <Days />
                  </box>
               )
            }
         </With>
      </box>
   );
}
