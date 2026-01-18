import { getNetworkIconBinding, icons, VolumeIcon } from "@/src/lib/icons";
import AstalNetwork from "gi://AstalNetwork?version=0.1";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
import AstalPowerProfiles from "gi://AstalPowerProfiles?version=0.1";
import AstalWp from "gi://AstalWp?version=0.1";
import { createBinding, createComputed, For } from "ags";
import { resetCss } from "@/src/services/styles";
import { QSButton } from "@/src/widgets/qsbutton";
import { config, theme } from "@/options";
import ScreenRecorder from "@/src/services/screenrecorder";
import { timeout } from "ags/time";
import Adw from "gi://Adw?version=1";
import { dependencies } from "@/src/lib/utils";
import { qs_page_set } from "../quicksettings";
import { profiles_names } from "../../power/power";
import Weather from "@/src/services/weather";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import { FunctionsList } from "@/src/widgets/baritem";
import { t } from "@/i18n";
const network = AstalNetwork.get_default();
const bluetooth = AstalBluetooth.get_default();
const powerprofile = AstalPowerProfiles.get_default();
const wp = AstalWp.get_default();
const notifd = AstalNotifd.get_default();

const Buttons = {
   network: () => <InternetButton />,
   bluetooth: () => (bluetooth.adapter !== null ? <BluetoothButton /> : null),
   power: () =>
      powerprofile.get_profiles().length !== 0 ? <PowerProfilesButton /> : null,
   screenrecord: () =>
      dependencies("gpu-screen-recorder") ? <ScreenRecordButton /> : null,
   weather: () => config.weather.enabled && <WeatherButton />,
   notifications: () => config.notifications.enabled && <NotificationsButton />,
   volume: () => <VolumeButton />,
   microphone: () => <MicrophoneButton />,
} as Record<string, any>;

