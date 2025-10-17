import { icons } from "@/src/lib/icons";
import app from "ags/gtk4/app";
import { Gdk, Gtk } from "ags/gtk4";
import { onCleanup } from "ags";
import BarItem from "@/src/widgets/baritem";
import { hide_all_windows, windows_names } from "@/windows";
import { hasBarItem, toggleWindow } from "@/src/lib/utils";
import { config } from "@/options";

export function Launcher() {
   return (
      <BarItem
         window={windows_names.applauncher}
         onPrimaryClick={() => {
            if (!app.get_window(windows_names.applauncher)?.visible)
               hide_all_windows();
            toggleWindow(windows_names.applauncher);
         }}
         onSecondaryClick={() => {
            if (!hasBarItem("clipboard")) {
               if (!app.get_window(windows_names.clipboard)?.visible)
                  hide_all_windows();
               toggleWindow(windows_names.clipboard);
            }
         }}
      >
         <image iconName={icons.search} pixelSize={20} />
      </BarItem>
   );
}
