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
import { NotificationsListWindow } from "./src/windows/notificationslist";
import { NotificationsWindow } from "./src/windows/notifications";
import { VolumeWindow } from "./src/windows/volume";
import { NetworkWindow } from "./src/windows/network";
import { BluetoothWindow } from "./src/windows/bluetooth";
import { PowerWindow } from "./src/windows/power";
import { hasBarItem } from "./src/lib/utils";
import { ClipboardWindow } from "./src/windows/clipboard";
import { AppLauncherWindow } from "./src/windows/applauncher";

export const windows_names = {
   bar: "bar",
   bar_shadow: "bar_shadow",
   applauncher: "applauncher",
   notifications_popup: "notificationspopup",
   quicksettings: "quicksettings",
   osd: "osd",
   powermenu: "powermenu",
   verification: "verification",
   weather: "weather",
   calendar: "calendar",
   notificationslist: "notificationslist",
   volume: "volume",
   network: "network",
   bluetooth: "bluetooth",
   power: "power",
   clipboard: "clipboard",
};

export function hide_all_windows() {
   app.get_window(windows_names.applauncher)?.hide();
   app.get_window(windows_names.powermenu)?.hide();
   app.get_window(windows_names.verification)?.hide();
   app.get_window(windows_names.calendar)?.hide();
   app.get_window(windows_names.quicksettings)?.hide();
   app.get_window(windows_names.volume)?.hide();
   app.get_window(windows_names.network)?.hide();
   app.get_window(windows_names.bluetooth)?.hide();
   app.get_window(windows_names.power)?.hide();
   app.get_window(windows_names.clipboard)?.hide();
   config.weather.enabled.get() &&
      app.get_window(windows_names.weather)?.hide();
   config.notifications.enabled.get() &&
      app.get_window(windows_names.notificationslist)?.hide();
   qs_page_set("main");
}

export function windows() {
   AppLauncherWindow();
   QuickSettingsWindow();
   CalendarWindow();
   PowerMenuWindow();
   VerificationWindow();
   if (config.weather.enabled.get()) hasBarItem("weather") && WeatherWindow();
   if (config.notifications.enabled.get()) {
      hasBarItem("notificationslist") && NotificationsListWindow();
      NotificationsWindow();
   }
   if (config.osd.enabled.get()) OsdWindow();
   if (config.clipboard.enabled.get()) ClipboardWindow();
   hasBarItem("volume") && VolumeWindow();
   hasBarItem("network") && NetworkWindow();
   hasBarItem("bluetooth") && BluetoothWindow();
   hasBarItem("battery") && PowerWindow();
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
