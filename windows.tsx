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
import NotificationsList from "./widgets/notifications/notificationslist";
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
   const monitors = createBinding(app, "monitors");

   app.add_window(Launcher() as Gtk.Window);
   app.add_window(Control() as Gtk.Window);
   app.add_window(Calendar() as Gtk.Window);
   app.add_window(Powermenu() as Gtk.Window);
   app.add_window(Verification() as Gtk.Window);
   if (config.weather.enabled.get()) app.add_window(Weather() as Gtk.Window);
   if (config.notifications.enabled.get()) {
      app.add_window(NotificationsList() as Gtk.Window);
      app.add_window(NotificationPopup() as Gtk.Window);
   }
   app.add_window(OSD() as Gtk.Window);

   return (
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
      </For>
   );
}
