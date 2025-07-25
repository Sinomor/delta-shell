import { icons } from "../../../utils/icons";
import app from "ags/gtk4/app";
import { Gdk, Gtk } from "ags/gtk4";
import { onCleanup } from "ags";
import options from "@/options";
import BarItem from "@/widgets/common/baritem";
import { hide_all_windows } from "@/windows";
import { toggleWindow } from "@/utils/utils";
const { name, page } = options.launcher;

export function Launcher() {
   return (
      <BarItem
         window={name}
         onPrimaryClick={() => {
            if (!app.get_window(name)?.visible) hide_all_windows();
            page.set("apps");
            toggleWindow(name);
         }}
         onSecondaryClick={() => {
            if (!app.get_window(name)?.visible) hide_all_windows();
            page.set("clipboard");
            toggleWindow(name);
         }}
      >
         <image iconName={icons.search} pixelSize={20} />
      </BarItem>
   );
}
