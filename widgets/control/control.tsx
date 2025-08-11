import Astal from "gi://Astal?version=4.0";
import Gdk from "gi://Gdk";
import Gtk from "gi://Gtk";
import app from "ags/gtk4/app";
import Graphene from "gi://Graphene?version=1.0";
import { NetworkPage } from "./pages/network";
import { MainPage } from "./pages/main";
import { BluetoothPage } from "./pages/bluetooth";
import { PowerModesPage } from "./pages/powermodes";
import { createComputed, createState, onCleanup } from "ags";
import { hide_all_windows, windows_names } from "@/windows";
import Adw from "gi://Adw?version=1";
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

export default function (gdkmonitor: Gdk.Monitor) {
   return (
      <BarItemPopup
         name={windows_names.control}
         module={"sysbox"}
         gdkmonitor={gdkmonitor}
         width={440}
      >
         <Control />
      </BarItemPopup>
   );
}
