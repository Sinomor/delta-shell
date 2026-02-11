import GLib from "gi://GLib?version=2.0";
import { createState } from "ags";
import { mkOptions } from "./src/lib/option";
const configDir = GLib.get_user_config_dir();
const configFile = `${configDir}/delta-shell/config.json`;
const themeFile = `${configDir}/delta-shell/theme.json`;

export const config = mkOptions(configFile, {
   transition: 0.2,
   dock: {
      position: "bottom" as "top" | "bottom" | "left" | "right",
   },
   bar: {
      size: 48,
      position: "top" as "top" | "bottom" | "left" | "right",
      modules: {
         start: ["launcher", "workspaces"],
         center: ["clock"],
         end: ["recordindicator", "tray", "keyboard", "quicksettings"],
         launcher: {
            format: "{icon}",
            "on-click": "toggle-launcher" as string | null,
            "on-click-right": null as string | null,
            "on-click-middle": null as string | null,
         },
         battery: {
            format: "{icon}",
            "on-click": "toggle-power" as string | null,
            "on-click-right": null as string | null,
            "on-click-middle": null as string | null,
         },
         bluetooth: {
            format: "{icon}",
            "on-click": "toggle-bluetooth" as string | null,
            "on-click-right": null as string | null,
            "on-click-middle": null as string | null,
         },
         clipboard: {
            format: "{icon}",
            "on-click": "toggle-clipboard" as string | null,
            "on-click-right": null as string | null,
            "on-click-middle": null as string | null,
         },
         clock: {
            format: "%b %d  %H:%M",
            "on-click": "toggle-calendar" as string | null,
            "on-click-right": null as string | null,
            "on-click-middle": null as string | null,
         },
         workspaces: {
            "workspace-format": "{id}",
            "window-format": "{indicator} {icon}",
            "window-icon-size": 20,
            "taskbar-icons": {} as Record<string, string>,
            "hide-empty": false,
            "on-scroll-up": "workspace-up" as string | null,
            "on-scroll-down": "workspace-down" as string | null,
         },
         keyboard: {
            format: "{lang}",
            compact: true,
            "on-click": "switch-language" as string | null,
            "on-click-right": null as string | null,
            "on-click-middle": null as string | null,
         },
         network: {
            format: "{icon}",
            "on-click": "toggle-network" as string | null,
            "on-click-right": null as string | null,
            "on-click-middle": null as string | null,
         },
         volume: {
            format: "{icon}",
            "on-click": "toggle-volume" as string | null,
            "on-click-right": null as string | null,
            "on-click-middle": "volume-toggle" as string | null,
            "on-scroll-up": "volume-up" as string | null,
            "on-scroll-down": "volume-down" as string | null,
         },
         microphone: {
            format: "{icon}",
            "on-click": "toggle-volume" as string | null,
            "on-click-right": null as string | null,
            "on-click-middle": "microphone-toggle" as string | null,
            "on-scroll-up": "microphone-up" as string | null,
            "on-scroll-down": "microphone-down" as string | null,
         },
         weather: {
            format: "{icon} {temp}{temp-units}",
            "on-click": "toggle-weather" as string | null,
            "on-click-right": null as string | null,
            "on-click-middle": null as string | null,
         },
         recordindicator: {
            format: "{icon}",
            "on-click": "screenrecord-toggle" as string | null,
            "on-click-right": null as string | null,
            "on-click-middle": null as string | null,
         },
         notifications: {
            format: "{icon}",
            "on-click": "toggle-notifs" as string | null,
            "on-click-right": null as string | null,
            "on-click-middle": null as string | null,
         },
         powermenu: {
            format: "{icon}",
            "on-click": "toggle-powermenu" as string | null,
            "on-click-right": null as string | null,
            "on-click-middle": null as string | null,
         },
         quicksettings: {
            format: "{icon}",
            "on-click": "toggle-qs" as string | null,
            "on-click-right": null as string | null,
            "on-click-middle": null as string | null,
         },
         cpu: { format: "{icon} {usage}" },
         ram: { format: "{icon} {usage}" },
<<<<<<< HEAD
         taskbar: {
            format: "{pinned} {separator} {windows}",
            "window-format": "{indicator} {icon}",
            grouped: true,
            pinned: [],
            "window-icon-size": 20,
            icons: {} as Record<string, string>,
=======
         tray: {
            compact: true,
         },
         brightness: {
            format: "{icon}",
            "on-click": null as string | null,
            "on-click-right": null as string | null,
            "on-click-middle": null as string | null,
            "on-scroll-up": "brightness-up" as string | null,
            "on-scroll-down": "brightness-down" as string | null,
>>>>>>> main
         },
      },
   },
   quicksettings: {
      buttons: ["network", "bluetooth", "notifications", "screenrecord"],
      sliders: ["volume", "brightness"],
   },
   launcher: {
      width: 400,
      height: 500,
      centered: false,
      columns: 1,
      "sort-type": "frequency" as "frequency" | "alphabetical" | null,
   },
   clipboard: {
      enabled: true,
      "max-items": 50,
      "image-preview": true,
      width: 400,
      height: 500,
   },
   osd: {
      enabled: true,
      vertical: false,
      width: 300,
      height: 56,
      position: "bottom" as
         | "top"
         | "top-left"
         | "top-right"
         | "bottom"
         | "bottom-left"
         | "bottom-right"
         | "left"
         | "right",
      timeout: 3,
   },
   notifications: {
      position: "top" as
         | "top"
         | "top-left"
         | "top-right"
         | "bottom"
         | "bottom-left"
         | "bottom-right",
      enabled: true,
      timeout: 3,
      width: 400,
      list: {
         height: 500,
      },
   },
   weather: {
      enabled: true,
      location: {
         auto: false,
         coords: null as { latitude: string; longitude: string } | null,
         city: "Minsk" as string | null,
      },
   },
});

export const theme = mkOptions(themeFile, {
   font: {
      size: 14,
      name: "Rubik",
   },
   colors: {
      bg: {
         0: "#1d1d20",
         1: "#28282c",
         2: "#36363a",
         3: "#48484b",
      },
      fg: {
         0: "#ffffff",
         1: "#c0c0c0",
         2: "#808080",
      },
      accent: "#3584e4",
      blue: "#3584e4",
      cyan: "#2190a4",
      green: "#3a944a",
      yellow: "#c88800",
      orange: "#ed5b00",
      red: "#e62d42",
      purple: "#9141ac",
   },
   spacing: 10,
   shadow: true,
   radius: 8,
   "icon-size": {
      normal: 20,
      small: 16,
      large: 32,
   },
   window: {
      padding: 15,
      opacity: 1,
      margin: 10,
      border: {
         width: 2,
         color: "$bg2",
      },
      outline: {
         width: 2,
         color: "$fg1",
      },
      shadow: {
         offset: [0, 0],
         blur: 10,
         spread: 0,
         color: "black",
         opacity: 0.4,
      },
   },
   bar: {
      bg: "$bg0",
      opacity: 1,
      margin: [0, 0, 0, 0],
      padding: 6,
      spacing: 6,
      border: {
         width: 2,
         color: "$bg2",
      },
      shadow: {
         offset: [0, 0],
         blur: 10,
         spread: 0,
         color: "black",
         opacity: 0.4,
      },
      separator: {
         width: 2,
         color: "$bg2",
      },
      button: {
         fg: "$fg0",
         padding: [0, 8],
         bg: {
            default: "$bg0",
            hover: "$bg1",
            active: "$bg2",
         },
         opacity: 1,
         border: {
            width: 0,
            color: "$bg2",
         },
      },
   },
});