function VolumeButton() {
   const speaker = wp.get_default_speaker();
   const mute = createBinding(speaker, "mute");
   const volume = createBinding(speaker, "volume");
   const level = createComputed(() => {
      if (mute()) return "";
      else return `${Math.floor(volume() * 100)}%`;
   });

   return (
      <QSButton
         icon={VolumeIcon}
         label={t("modules.quicksettings.volume")}
         subtitle={level((level) => (level !== "" ? level : "None"))}
         onClicked={() => speaker.set_mute(!speaker.get_mute())}
         onArrowClicked={() => qs_page_set("volume")}
         onScrollUp={() => FunctionsList["volume-up"]()}
         onScrollDown={() => FunctionsList["volume-down"]()}
         arrow={"separate"}
         ArrowClasses={mute((p) => {
            const classes = ["arrow"];
            !p && classes.push("active");
            return classes;
         })}
         ButtonClasses={mute((p) => {
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
   const volume = createBinding(microphone, "volume");
   const level = createComputed(() => {
      if (mute()) return "";
      else return `${Math.floor(volume() * 100)}%`;
   });

   return (
      <QSButton
         icon={icons.microphone.default}
         label={t("modules.quicksettings.microphone")}
         subtitle={level((level) => (level !== "" ? level : "None"))}
         onClicked={() => microphone.set_mute(!microphone.get_mute())}
         onArrowClicked={() => qs_page_set("volume")}
         onScrollUp={() => FunctionsList["microphone-up"]()}
         onScrollDown={() => FunctionsList["microphone-down"]()}
         arrow={"separate"}
         ArrowClasses={mute((p) => {
            const classes = ["arrow"];
            !p && classes.push("active");
            return classes;
         })}
         ButtonClasses={mute((p) => {
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
         icon={activeprofile((profile) => icons.powerprofiles[profile])}
         label={t("modules.quicksettings.power")}
         subtitle={activeprofile((profile) => profiles_names[profile])}
         arrow={"separate"}
         onClicked={() => {
            const active = activeprofile.peek();
            const set =
               active === "performance" || active === "power-saver"
                  ? "balanced"
                  : "performance";
            powerprofile.set_active_profile(set);
         }}
         onArrowClicked={() => qs_page_set("power")}
         ArrowClasses={activeprofile((profile) => {
            const classes = ["arrow"];
            if (profile == "performance" || profile == "power-saver") {
               classes.push("active");
            }
            return classes;
         })}
         ButtonClasses={activeprofile((profile) => {
            const classes = ["qs-button-box-arrow"];
            if (profile == "performance" || profile == "power-saver") {
               classes.push("active");
            }
            return classes;
         })}
      />
   );
}

function InternetButton() {
   const wifi = network.wifi;
   const wired = network.wired;
   const connectivity = createBinding(network, "connectivity");
   const primary = createBinding(network, "primary");

   const enabled = createComputed(() => {
      connectivity();
      if (
         primary() === AstalNetwork.Primary.WIRED &&
         network.wired.internet === AstalNetwork.Internet.CONNECTED
      )
         return true;
      if (wifi !== null) return wifi.enabled;
   });

   const subtitle = createComputed(() => {
      connectivity();
      if (primary() === AstalNetwork.Primary.WIRED) {
         if (wired.internet === AstalNetwork.Internet.CONNECTED) {
            return t("modules.quicksettings.wired");
         }
      }
      if (primary() === AstalNetwork.Primary.WIFI) {
         return wifi.ssid;
      }
      return "";
   });

   return (
      <QSButton
         icon={getNetworkIconBinding()}
         label={t("modules.quicksettings.internet")}
         subtitle={subtitle((text) => (text !== "" ? text : "None"))}
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
         arrow={network.wifi !== null ? "separate" : "none"}
         ArrowClasses={enabled((p) => {
            const classes = ["arrow"];
            p && classes.push("active");
            return classes;
         })}
         ButtonClasses={enabled((p) => {
            const classes = ["qs-button-box-arrow"];
            p && classes.push("active");
            return classes;
         })}
      />
   );
}

function ScreenRecordButton() {
   const screenRecord = ScreenRecorder.get_default();
   const recording = createBinding(screenRecord, "recording");
   const timer = createBinding(screenRecord, "timer");

   const progress = createComputed(() => {
      if (recording()) {
         const time = timer();
         const sec = time % 60;
         const min = Math.floor(time / 60);
         return `${min}:${sec < 10 ? "0" + sec : sec}`;
      } else return "";
   });

   return (
      <QSButton
         icon={icons.video}
         label={t("modules.quicksettings.screenRecord")}
         subtitle={progress.as((progress) =>
            progress !== "" ? progress : "None",
         )}
         onClicked={() => {
            if (screenRecord.recording) screenRecord.stop();
            else screenRecord.start();
         }}
         ButtonClasses={recording((p) => {
            const classes = ["qs-button-box"];
            p && classes.push("active");
            return classes;
         })}
      />
   );
}

function BluetoothButton() {
   const powered = createBinding(bluetooth, "isPowered");
   const connected = createBinding(bluetooth, "isConnected");
   const devices = createBinding(bluetooth, "devices");
   const device = createComputed(
      () => (connected(), devices().find((device) => device.connected)),
   );

   return (
      <QSButton
         icon={icons.bluetooth}
         label={t("modules.quicksettings.bluetooth")}
         subtitle={device((d) => (d ? d.alias : "None"))}
         arrow={"separate"}
         onClicked={() => bluetooth.toggle()}
         onArrowClicked={() => qs_page_set("bluetooth")}
         ArrowClasses={powered((p) => {
            const classes = ["arrow"];
            p && classes.push("active");
            return classes;
         })}
         ButtonClasses={powered((p) => {
            const classes = ["qs-button-box-arrow"];
            p && classes.push("active");
            return classes;
         })}
      />
   );
}

function WeatherButton() {
   const weather = Weather.get_default();
   const data = createBinding(weather, "data");

   const temp = createComputed(() => {
      const hourly = data().hourly;
      if (!hourly) return "";
      const current = hourly[0];
      return `${current.temperature}${current.units.temperature}`;
   });

   const icon = data((data) => {
      if (!data.hourly) return icons.weather.clear.day;

      const current = data.hourly[0];
      return current.icon;
   });

   return (
      <QSButton
         icon={icon}
         label={t("modules.quicksettings.weather")}
         subtitle={temp((temp) => (temp !== "" ? temp : "None"))}
         arrow={"inside"}
         onClicked={() => qs_page_set("weather")}
         ButtonClasses={["qs-button-box-arrow-inside"]}
      />
   );
}

function NotificationsButton() {
   const enabled = createBinding(notifd, "dontDisturb");
   const notifications = createBinding(notifd, "notifications");

   return (
      <QSButton
         icon={icons.bell}
         label={t("modules.quicksettings.notifications")}
         subtitle={notifications((n) =>
            n.length === 0 ? "None" : n.length.toString(),
         )}
         arrow={"separate"}
         onClicked={() => notifd.set_dont_disturb(!notifd.dontDisturb)}
         onArrowClicked={() => qs_page_set("notificationslist")}
         ArrowClasses={enabled((p) => {
            const classes = ["arrow"];
            !p && classes.push("active");
            return classes;
         })}
         ButtonClasses={enabled((p) => {
            const classes = ["qs-button-box-arrow"];
            !p && classes.push("active");
            return classes;
         })}
      />
   );
}

export function QSButtons() {
   const getVisibleButtons = () => {
      const buttons = config.quicksettings.buttons;
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
         widthRequest={440 - theme.window.padding * 2}
         naturalLineLength={440 - theme.window.padding * 2}
      >
         {buttons}
         {buttons.length % 2 !== 0 && <box widthRequest={200} />}
      </Adw.WrapBox>
   );
}
