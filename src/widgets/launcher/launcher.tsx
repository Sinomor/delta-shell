import Gtk from "gi://Gtk";
import { AppLauncher } from "./pages/applauncher";
import { Clipboard } from "./pages/clipboard";
import { hide_all_windows, windows_names } from "@/windows";
import Adw from "gi://Adw?version=1";
import { PopupWindow } from "../common/popupwindow";
import { createState } from "ags";
import { BarItemPopup } from "../common/baritempopup";
import { config } from "@/options";
const { width, height } = config.launcher;
export const [launcher_page, launcher_page_set] = createState("apps");

function Launcher() {
   return (
      <stack
         class={"main"}
         widthRequest={width.get()}
         transitionDuration={config.transition.get()}
         transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
         visibleChildName={launcher_page}
      >
         <AppLauncher />
         <Clipboard />
      </stack>
   );
}

export default function () {
   return (
      <BarItemPopup
         name={windows_names.launcher}
         module={"launcher"}
         width={width.get()}
         height={height.get()}
      >
         <Launcher />
      </BarItemPopup>
   );
}
