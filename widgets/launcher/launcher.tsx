import Astal from "gi://Astal?version=4.0";
import Gdk from "gi://Gdk";
import Gtk from "gi://Gtk";
import app from "ags/gtk4/app";
import Graphene from "gi://Graphene?version=1.0";
import { AppLauncher } from "./pages/applauncher";
import { Clipboard } from "./pages/clipboard";
import { hide_all_windows } from "@/windows";
import Adw from "gi://Adw?version=1";
import options from "@/options";
import { PopupWindow } from "../common/popupwindow";
const { name, page, width, margin } = options.launcher;

function Launcher() {
   return (
      <stack
         class="launcher-main"
         widthRequest={width.get()}
         transitionDuration={options.transition.get()}
         transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
         visibleChildName={page}
      >
         <AppLauncher />
         <Clipboard />
      </stack>
   );
}

export default function (gdkmonitor: Gdk.Monitor) {
   return (
      <PopupWindow
         name={name}
         margin={margin.get()}
         width={width.get()}
         halign={Gtk.Align.START}
      >
         <Launcher />
      </PopupWindow>
   );
}
