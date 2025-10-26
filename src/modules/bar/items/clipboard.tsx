import { icons } from "@/src/lib/icons";
import app from "ags/gtk4/app";
import { Gdk, Gtk } from "ags/gtk4";
import { onCleanup } from "ags";
import BarItem from "@/src/widgets/baritem";
import { hide_all_windows, windows_names } from "@/windows";
import { toggleWindow } from "@/src/lib/utils";
import { config } from "@/options";
import { isVertical } from "../bar";

export function Clipboard() {
   return (
      <BarItem
         window={windows_names.clipboard}
         onPrimaryClick={() => toggleWindow(windows_names.clipboard)}
         hexpand={isVertical}
      >
         <image
            hexpand={isVertical}
            iconName={icons.clipboard}
            pixelSize={20}
         />
      </BarItem>
   );
}
