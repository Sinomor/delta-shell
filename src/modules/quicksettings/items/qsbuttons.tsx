import { Gtk } from "ags/gtk4";
import { getNetworkIconBinding, icons, VolumeIcon } from "@/src/lib/icons";
import AstalNetwork from "gi://AstalNetwork?version=0.1";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
import AstalPowerProfiles from "gi://AstalPowerProfiles?version=0.1";
import AstalWp from "gi://AstalWp?version=0.1";
import { createBinding, createComputed, For } from "ags";
import { resetCss } from "@/src/services/styles";
import { QSButton } from "@/src/widgets/qsbutton";
import { config, theme } from "@/options";
import ScreenRecord from "@/src/services/screenrecord";
import { timeout } from "ags/time";
import Adw from "gi://Adw?version=1";
import { dependencies } from "@/src/lib/utils";
import { qs_page_set } from "../quicksettings";
import { profiles_names } from "../../power/power";
import WeatherService from "@/src/services/weather";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
const network = AstalNetwork.get_default();
const bluetooth = AstalBluetooth.get_default();
const powerprofile = AstalPowerProfiles.get_default();
const weather = WeatherService.get_default();
const wp = AstalWp.get_default();
const notifd = AstalNotifd.get_default();

const Buttons = {
   network: () => <InternetButton />,
   bluetooth: () => (bluetooth.adapter !== null ? <BluetoothButton /> : null),
   power: () =>
      powerprofile.get_profiles().length !== 0 ? <PowerProfilesButton /> : null,
   screenrecord: () =>
      dependencies("gpu-screen-recorder") ? <ScreenRecordButton /> : null,
   weather: () => config.weather.enabled.get() && <WeatherButton />,
   notifications: () =>
      config.notifications.enabled.get() && <NotificationsButton />,
   volume: () => <VolumeButton />,
   microphone: () => <MicrophoneButton />,
} as Record<string, any>;

function VolumeButton() {
   const speaker = wp.get_default_speaker();
   const mute = createBinding(speaker, "mute");
   const level = createComputed(
      [createBinding(speaker, "volume"), mute],
      (volume, mute) => {
         if (mute) return "None";
         else return `${Math.floor(volume * 100)}%`;
      },
   );

   return (
      <QSButton
         icon={VolumeIcon}
         label={"Volume"}
         subtitle={level.as((level) => (level !== "None" ? level : "None"))}
         onClicked={() => speaker.set_mute(!speaker.get_mute())}
         onArrowClicked={() => qs_page_set("volume")}
         arrow={"separate"}
         ArrowClasses={mute.as((p) => {
            const classes = ["arrow"];
            !p && classes.push("active");
            return classes;
         })}
         ButtonClasses={mute.as((p) => {
            const classes = ["qs-button-box-arrow"];
            !p && classes.push("active");
            return classes;
         })}
      />
   );
}

function MicrophoneButton() {
   const microphone = wp.get_default_microphone();
   const mute = createBinding(microphone, "mute");
   const level = createComputed(
      [createBinding(microphone, "volume"), mute],
      (volume, mute) => {
         if (mute) return "None";
         else return `${Math.floor(volume * 100)}%`;
      },
   );

   return (
      <QSButton
         icon={icons.microphone.default}
         label={"Microphone"}
         subtitle={level.as((level) => (level !== "None" ? level : "None"))}
         onClicked={() => microphone.set_mute(!microphone.get_mute())}
         onArrowClicked={() => qs_page_set("volume")}
         arrow={"separate"}
         ArrowClasses={mute.as((p) => {
            const classes = ["arrow"];
            !p && classes.push("active");
            return classes;
         })}
         ButtonClasses={mute.as((p) => {
            const classes = ["qs-button-box-arrow"];
            !p && classes.push("active");
            return classes;
         })}
      />
   );
}

function PowerProfilesButton() {
   const activeprofile = createBinding(powerprofile, "activeProfile");

   return (
      <QSButton
         icon={activeprofile.as((profile) => icons.powerprofiles[profile])}
         label={"Power"}
         subtitle={activeprofile.as((profile) => profiles_names[profile])}
         arrow={"separate"}
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
         onArrowClicked={() => qs_page_set("power")}
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
            qs_page_set("network");
         }}
         arrow={"separate"}
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
   const progress = createComputed(
      [
         createBinding(screenRecord, "recording"),
         createBinding(screenRecord, "timer"),
      ],
      (recording, time) => {
         if (recording) {
            const sec = time % 60;
            const min = Math.floor(time / 60);
            return `${min}:${sec < 10 ? "0" + sec : sec}`;
         } else return "None";
      },
   );

   return (
      <QSButton
         icon={icons.video}
         label={"Screen Record"}
         subtitle={progress.as((progress) =>
            progress !== "None" ? progress : "None",
         )}
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
         arrow={"separate"}
         onClicked={() => bluetooth.toggle()}
         onArrowClicked={() => qs_page_set("bluetooth")}
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

function WeatherButton() {
   const temp = createComputed(
      [weather.data, weather.running],
      (data, running) => {
         if (!data) return "None";

         const current = data.hourly[0];
         return running
            ? `${current.temperature}${current.units.temperature}`
            : "None";
      },
   );

   const icon = weather.data.as((data) => {
      if (!data) return icons.weather.clear.day;

      const current = data.hourly[0];
      return current.icon;
   });

   return (
      <QSButton
         icon={icon.as((icon) => icon)}
         label={"Weather"}
         subtitle={temp.as((temp) => (temp !== "None" ? temp : "None"))}
         arrow={"inside"}
         onClicked={() => qs_page_set("weather")}
         ButtonClasses={["qs-button-box-arrow-inside"]}
      />
   );
}

function NotificationsButton() {
   const enabled = createBinding(notifd, "dontDisturb");
   return (
      <QSButton
         icon={icons.bell}
         label={"Notifications"}
         subtitle={createBinding(notifd, "notifications").as((notifs) =>
            notifs.length === 0 ? "None" : notifs.length.toString(),
         )}
         arrow={"separate"}
         onClicked={() => notifd.set_dont_disturb(!notifd.dontDisturb)}
         onArrowClicked={() => qs_page_set("notificationslist")}
         ArrowClasses={enabled.as((p) => {
            const classes = ["arrow"];
            !p && classes.push("active");
            return classes;
         })}
         ButtonClasses={enabled.as((p) => {
            const classes = ["qs-button-box-arrow"];
            !p && classes.push("active");
            return classes;
         })}
      />
   );
}

export function Qs_Buttons() {
   const getVisibleButtons = () => {
      const buttons = config.quicksettings.buttons.get();
      const visible = [];

      for (const button of buttons) {
         const Widget = Buttons[button];
         if (!Widget) {
            console.error(`Failed create qsbutton: unknown name "${button}"`);
            continue;
         }
         const result = Widget();
         if (result !== null && result !== undefined) {
            visible.push(result);
         }
      }

      return visible;
   };

   const buttons = getVisibleButtons();

   return (
      <Adw.WrapBox
         class={"qs-buttons"}
         child_spacing={theme.spacing}
         lineSpacing={theme.spacing}
         widthRequest={440 - theme.window.padding.get() * 2}
         naturalLineLength={440 - theme.window.padding.get() * 2}
      >
         {buttons}
         {buttons.length % 2 !== 0 && <box widthRequest={200} />}
      </Adw.WrapBox>
   );
}
