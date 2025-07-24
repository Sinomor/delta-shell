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
const { name, page, width, margin } = options.control;

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
   const { bar } = options;
   const halign = createComputed(
      [bar.position, bar.modules.start, bar.modules.center, bar.modules.end],
      (pos, start, center, end) => {
         if (start.includes("sysbox")) return Gtk.Align.START;
         if (center.includes("sysbox")) return Gtk.Align.CENTER;
         if (end.includes("sysbox")) return Gtk.Align.END;
      },
   );

   return (
      <PopupWindow
         name={name}
         margin={margin.get()}
         width={width.get()}
         halign={halign.get()}
      >
         <Control />
      </PopupWindow>
   );
}
