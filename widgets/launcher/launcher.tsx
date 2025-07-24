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
const { name, page, width, height, margin } = options.launcher;

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
   const valign = createComputed([bar.position, height], (pos, height) => {
      if (height === 0) return Gtk.Align.FILL;
      if (pos.includes("top")) return Gtk.Align.START;
      if (pos.includes("bottom")) return Gtk.Align.END;
   });
   const transitionType = createComputed(
      [bar.position, bar.modules.start, bar.modules.center, bar.modules.end],
      (pos, start, center, end) => {
         if (start.includes("launcher"))
            return Gtk.RevealerTransitionType.SLIDE_RIGHT;
         if (center.includes("launcher"))
            return Gtk.RevealerTransitionType.SLIDE_DOWN;
         if (end.includes("launcher"))
            return Gtk.RevealerTransitionType.SLIDE_LEFT;
      },
   );

   return (
      <PopupWindow
         name={name}
         margin={margin.get()}
         width={width.get()}
         height={height.get()}
         valign={valign.get()}
         halign={halign.get()}
         transitionType={transitionType.get()}
      >
         <Launcher />
      </PopupWindow>
   );
}
