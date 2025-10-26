import { icons } from "@/src/lib/icons";
import app from "ags/gtk4/app";
import { Gdk, Gtk } from "ags/gtk4";
import { onCleanup } from "ags";
import BarItem from "@/src/widgets/baritem";
import { hide_all_windows, windows_names } from "@/windows";
import { hasBarItem, toggleWindow } from "@/src/lib/utils";
import { config } from "@/options";
import { isVertical } from "../bar";

export function Launcher() {
   return (
      <BarItem
         window={windows_names.applauncher}
         onPrimaryClick={() => toggleWindow(windows_names.applauncher)}
         onSecondaryClick={() => {
            if (!hasBarItem("clipboard")) {
               toggleWindow(windows_names.clipboard);
            }
         }}
         hexpand={isVertical}
      >
         <image hexpand={isVertical} iconName={icons.search} pixelSize={20} />
      </BarItem>
   );
}
