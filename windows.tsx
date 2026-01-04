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
import { dependencies, hasBarItem } from "./src/lib/utils";
import { ClipboardWindow } from "./src/windows/clipboard";
import { AppLauncherWindow } from "./src/windows/applauncher";
import { DockWindow } from "./src/windows/dock";

export const windows_names = {
   bar: "bar",
   bar_shadow: "barshadow",
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
   dock: "dock",
};

export function hideWindows() {
   const ignore = [
      windows_names.bar,
      windows_names.bar_shadow,
      windows_names.osd,
      windows_names.dock,
   ];

   app.get_windows()
      .filter((window) => !ignore.includes(window.name))
      .forEach((w) => {
         app.get_window(w.name)?.hide();
      });
   qs_page_set("main");
}

export function windows() {
   AppLauncherWindow();
   QuickSettingsWindow();
   CalendarWindow();
   PowerMenuWindow();
   VerificationWindow();
   if (config.weather.enabled) hasBarItem("weather") && WeatherWindow();
   if (config.notifications.enabled) {
      hasBarItem("notificationslist") && NotificationsListWindow();
      NotificationsWindow();
   }
   if (config.osd.enabled) OsdWindow();
   if (dependencies("wl-paste", "cliphist"))
      config.clipboard.enabled && ClipboardWindow();
   if (hasBarItem("volume") || hasBarItem("microphone")) VolumeWindow();
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
            <DockWindow
               gdkmonitor={monitor}
               $={(self) => onCleanup(() => self.destroy())}
            />
            {theme.shadow && (
               <BarShadowWindow
                  gdkmonitor={monitor}
                  $={(self) => onCleanup(() => self.destroy())}
               />
            )}
         </This>
      )}
   </For>;
}
