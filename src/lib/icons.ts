import { createBinding, createComputed } from "ags";
import AstalBattery from "gi://AstalBattery?version=0.1";
import AstalNetwork from "gi://AstalNetwork";
import AstalWp from "gi://AstalWp?version=0.1";

export const icons = {
   search: "ds-search-symbolic",
   settings: "ds-settings-2-symbolic",
   clipboard: "ds-clipboard-symbolic",
   keyboard: "ds-keyboard-symbolic",
   memory: "ds-memory-stick-symbolic",
   cpu: "ds-cpu-symbolic",
   arrow: {
      left: "ds-chevron-left-symbolic",
      right: "ds-chevron-right-symbolic",
      down: "ds-chevron-down-symbolic",
      up: "ds-chevron-up-symbolic",
   },
   trash: "ds-trash-2-symbolic",
   player: {
      icon: "ds-music-symbolic",
      play: "ds-play-symbolic",
      pause: "ds-pause-symbolic",
      prev: "ds-skip-back-symbolic",
      next: "ds-skip-forward-symbolic",
   },
   refresh: "ds-refresh-cw-symbolic",
   check: "ds-check-symbolic",
   powerprofiles: {
      "power-saver": "ds-speedometer-1-symbolic",
      balanced: "ds-speedometer-2-symbolic",
      performance: "ds-speedometer-3-symbolic",
   } as Record<string, any>,
   network: {
      wifi: {
         disabled: "ds-wifi-off-symbolic",
         1: "ds-wifi-1-symbolic",
         2: "ds-wifi-2-symbolic",
         3: "ds-wifi-3-symbolic",
         4: "ds-wifi-4-symbolic",
      },
      wired: "ds-ethernet-port-symbolic",
   },
   bluetooth: "ds-bluetooth-symbolic",
   bell: "ds-bell-symbolic",
   bell_off: "ds-bell-off-symbolic",
   microphone: {
      default: "ds-mic-symbolic",
      muted: "ds-mic-off-symbolic",
   },
   powermenu: {
      sleep: "ds-moon-symbolic",
      reboot: "ds-refresh-cw-symbolic",
      logout: "ds-log-out-symbolic",
      shutdown: "ds-power-symbolic",
   } as Record<string, any>,
   volume: {
      muted: "ds-volume-x-symbolic",
      low: "ds-volume-symbolic",
      medium: "ds-volume-1-symbolic",
      high: "ds-volume-2-symbolic",
   },
   battery: {
      charging: "ds-battery-charging-symbolic",
      1: "ds-battery-1-symbolic",
      2: "ds-battery-2-symbolic",
      3: "ds-battery-3-symbolic",
      4: "ds-battery-4-symbolic",
   },
   brightness: "ds-sun-symbolic",
   video: "ds-video-symbolic",
   close: "ds-x-symbolic",
   apps_default: "application-x-executable",
   droplet: "ds-droplet-symbolic",
   clock: "ds-clock-symbolic",
   calendar: "ds-calendar-symbolic",
   location: "ds-map-pin-symbolic",
   weather: {
      clear: {
         day: "ds-sun-symbolic",
         night: "ds-moon-symbolic",
      },
      cloudy: {
         day: "ds-cloud-sun-symbolic",
         night: "ds-cloud-moon-symbolic",
      },
      fog: "ds-cloud-fog-symbolic",
      rain: {
         day: "ds-cloud-sun-rain-symbolic",
         night: "ds-cloud-moon-rain-symbolic",
         general: "ds-cloud-drizzle-symbolic",
      },
      snow: "ds-cloud-snow-symbolic",
      shower_rain: "ds-cloud-rain-symbolic",
      thunder: "ds-cloud-lightning-symbolic",
   },
};

export function getVolumeIcon(speaker?: AstalWp.Endpoint) {
   let volume = speaker?.volume;
   let muted = speaker?.mute;
   let speakerIcon = speaker?.icon;
   if (volume == null || speakerIcon == null) return "";

   if (volume === 0 || muted) {
      return icons.volume.muted;
   } else if (volume < 0.33) {
      return icons.volume.low;
   } else if (volume < 0.66) {
      return icons.volume.medium;
   } else {
      return icons.volume.high;
   }
}

const wp = AstalWp.get_default();
const speaker = wp?.audio.defaultSpeaker!;
const speakerVar = createComputed([
   createBinding(speaker, "description"),
   createBinding(speaker, "volume"),
   createBinding(speaker, "mute"),
]);
export const VolumeIcon = speakerVar(() => getVolumeIcon(speaker));

export function getBatteryIcon(battery: AstalBattery.Device) {
   const percent = battery.percentage;
   if (battery.state === AstalBattery.State.CHARGING) {
      return icons.battery.charging;
   } else {
      if (percent <= 0.25) {
         return icons.battery[4];
      } else if (percent <= 0.5) {
         return icons.battery[3];
      } else if (percent <= 0.75) {
         return icons.battery[2];
      } else {
         return icons.battery[1];
      }
   }
}

