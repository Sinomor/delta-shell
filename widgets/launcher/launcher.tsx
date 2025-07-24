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
import { createComputed } from "ags";
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
   const { bar } = options;
   const halign = createComputed(
      [bar.position, bar.modules.start, bar.modules.center, bar.modules.end],
      (pos, start, center, end) => {
         if (start.includes("launcher")) return Gtk.Align.START;
         if (center.includes("launcher")) return Gtk.Align.CENTER;
         if (end.includes("launcher")) return Gtk.Align.END;
      },
   );

   return (
      <PopupWindow
         name={name}
         margin={margin.get()}
         width={width.get()}
         halign={halign.get()}
      >
         <Launcher />
      </PopupWindow>
   );
}
