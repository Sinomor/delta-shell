import Bar from "./src/widgets/bar/bar";
import OSD from "./src/widgets/osd/osd";
import Launcher from "./src/widgets/launcher/launcher";
import Control, { control_page_set } from "./src/widgets/control/control";
import Calendar from "./src/widgets/calendar/calendar";
import Powermenu from "./src/widgets/powermenu/powermenu";
import Verification from "./src/widgets/powermenu/verification";
import { NotificationPopup } from "./src/widgets/notifications/notificationpopup";
import app from "ags/gtk4/app";
import Weather from "./src/widgets/weather/weather";
import BarShadow from "./src/widgets/bar/shadow";
import { config, theme } from "./options";
import NotificationsList from "./src/widgets/notifications/notificationslist";
import { createBinding, For, onCleanup, This } from "ags";
import { Gtk } from "ags/gtk4";

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
   notifications_list: "notifications_list",
};

export function hide_all_windows() {
   app.get_window(windows_names.launcher)?.hide();
   app.get_window(windows_names.powermenu)?.hide();
   app.get_window(windows_names.verification)?.hide();
   app.get_window(windows_names.calendar)?.hide();
   app.get_window(windows_names.control)?.hide();
   config.weather.enabled.get() &&
      app.get_window(windows_names.weather)?.hide();
   config.notifications.enabled.get() &&
      app.get_window(windows_names.notifications_list)?.hide();
   control_page_set("main");
}

export function windows() {
   Launcher();
   Control();
   Calendar();
   Powermenu();
   Verification();
   if (config.weather.enabled.get()) Weather();
   if (config.notifications.enabled.get()) {
      NotificationsList();
      NotificationPopup();
   }
   OSD();

   const monitors = createBinding(app, "monitors");

   <For each={monitors}>
      {(monitor) => (
         <This this={app}>
            <Bar
               gdkmonitor={monitor}
               $={(self) => onCleanup(() => self.destroy())}
            />
            {theme.shadow.get() && (
               <BarShadow
                  gdkmonitor={monitor}
                  $={(self) => onCleanup(() => self.destroy())}
               />
            )}
         </This>
      )}
   </For>;
}