const battery = AstalBattery.get_default();
const batteryVar = createComputed([
   createBinding(battery, "percentage"),
   createBinding(battery, "state"),
]);
export const BatteryIcon = batteryVar(() => getBatteryIcon(battery));

export function getNetworkIcon(network: AstalNetwork.Network) {
   const { connectivity, wifi, wired } = network;

   if (network.primary === AstalNetwork.Primary.WIRED) {
      if (wired.internet === AstalNetwork.Internet.CONNECTED) {
         return icons.network.wired;
      }
   }

   if (network.primary === AstalNetwork.Primary.WIFI) {
      const { strength, internet, enabled } = wifi;

      if (!enabled || connectivity === AstalNetwork.Connectivity.NONE) {
         return icons.network.wifi[1];
      }

      if (strength < 26) {
         if (internet === AstalNetwork.Internet.DISCONNECTED) {
            return icons.network.wifi[4];
         } else if (internet === AstalNetwork.Internet.CONNECTED) {
            return icons.network.wifi[4];
         } else if (internet === AstalNetwork.Internet.CONNECTING) {
            return icons.network.wifi[4];
         }
      } else if (strength < 51) {
         if (internet === AstalNetwork.Internet.DISCONNECTED) {
            return icons.network.wifi[3];
         } else if (internet === AstalNetwork.Internet.CONNECTED) {
            return icons.network.wifi[3];
         } else if (internet === AstalNetwork.Internet.CONNECTING) {
            return icons.network.wifi[3];
         }
      } else if (strength < 76) {
         if (internet === AstalNetwork.Internet.DISCONNECTED) {
            return icons.network.wifi[2];
         } else if (internet === AstalNetwork.Internet.CONNECTED) {
            return icons.network.wifi[2];
         } else if (internet === AstalNetwork.Internet.CONNECTING) {
            return icons.network.wifi[2];
         }
      } else {
         if (internet === AstalNetwork.Internet.DISCONNECTED) {
            return icons.network.wifi[1];
         } else if (internet === AstalNetwork.Internet.CONNECTED) {
            return icons.network.wifi[1];
         } else if (internet === AstalNetwork.Internet.CONNECTING) {
            return icons.network.wifi[1];
         }
      }

      return icons.network.wifi[1];
   }

   return icons.network.wifi[1];
}

export function getNetworkIconBinding() {
   const network = AstalNetwork.get_default();

   return createComputed([
      createBinding(network, "connectivity"),
      ...(network.wifi !== null
         ? [createBinding(network.wifi, "strength")]
         : []),
      createBinding(network, "primary"),
   ])(() => getNetworkIcon(network));
}

export function getAccessPointIcon(accessPoint: AstalNetwork.AccessPoint) {
   const strength = accessPoint.strength;

   if (strength <= 25) {
      return icons.network.wifi[4];
   } else if (strength <= 50) {
      return icons.network.wifi[3];
   } else if (strength <= 75) {
      return icons.network.wifi[2];
   } else {
      return icons.network.wifi[1];
   }
}

export function getWeatherIcon(weatherCode: number, is_day?: boolean) {
   const rain_icon =
      is_day === undefined
         ? icons.weather.rain.day
         : is_day
           ? icons.weather.rain.day
           : icons.weather.rain.night;

   const clear_icon =
      is_day === undefined
         ? icons.weather.clear.day
         : is_day
           ? icons.weather.clear.day
           : icons.weather.clear.night;
   const cloudy_icon =
      is_day === undefined
         ? icons.weather.cloudy.day
         : is_day
           ? icons.weather.cloudy.day
           : icons.weather.cloudy.night;

   const weather_icons = {
      0: clear_icon,
      1: clear_icon,
      2: cloudy_icon,
      3: cloudy_icon,
      45: icons.weather.fog,
      48: icons.weather.fog,
      51: rain_icon,
      53: rain_icon,
      55: rain_icon,
      56: rain_icon,
      57: rain_icon,
      61: rain_icon,
      63: rain_icon,
      65: rain_icon,
      66: rain_icon,
      67: rain_icon,
      71: rain_icon,
      73: icons.weather.snow,
      75: icons.weather.snow,
      77: icons.weather.snow,
      80: icons.weather.shower_rain,
      81: icons.weather.shower_rain,
      82: icons.weather.shower_rain,
      85: icons.weather.snow,
      86: icons.weather.snow,
      95: icons.weather.thunder,
      96: icons.weather.thunder,
      99: icons.weather.thunder,
   } as Record<number, any>;

   return weather_icons[weatherCode];
}
