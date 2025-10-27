import app from "ags/gtk4/app";
import ScreenRecord from "./src/services/screenrecord";
import { hide_all_windows, windows_names } from "./windows";
import { hasBarItem, toggleQsModule, toggleWindow } from "./src/lib/utils";
import { config } from "./options";
const screenrecord = ScreenRecord.get_default();

export default function request(
   args: string[],
   response: (res: string) => void,
): void {
   if (args[0] == "toggle" && args[1]) {
      switch (args[1]) {
         case "applauncher":
            toggleWindow(windows_names.applauncher);
            break;
         case "quicksettings":
            toggleWindow(windows_names.quicksettings);
            break;
         case "calendar":
            toggleWindow(windows_names.calendar);
            break;
         case "powermenu":
            toggleWindow(windows_names.powermenu);
            break;
         case "clipboard":
            toggleWindow(windows_names.clipboard);
            break;
         case "weather":
            toggleQsModule("weather");
            break;
         case "notificationslist":
            toggleQsModule("notificationslist");
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
            toggleQsModule("power", "battery");
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
