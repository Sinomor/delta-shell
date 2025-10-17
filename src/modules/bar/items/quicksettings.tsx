import { icons } from "@/src/lib/icons";
import app from "ags/gtk4/app";
import BarItem from "@/src/widgets/baritem";
import { hide_all_windows, windows_names } from "@/windows";
import { toggleWindow } from "@/src/lib/utils";

export function QuickSettings() {
   return (
      <BarItem
         window={windows_names.quicksettings}
         onPrimaryClick={() => {
            if (!app.get_window(windows_names.quicksettings)?.visible)
               hide_all_windows();
            toggleWindow(windows_names.quicksettings);
         }}
      >
         <image pixelSize={20} iconName={icons.settings} />
      </BarItem>
   );
}
