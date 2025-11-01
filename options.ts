import { Astal } from "ags/gtk4";
import { mkOptions, opt } from "./src/lib/option";
import GLib from "gi://GLib?version=2.0";
import { createState } from "ags";
export const configDir = GLib.get_user_config_dir();
const configFile = `${configDir}/delta-shell/config.json`;
const themeFile = `${configDir}/delta-shell/theme.json`;

export const config = mkOptions(configFile, {
   transition: opt(0.2),
   bar: {
      modules: {
         start: opt(["launcher", "workspaces"]),
         center: opt(["clock"]),
         end: opt(["recordindicator", "tray", "keyboard", "quicksettings"]),
         launcher: {
            format: opt("{icon}"),
            "on-click": opt("toggle-launcher"),
            "on-click-right": opt(null),
            "on-click-middle": opt(null),
         },
         battery: {
            format: opt("{icon}"),
            "on-click": opt("toggle-power"),
            "on-click-right": opt(null),
            "on-click-middle": opt(null),
         },
         bluetooth: {
            format: opt("{icon}"),
            "on-click": opt("toggle-bluetooth"),
            "on-click-right": opt(null),
            "on-click-middle": opt(null),
         },
         clipboard: {
            format: opt("{icon}"),
            "on-click": opt("toggle-clipboard"),
            "on-click-right": opt(null),
            "on-click-middle": opt(null),
         },
         clock: {
            format: opt("%b %d  %H:%M"),
            "on-click": opt("toggle-calendar"),
            "on-click-right": opt(null),
            "on-click-middle": opt(null),
         },
         workspaces: {
            taskbar: opt<boolean>(true),
            "taskbar-icons": opt({}) as Record<string, any>,
            "on-scroll-up": opt("workspace-up"),
            "on-scroll-down": opt("workspace-down"),
         },
         keyboard: {
            format: opt("{lang}"),
            "on-click": opt("switch-language"),
            "on-click-right": opt(null),
            "on-click-middle": opt(null),
         },
         network: {
            format: opt("{icon}"),
            "on-click": opt("toggle-network"),
            "on-click-right": opt(null),
            "on-click-middle": opt(null),
         },
         volume: {
            format: opt("{icon}"),
            "on-click": opt("toggle-volume"),
            "on-click-right": opt(null),
            "on-click-middle": opt("volume-toggle"),
            "on-scroll-up": opt("volume-up"),
            "on-scroll-down": opt("volume-down"),
         },
         weather: {
            format: opt("{icon} {temp}{units}"),
            "on-click": opt("toggle-weather"),
            "on-click-right": opt(null),
            "on-click-middle": opt(null),
         },
         recordindicator: {
            format: opt("{icon}"),
            "on-click": opt("screenrecord-toggle"),
            "on-click-right": opt(null),
            "on-click-middle": opt(null),
         },
         notifications: {
            format: opt("{icon}"),
            "on-click": opt("toggle-notifs"),
            "on-click-right": opt(null),
            "on-click-middle": opt(null),
         },
         powermenu: {
            format: opt("{icon}"),
            "on-click": opt("toggle-powermenu"),
            "on-click-right": opt(null),
            "on-click-middle": opt(null),
         },
         quicksettings: {
            format: opt("{icon}"),
            "on-click": opt("toggle-qs"),
            "on-click-right": opt(null),
            "on-click-middle": opt(null),
         },
      },
      size: opt(48),
      position: opt<"top" | "bottom" | "right" | "left">("top"),
   },
   quicksettings: {
      buttons: opt(["network", "bluetooth", "notifications", "screenrecord"]),
      sliders: opt(["volume", "brightness"]),
   },
   launcher: {
      width: opt(400),
      height: opt(600),
   },
   clipboard: {
      enabled: opt(true),
      "max-items": opt(50),
      "image-preview": opt<boolean>(true),
      width: opt(500),
      height: opt(500),
   },
   osd: {
      enabled: opt<boolean>(true),
      vertical: opt<boolean>(false),
      width: opt(300),
      height: opt(56),
      position: opt<
         | "top"
         | "top_left"
         | "top_right"
         | "bottom"
         | "bottom_left"
         | "bottom_right"
         | "left"
         | "right"
      >("bottom"),
      timeout: opt(3),
   },
   notifications: {
      position: opt<
         | "top"
         | "top_left"
         | "top_right"
         | "bottom"
         | "bottom_left"
         | "bottom_right"
      >("top"),
      enabled: opt<boolean>(true),
      timeout: opt(3),
      width: opt(400),
      list: {
         height: opt(600),
      },
   },
   weather: {
      enabled: opt<boolean>(true),
      location: opt<{
         auto: boolean;
         coords: { latitude: string; longitude: string } | null | undefined;
         city: string | null | undefined;
      }>({
         auto: false,
         coords: null,
         city: "Minsk",
      }),
   },
});

export const theme = mkOptions(themeFile, {
   font: {
      size: opt(14),
      name: opt("Rubik"),
   },
   colors: {
      bg: {
         0: opt("#1d1d20"),
         1: opt("#28282c"),
         2: opt("#36363a"),
         3: opt("#48484b"),
      },
      fg: {
         0: opt("#ffffff"),
         1: opt("#c0c0c0"),
         2: opt("#808080"),
      },
      accent: opt("#3584e4"),
      blue: opt("#3584e4"),
      cyan: opt("#2190a4"),
      green: opt("#3a944a"),
      yellow: opt("#c88800"),
      orange: opt("#ed5b00"),
      red: opt("#e62d42"),
      purple: opt("#9141ac"),
   },
   border: {
      width: opt(1),
      color: opt("$bg2"),
   },
   outline: {
      width: opt(1),
      color: opt("$fg1"),
   },
   spacing: opt(10),
   shadow: opt<boolean>(true),
   radius: opt(0),
   window: {
      padding: opt(15),
      opacity: opt(1),
      margin: opt(10),
      border: {
         width: opt(1),
         color: opt("$bg2"),
      },
      outline: {
         width: opt(1),
         color: opt("$fg1"),
      },
      shadow: {
         offset: opt([0, 0]),
         blur: opt(10),
         spread: opt(0),
         color: opt("black"),
         opacity: opt(0.4),
      },
   },
   bar: {
      bg: opt("$bg0"),
      opacity: opt(1),
      margin: opt<number[]>([0, 0, 0, 0]),
      padding: opt(6),
      spacing: opt(6),
      border: {
         width: opt(1),
         color: opt("$bg2"),
      },
      shadow: {
         offset: opt([0, 0]),
         blur: opt(10),
         spread: opt(0),
         color: opt("black"),
         opacity: opt(0.4),
      },
      separator: {
         width: opt(1),
         color: opt("$bg2"),
      },
      button: {
         fg: opt("$fg0"),
         padding: opt([0, 7]),
         bg: {
            default: opt("$bg0"),
            hover: opt("$bg1"),
            active: opt("$bg2"),
         },
         opacity: opt(1),
         border: {
            width: opt(0),
            color: opt("$bg2"),
         },
      },
   },
});

export const [compositor, compositor_set] = createState<string>("");

function getCompositor() {
   const env = GLib.getenv("XDG_SESSION_DESKTOP");
   switch (env) {
      case "niri":
         return "niri";
      case "Hyprland":
         return "hyprland";
      default:
         return "unknown";
   }
}
compositor_set(getCompositor());
