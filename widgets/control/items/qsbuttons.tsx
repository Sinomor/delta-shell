import { Gtk } from "ags/gtk4";
import { getNetworkIconBinding, icons } from "@/utils/icons";
import Network from "gi://AstalNetwork?version=0.1";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import Bluetooth from "gi://AstalBluetooth?version=0.1";
import AstalPowerProfiles from "gi://AstalPowerProfiles?version=0.1";
import { createBinding, createComputed } from "ags";
import { resetCss } from "@/services/styles";
import { QSButton } from "@/widgets/common/qsbutton";
import { profiles_names } from "../pages/powermodes";
import { theme } from "@/options";
import { control_page_set } from "../control";

function PowerProfilesButton() {
   const powerprofile = AstalPowerProfiles.get_default();
   const activeprofile = createBinding(powerprofile, "activeProfile");

   return (
      <QSButton
         icon={activeprofile.as((profile) => icons.powerprofiles[profile])}
         label={"Power Modes"}
         subtitle={activeprofile.as((profile) => profiles_names[profile])}
         showArrow={true}
         onClicked={() => {
            const setprofile = activeprofile.as((profile) => {
               if (profile == "performance" || profile == "power-saver") {
                  return "balanced";
               } else {
                  return "performance";
               }
            });
            powerprofile.set_active_profile(setprofile.get());
         }}
         onArrowClicked={() => control_page_set("powermodes")}
         ArrowClasses={createBinding(powerprofile, "activeProfile").as(
            (profile) => {
               const classes = ["arrow"];
               if (profile == "performance" || profile == "power-saver") {
                  classes.push("active");
               }
               return classes;
            },
         )}
         ButtonClasses={createBinding(powerprofile, "activeProfile").as(
            (profile) => {
               const classes = ["qs-button-box-arrow"];
               if (profile == "performance" || profile == "power-saver") {
                  classes.push("active");
               }
               return classes;
            },
         )}
      />
   );
}

function WifiButton() {
   const wifi = Network.get_default().wifi;
   const enabled = createBinding(wifi, "enabled");
   const wifiSsid = createComputed(
      [createBinding(wifi, "state"), createBinding(wifi, "ssid")],
      (state, ssid) => {
         return state == Network.DeviceState.ACTIVATED
            ? ssid
            : Network.device_state_to_string();
      },
   );

   return (
      <QSButton
         icon={getNetworkIconBinding()}
         label={"Wi-Fi"}
         subtitle={wifiSsid((text) => (text !== "unknown" ? text : "None"))}
         onClicked={() => wifi.set_enabled(!wifi.enabled)}
         onArrowClicked={() => {
            wifi.scan();
            control_page_set("network");
         }}
         showArrow={true}
         ArrowClasses={enabled.as((p) => {
            const classes = ["arrow"];
            p && classes.push("active");
            return classes;
         })}
         ButtonClasses={enabled.as((p) => {
            const classes = ["qs-button-box-arrow"];
            p && classes.push("active");
            return classes;
         })}
      />
   );
}

function DNDButton() {
   const notifd = AstalNotifd.get_default();

   return (
      <QSButton
         icon={icons.bell}
         label={"Don't Disturb"}
         onClicked={() => notifd.set_dont_disturb(!notifd.dontDisturb)}
         ButtonClasses={createBinding(notifd, "dontDisturb").as((p) => {
            const classes = ["qs-button-box"];
            p && classes.push("active");
            return classes;
         })}
      />
   );
}

function BluetoothButton() {
   const bluetooth = Bluetooth.get_default();
   const powered = createBinding(bluetooth, "isPowered");
   const deviceConnected = createComputed(
      [
         createBinding(bluetooth, "devices"),
         createBinding(bluetooth, "isConnected"),
      ],
      (d, _) => {
         for (const device of d) {
            if (device.connected) return device.name;
         }
         return "No device";
      },
   );

   return (
      <QSButton
         icon={icons.bluetooth}
         label={"Bluetooth"}
         subtitle={deviceConnected((text) =>
            text !== "No device" ? text : "None",
         )}
         showArrow={true}
         onClicked={() => bluetooth.toggle()}
         onArrowClicked={() => control_page_set("bluetooth")}
         ArrowClasses={powered.as((p) => {
            const classes = ["arrow"];
            p && classes.push("active");
            return classes;
         })}
         ButtonClasses={powered.as((p) => {
            const classes = ["qs-button-box-arrow"];
            p && classes.push("active");
            return classes;
         })}
      />
   );
}

function Qs_Row_1() {
   return (
      <box spacing={theme.spacing} homogeneous={true}>
         <WifiButton />
         <BluetoothButton />
      </box>
   );
}

function Qs_Row_2() {
   return (
      <box spacing={theme.spacing} homogeneous={true}>
         <PowerProfilesButton />
         <DNDButton />
      </box>
   );
}

export function Qs_Buttins() {
   return (
      <box
         spacing={theme.spacing}
         class={"qs-buttons"}
         orientation={Gtk.Orientation.VERTICAL}
      >
         <Qs_Row_1 />
         <Qs_Row_2 />
      </box>
   );
}
