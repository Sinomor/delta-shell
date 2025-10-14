import { BarShadowWindow, BarWindow } from "./src/windows/bar";
import app from "ags/gtk4/app";
import { config, theme } from "./options";
import { createBinding, For, onCleanup, This } from "ags";
import { Gtk } from "ags/gtk4";
import { qs_page_set } from "./src/modules/quicksettings/quicksettings";
import { WeatherWindow } from "./src/windows/weather";
import { QuickSettingsWindow } from "./src/windows/quicksettings";
import { CalendarWindow } from "./src/windows/calendar";
import { PowerMenuWindow, VerificationWindow } from "./src/windows/powermenu";
import { OsdWindow } from "./src/windows/osd";
import { LauncherWindow } from "./src/windows/launcher";
import { NotificationsListWindow } from "./src/windows/notificationslist";
import { NotificationsWindow } from "./src/windows/notifications";
import { VolumeWindow } from "./src/windows/volume";
import { NetworkWindow } from "./src/windows/network";
import { BluetoothWindow } from "./src/windows/bluetooth";

export const windows_names = {
   bar: "bar",
   bar_shadow: "bar_shadow",
   launcher: "launcher",
   notifications_popup: "notifications_popup",
   quicksettings: "quicksettings",
   osd: "osd",
   powermenu: "powermenu",
   verification: "verification",
   weather: "weather",
   calendar: "calendar",
   notifications_list: "notifications_list",
   volume: "volume",
   network: "network",
   bluetooth: "bluetooth",
};

export function hide_all_windows() {
   app.get_window(windows_names.launcher)?.hide();
   app.get_window(windows_names.powermenu)?.hide();
   app.get_window(windows_names.verification)?.hide();
   app.get_window(windows_names.calendar)?.hide();
   app.get_window(windows_names.quicksettings)?.hide();
   app.get_window(windows_names.volume)?.hide();
   app.get_window(windows_names.network)?.hide();
   app.get_window(windows_names.bluetooth)?.hide();
   config.weather.enabled.get() &&
      app.get_window(windows_names.weather)?.hide();
   config.notifications.enabled.get() &&
      app.get_window(windows_names.notifications_list)?.hide();
   qs_page_set("main");
}

export function windows() {
   LauncherWindow();
   QuickSettingsWindow();
   CalendarWindow();
   PowerMenuWindow();
   VerificationWindow();
   if (config.weather.enabled.get()) WeatherWindow();
   if (config.notifications.enabled.get()) {
      NotificationsListWindow();
      NotificationsWindow();
   }
   OsdWindow();
   VolumeWindow();
   NetworkWindow();
   BluetoothWindow();
   const monitors = createBinding(app, "monitors");

   <For each={monitors}>
      {(monitor) => (
         <This this={app}>
            <BarWindow
               gdkmonitor={monitor}
               $={(self) => onCleanup(() => self.destroy())}
            />
            {theme.shadow.get() && (
               <BarShadowWindow
                  gdkmonitor={monitor}
                  $={(self) => onCleanup(() => self.destroy())}
               />
            )}
         </This>
      )}
   </For>;
}
