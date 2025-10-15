import app from "ags/gtk4/app";
import ScreenRecord from "./src/services/screenrecord";
import { hide_all_windows, windows_names } from "./windows";
import { hasBarItem, toggleQsModule, toggleWindow } from "./src/lib/utils";
import { config } from "./options";
import { launcher_page_set } from "./src/modules/launcher/launcher";
const screenrecord = ScreenRecord.get_default();

export default function request(
   args: string[],
   response: (res: string) => void,
): void {
   if (args[0] == "toggle" && args[1]) {
      switch (args[1]) {
         case "applauncher":
            if (!app.get_window(windows_names.launcher)?.visible)
               hide_all_windows();
            launcher_page_set("apps");
            toggleWindow(windows_names.launcher);
            break;
         case "quicksettings":
            if (!app.get_window(windows_names.quicksettings)?.visible)
               hide_all_windows();
            toggleWindow(windows_names.quicksettings);
            break;
         case "calendar":
            if (!app.get_window(windows_names.calendar)?.visible)
               hide_all_windows();
            toggleWindow(windows_names.calendar);
            break;
         case "powermenu":
            if (!app.get_window(windows_names.powermenu)?.visible)
               hide_all_windows();
            toggleWindow(windows_names.powermenu);
            break;
         case "clipboard":
            if (hasBarItem("clipboard")) {
               if (!app.get_window(windows_names.clipboard)?.visible)
                  hide_all_windows();
               toggleWindow(windows_names.clipboard);
               break;
            } else {
               if (!app.get_window(windows_names.launcher)?.visible)
                  hide_all_windows();
               launcher_page_set("clipboard");
               toggleWindow(windows_names.launcher);
               break;
            }
         case "weather":
            toggleQsModule("weather");
            break;
         case "notifications_list":
            toggleQsModule("notifications");
            break;
         case "volume":
            toggleQsModule("volume");
            break;
         case "network":
            toggleQsModule("network");
            break;
         case "bluetooth":
            toggleQsModule("bluetooth");
            break;
         case "power":
            toggleQsModule("power");
            break;
         default:
            print("Unknown request:", request);
            return response("Unknown request");
            break;
      }
      return response("ok");
   } else {
      switch (args[0]) {
         case "screenrecord":
            screenrecord.start();
            break;
         default:
            print("Unknown request:", request);
            return response("Unknown request");
            break;
      }
      return response("ok");
   }
}
