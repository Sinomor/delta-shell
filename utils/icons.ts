import { createBinding, createComputed } from "ags";
import AstalBattery from "gi://AstalBattery?version=0.1";
import AstalNetwork from "gi://AstalNetwork";
import AstalWp from "gi://AstalWp?version=0.1";

export const icons = {
   search: "search-symbolic",
   arrow: {
      left: "chevron-left-symbolic",
      right: "chevron-right-symbolic",
      down: "chevron-down-symbolic",
      up: "chevron-up-symbolic",
   },
   trash: "trash-2-symbolic",
   player: {
      icon: "music-symbolic",
      play: "play-symbolic",
      pause: "pause-symbolic",
      prev: "skip-back-symbolic",
      next: "skip-forward-symbolic",
   },
   refresh: "refresh-cw-symbolic",
   check: "check-symbolic",
   eye: {
      on: "eye-symbolic",
      off: "eye-off-symbolic",
   },
   powerprofiles: {
      "power-saver": "speedometer-1-symbolic",
      balanced: "speedometer-2-symbolic",
      performance: "speedometer-3-symbolic",
   } as Record<string, any>,
   network: {
      wifi: {
         disabled: "wifi-off-symbolic",
         1: "wifi-1-symbolic",
         2: "wifi-2-symbolic",
         3: "wifi-3-symbolic",
         4: "wifi-4-symbolic",
      },
      wired: "network-wired",
   },
   bluetooth: "bluetooth-icon-symbolic",
   web: "globe-symbolic",
   bell: "bell-symbolic",
   microphone: "mic-symbolic",
   microphone_muted: "mic-off-symbolic",
   powermenu: {
      sleep: "moon-symbolic",
      reboot: "refresh-cw-symbolic",
      logout: "log-out-symbolic",
      shutdown: "power-symbolic",
   } as Record<string, any>,
   screenshot: {
      area: "maximize-symbolic",
      all: "table-symbolic",
      monitor: "monitor-symbolic",
   },
   volume: {
      muted: "volume-x-symbolic",
      low: "volume-symbolic",
      medium: "volume-1-symbolic",
      high: "volume-2-symbolic",
   },
   battery: {
      charging: "battery-charging-symbolic",
      1: "battery-1-symbolic",
      2: "battery-2-symbolic",
      3: "battery-3-symbolic",
      4: "battery-4-symbolic",
   },
   brightness: "sun-symbolic",
   camera: "camera-symbolic",
   video: "video-symbolic",
   settings: "settings-symbolic",
   apps: {
      windowkill: "windowkill",
      "darksoulsremastered.exe": "dark-souls-remastered",
      "onscripter-ru.exe": "umineko",
   } as Record<string, any>,
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

   if (wifi !== null) {
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

      return icons.network.wifi.disabled;
   }

   if (wired !== null) {
      if (wired.internet === AstalNetwork.Internet.CONNECTED) {
         return icons.network.wired;
      } else {
         return icons.network.wired;
      }
   }

   return icons.network.wifi.disabled;
}

export function getNetworkIconBinding() {
   const network = AstalNetwork.get_default();

   if (network.wifi !== null) {
      return createComputed([
         createBinding(network, "connectivity"),
         createBinding(network.wifi, "strength"),
         createBinding(network, "primary"),
      ])(() => getNetworkIcon(network));
   } else {
      return createComputed([
         createBinding(network, "connectivity"),
         createBinding(network, "primary"),
      ])(() => getNetworkIcon(network));
   }
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
