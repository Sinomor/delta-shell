import Gtk from "gi://Gtk";
import { NetworkPage } from "./pages/network";
import { MainPage } from "./pages/main";
import { BluetoothPage } from "./pages/bluetooth";
import { PowerModesPage } from "./pages/powermodes";
import { createState } from "ags";
import { hide_all_windows, windows_names } from "@/windows";
import { PopupWindow } from "../common/popupwindow";
import { BarItemPopup } from "../common/baritempopup";
import { config } from "@/options";
export const [control_page, control_page_set] = createState("main");

function Control() {
   return (
      <stack
         class={"main"}
         transitionDuration={config.transition.get() * 1000}
         widthRequest={440}
         transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
         visibleChildName={control_page}
      >
         <NetworkPage />
         <MainPage />
         <BluetoothPage />
         <PowerModesPage />
      </stack>
   );
}

export default function () {
   return (
      <BarItemPopup name={windows_names.control} module={"sysbox"} width={440}>
         <Control />
      </BarItemPopup>
   );
}
