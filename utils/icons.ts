import { createBinding, createComputed } from "ags";
import AstalBattery from "gi://AstalBattery?version=0.1";
import AstalNetwork from "gi://AstalNetwork";
import AstalWp from "gi://AstalWp?version=0.1";

export const icons = {
   alert: {
      circle: "ds-alert-circle-symbolic",
      octagon: "ds-alert-octagon-symbolic",
      triangle: "ds-alert-triangle-symbolic",
   },
   search: "ds-search-symbolic",
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
   eye: {
      on: "ds-eye-symbolic",
      off: "ds-eye-off-symbolic",
   },
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
      wired: "network-wired",
   },
   bluetooth: "ds-bluetooth-symbolic",
   web: "ds-globe-symbolic",
   bell: "ds-bell-symbolic",
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
   camera: "ds-camera-symbolic",
   video: "ds-video-symbolic",
   settings: "ds-settings-symbolic",
   apps_default: "application-x-executable",
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
