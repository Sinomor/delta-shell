import Bar from "./widgets/bar/bar";
import OSD from "./widgets/osd/osd";
import Launcher from "./widgets/launcher/launcher";
import Control, { control_page_set } from "./widgets/control/control";
import Calendar from "./widgets/calendar/calendar";
import Powermenu from "./widgets/powermenu/powermenu";
import Verification from "./widgets/powermenu/verification";
import { NotificationPopup } from "./widgets/notifications/notificationpopup";
import app from "ags/gtk4/app";
import Weather from "./widgets/weather/weather";
import BarShadow from "./widgets/bar/items/shadow";
import { config, theme } from "./options";

export const windows_names = {
   bar: "bar",
   bar_shadow: "bar_shadow",
   launcher: "launcher",
   notifications_popup: "notifications_popup",
   control: "control",
   osd: "osd",
   powermenu: "powermenu",
   verification: "verification",
   weather: "weather",
   calendar: "calendar",
};

export function hide_all_windows() {
   app.get_window(windows_names.launcher)?.hide();
   app.get_window(windows_names.powermenu)?.hide();
   app.get_window(windows_names.verification)?.hide();
   app.get_window(windows_names.calendar)?.hide();
   app.get_window(windows_names.control)?.hide();
   config.weather.enabled.get() &&
      app.get_window(windows_names.weather)?.hide();
   control_page_set("main");
}

export default [
   Bar,
   theme.shadow.get() && BarShadow,
   Launcher,
   NotificationPopup,
   Control,
   Powermenu,
   Verification,
   Calendar,
   OSD,
   config.weather.enabled.get() && Weather,
].filter(Boolean);
