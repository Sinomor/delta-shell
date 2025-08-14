import app from "ags/gtk4/app";
import ScreenRecord from "./src/services/screenrecord";
import { hide_all_windows, windows_names } from "./windows";
import { toggleWindow } from "./src/lib/utils";
import { config } from "./options";
import { launcher_page_set } from "./src/widgets/launcher/launcher";
const screenrecord = ScreenRecord.get_default();

export default function request(
   request: string,
   res: (response: any) => void,
): void {
   const args = request.split(" ");
   if (args[0] == "toggle" && args[1]) {
      switch (args[1]) {
         case "applauncher":
            if (!app.get_window(windows_names.launcher)?.visible)
               hide_all_windows();
            launcher_page_set("apps");
            toggleWindow(windows_names.launcher);
            break;
         case "clipboard":
            if (!app.get_window(windows_names.launcher)?.visible)
               hide_all_windows();
            launcher_page_set("clipboard");
            toggleWindow(windows_names.launcher);
            break;
         case "control":
            if (!app.get_window(windows_names.control)?.visible)
               hide_all_windows();
            toggleWindow(windows_names.control);
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
         case "weather":
            if (!app.get_window(windows_names.weather)?.visible)
               hide_all_windows();
            toggleWindow(windows_names.weather);
            break;
         case "notifications_list":
            if (!app.get_window(windows_names.notifications_list)?.visible)
               hide_all_windows();
            toggleWindow(windows_names.notifications_list);
            break;
         default:
            print("Unknown request:", request);
            return res("Unknown request");
            break;
      }
      return res("ok");
   } else {
      switch (args[0]) {
         case "screenrecord":
            screenrecord.start();
            break;
         default:
            print("Unknown request:", request);
            return res("Unknown request");
            break;
      }
      return res("ok");
   }
}
