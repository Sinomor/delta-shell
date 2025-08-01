import { Astal } from "ags/gtk4";
import { mkOptions, opt } from "./utils/options";
import GLib from "gi://GLib?version=2.0";
import { createState } from "ags";
export const configDir = GLib.get_user_config_dir();
const configFile = `${configDir}/delta-shell/config.json`;

const options = mkOptions(configFile, {
   theme: {
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
      accent: opt("#c88800"),
      blue: opt("#3584e4"),
      teel: opt("#2190a4"),
      green: opt("#3a944a"),
      yellow: opt("#c88800"),
      orange: opt("#ed5b00"),
      red: opt("#e62d42"),
      purple: opt("#9141ac"),
      slate: opt("#6f8396"),
      border: {
         width: opt(1),
         color: opt("#36363a"),
      },
      outline: {
         width: opt(1),
         color: opt("#c0c0c0"),
      },
      main_padding: opt(15),
      spacing: opt(10),
      radius: opt(0),
   },
   transition: opt(200),
   font: {
      size: opt(14),
      name: opt("Rubik"),
   },
   bar: {
      name: "bar",
      spacing: opt(6),
      modules: {
         start: opt(["launcher", "workspaces"]),
         center: opt(["clock"]),
         end: opt(["record_indicator", "tray", "keyboard", "sysbox"]),
      },
      height: opt(52),
      position: opt<"top" | "bottom">("top"),
      apps_icons: opt({}) as Record<string, any>,
      date: {
         format: opt("%b %d  %H:%M"),
      },
   },
   control: {
      name: "control",
      page: opt<"main" | "network" | "bluetooth" | "powermodes">("main"),
      default_coverArt: `${SRC}/assets/defsong.jpg`,
      width: opt(500),
      height: opt(0),
      margin: opt(10),
   },
   launcher: {
      name: "launcher",
      page: opt<"apps" | "clipboard">("apps"),
      clipboard: {
         max_items: opt(50),
         image_preview: opt<boolean>(false),
      },
      width: opt(500),
      height: opt(0),
      margin: opt(10),
   },
   osd: {
      name: "osd",
      width: opt(300),
      timeout: opt(3000),
      margin: opt(10),
   },
   calendar: {
      name: "calendar",
      margin: opt(10),
   },
   powermenu: {
      name: "powermenu",
   },
   verification: {
      name: "verification",
   },
   notifications_popup: {
      name: "notifications_popup",
      position: opt<
         | "top"
         | "top_left"
         | "top_right"
         | "bottom"
         | "bottom_left"
         | "bottom_right"
      >("top"),
      timeout: opt(3000),
      margin: opt(10),
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

export default options;
