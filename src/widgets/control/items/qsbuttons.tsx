import { Gtk } from "ags/gtk4";
import { getNetworkIconBinding, icons } from "@/src/lib/icons";
import AstalNetwork from "gi://AstalNetwork?version=0.1";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
import AstalPowerProfiles from "gi://AstalPowerProfiles?version=0.1";
import { createBinding, createComputed } from "ags";
import { resetCss } from "@/src/services/styles";
import { QSButton } from "@/src/widgets/common/qsbutton";
import { profiles_names } from "../pages/powermodes";
import { config, theme } from "@/options";
import { control_page_set } from "../control";
import ScreenRecord from "@/src/services/screenrecord";
import { timeout } from "ags/time";
import Adw from "gi://Adw?version=1";
import { dependencies } from "@/src/lib/utils";
const network = AstalNetwork.get_default();
const bluetooth = AstalBluetooth.get_default();
const powerprofile = AstalPowerProfiles.get_default();

function PowerProfilesButton() {
   const activeprofile = createBinding(powerprofile, "activeProfile");

   return (
      <QSButton
         icon={activeprofile.as((profile) => icons.powerprofiles[profile])}
         label={"Power Mode"}
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

function InternetButton() {
   const wifi = network.wifi;
   const wired = network.wired;
   const enabled = createComputed(
      [
         createBinding(network, "primary"),
         ...(network.wifi !== null
            ? [createBinding(network.wifi, "enabled")]
            : []),
      ],
      (primary, enabled) => {
         if (
            primary === AstalNetwork.Primary.WIRED &&
            network.wired.internet === AstalNetwork.Internet.CONNECTED
         )
            return true;
         return enabled;
      },
   );
   const subtitle = createComputed(
      [
         createBinding(network, "primary"),
         createBinding(network, "connectivity"),
      ],
      (primary, connectivity) => {
         if (primary === AstalNetwork.Primary.WIRED) {
            if (wired.internet === AstalNetwork.Internet.CONNECTED) {
               return "Wired";
            }
         }
         if (primary === AstalNetwork.Primary.WIFI) {
            return wifi.ssid;
         }
         return "unknown";
      },
   );

   return (
      <QSButton
         icon={getNetworkIconBinding()}
         label={"Internet"}
         subtitle={subtitle((text) => (text !== "unknown" ? text : "None"))}
         onClicked={() => {
            if (
               network.primary === AstalNetwork.Primary.WIFI ||
               network.primary === AstalNetwork.Primary.UNKNOWN
            ) {
               wifi.set_enabled(!wifi.enabled);
            }
         }}
         onArrowClicked={() => {
            wifi.scan();
            control_page_set("network");
         }}
         showArrow={network.wifi !== null}
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

function ScreenRecordButton() {
   const screenRecord = ScreenRecord.get_default();

   return (
      <QSButton
         icon={icons.video}
         label={"Screen Record"}
         onClicked={() => {
            if (screenRecord.recording) screenRecord.stop();
            else screenRecord.start();
         }}
         ButtonClasses={createBinding(screenRecord, "recording").as((p) => {
            const classes = ["qs-button-box"];
            p && classes.push("active");
            return classes;
         })}
      />
   );
}

function BluetoothButton() {
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

export function Qs_Buttons() {
   const list = [
      <InternetButton />,
      bluetooth.adapter !== null && <BluetoothButton />,
      powerprofile.get_profiles().length !== 0 && <PowerProfilesButton />,
      dependencies("gpu-screen-recorder") && <ScreenRecordButton />,
   ].filter(Boolean);
   return (
      <Adw.WrapBox
         class={"qs-buttons"}
         child_spacing={theme.spacing}
         lineSpacing={theme.spacing}
         widthRequest={440 - theme.window.padding.get() * 2}
         naturalLineLength={440 - theme.window.padding.get() * 2}
      >
         {list.map((widget) => widget as Gtk.Widget)}
         {list.length % 2 !== 0 && <box widthRequest={200} />}
      </Adw.WrapBox>
   );
}
