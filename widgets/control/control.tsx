import Astal from "gi://Astal?version=4.0";
import Gdk from "gi://Gdk";
import Gtk from "gi://Gtk";
import app from "ags/gtk4/app";
import Graphene from "gi://Graphene?version=1.0";
import { NetworkPage } from "./pages/network";
import { MainPage } from "./pages/main";
import { BluetoothPage } from "./pages/bluetooth";
import { PowerModesPage } from "./pages/powermodes";
import { createComputed, onCleanup } from "ags";
import { hide_all_windows } from "@/windows";
import options from "@/options";
import Adw from "gi://Adw?version=1";
import { PopupWindow } from "../common/popupwindow";
import { BarItemPopup } from "../common/baritempopup";
const { name, page, width, height, margin } = options.control;

function Control() {
   return (
      <stack
         class={"control-main"}
         transitionDuration={options.transition.get()}
         widthRequest={width.get()}
         transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
         visibleChildName={page}
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
         name={name}
         module={"sysbox"}
         gdkmonitor={gdkmonitor}
         margin={margin.get()}
         width={width.get()}
         height={height.get()}
      >
         <Control />
      </BarItemPopup>
   );
}
