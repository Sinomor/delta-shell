import { icons } from "@/src/lib/icons";
import app from "ags/gtk4/app";
import BarItem from "@/src/widgets/baritem";
import { hide_all_windows, windows_names } from "@/windows";
import { toggleWindow } from "@/src/lib/utils";
import { isVertical } from "../bar";

export function QuickSettings() {
   return (
      <BarItem
         window={windows_names.quicksettings}
         onPrimaryClick={() => toggleWindow(windows_names.quicksettings)}
         hexpand={isVertical}
      >
         <image hexpand={isVertical} pixelSize={20} iconName={icons.settings} />
      </BarItem>
   );
}
