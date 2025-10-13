import { icons } from "@/src/lib/icons";
import app from "ags/gtk4/app";
import { Gdk, Gtk } from "ags/gtk4";
import { onCleanup } from "ags";
import BarItem from "@/src/widgets/baritem";
import { hide_all_windows, windows_names } from "@/windows";
import { toggleWindow } from "@/src/lib/utils";
import { config } from "@/options";
import { launcher_page_set } from "../../launcher/launcher";

export function Launcher() {
   return (
      <BarItem
         window={windows_names.launcher}
         onPrimaryClick={() => {
            if (!app.get_window(windows_names.launcher)?.visible)
               hide_all_windows();
            launcher_page_set("apps");
            toggleWindow(windows_names.launcher);
         }}
         onSecondaryClick={() => {
            if (!app.get_window(windows_names.launcher)?.visible)
               hide_all_windows();
            launcher_page_set("clipboard");
            toggleWindow(windows_names.launcher);
         }}
      >
         <image iconName={icons.search} pixelSize={20} />
      </BarItem>
   );
}
