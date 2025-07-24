import app from "ags/gtk4/app";
import options from "./options";
import ScreenRecord from "./services/screenrecord";
import { hide_all_windows } from "./windows";
const screenrecord = ScreenRecord.get_default();

export default function request(
   request: string,
   res: (response: any) => void,
): void {
   const args = request.split(" ");
   if (args[0] == "toggle" && args[1]) {
      switch (args[1]) {
         case "applauncher":
            if (!app.get_window(options.launcher.name)?.visible)
               hide_all_windows();
            options.launcher.page.set("apps");
            app.toggle_window(options.launcher.name);
            break;
         case "clipboard":
            if (!app.get_window(options.launcher.name)?.visible)
               hide_all_windows();
            options.launcher.page.set("clipboard");
            app.toggle_window(options.launcher.name);
            break;
         case "control":
            if (!app.get_window(options.control.name)?.visible)
               hide_all_windows();
            app.toggle_window(options.control.name);
            break;
         case "calendar":
            if (!app.get_window(options.calendar.name)?.visible)
               hide_all_windows();
            app.toggle_window(options.calendar.name);
            break;
         case "powermenu":
            if (!app.get_window(options.powermenu.name)?.visible)
               hide_all_windows();
            app.toggle_window(options.powermenu.name);
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
