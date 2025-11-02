import { Gtk } from "ags/gtk4";
import { QSSliders } from "../items/sliders";
import { MprisPlayers } from "../items/media";
import { Qs_Buttons } from "../items/qsbuttons";
import { BatteryIcon, icons } from "@/src/lib/icons";
import AstalBattery from "gi://AstalBattery?version=0.1";
import app from "ags/gtk4/app";
import { bash, dependencies, toggleWindow } from "@/src/lib/utils";
import { createBinding } from "ags";
import { timeout } from "ags/time";
import ScreenRecord from "@/src/services/screenrecord";
import { config, theme } from "@/options";
import { windows_names } from "@/windows";
const battery = AstalBattery.get_default();
const screenRecord = ScreenRecord.get_default();

function Power() {
   return (
      <button
         class={"qs-header-button"}
         tooltipText={"Power Menu"}
         focusOnClick={false}
         onClicked={() => toggleWindow(windows_names.powermenu)}
      >
         <image iconName={icons.powermenu.shutdown} pixelSize={20} />
      </button>
   );
}

function Reload() {
   return (
      <button
         class={"qs-header-button"}
         focusOnClick={false}
         tooltipText={"Restart shell"}
         onClicked={() => {
            if (DATADIR !== null) bash(`delta-shell restart`);
            else bash(`ags -i delta-shell quit; ${SRC}/run-dev.sh`);
         }}
      >
         <image iconName={icons.refresh} pixelSize={20} />
      </button>
   );
}

function Battery() {
   return (
      <button
         cssClasses={["qs-header-button", "battery-button"]}
         visible={createBinding(battery, "isPresent")}
         focusOnClick={false}
      >
         <box spacing={theme.spacing}>
            <image iconName={BatteryIcon} pixelSize={24} />
            <label
               label={createBinding(battery, "percentage").as(
                  (p) => `${Math.floor(p * 100)}%`,
               )}
            />
         </box>
      </button>
   );
}

export function Header() {
   return (
      <box spacing={theme.spacing} class={"header"} hexpand={false}>
         <Battery />
         <box hexpand />
         <Reload />
         <Power />
      </box>
   );
}

export function MainPage() {
   return (
      <box
         $type={"named"}
         name={"main"}
         class={"qs-main-page"}
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
      >
         <Header />
         <Qs_Buttons />
         <QSSliders />
         <MprisPlayers />
      </box>
   );
}
