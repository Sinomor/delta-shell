import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { Accessor, createComputed, createState } from "ags";
import { hide_all_windows } from "@/windows";
import Graphene from "gi://Graphene?version=1.0";
import Adw from "gi://Adw?version=1";
import options from "@/options";
import { PopupWindow } from "./popupwindow";

type BarItemPopupProps = JSX.IntrinsicElements["window"] & {
   children?: any;
   module: string;
   width?: number;
   height?: number;
   margin?: number;
   gdkmonitor: Gdk.Monitor;
   transitionDuration?: number;
};

export function BarItemPopup({
   children,
   name,
   module,
   width,
   gdkmonitor,
   height,
   margin,
   transitionDuration = options.transition.get(),
   ...props
}: BarItemPopupProps) {
   const { bar } = options;
   const bar_pos = bar.position.get();
   const monitor_height = gdkmonitor.get_geometry().height;

   const module_pos = createComputed(
      [bar.modules.start, bar.modules.center, bar.modules.end],
      (start, center, end) => {
         if (start.includes(module)) return "start";
         if (center.includes(module)) return "center";
         if (end.includes(module)) return "end";
      },
   ).get();

   function halign() {
      switch (module_pos) {
         case "start":
            return Gtk.Align.START;
         case "center":
            return Gtk.Align.CENTER;
         case "end":
            return Gtk.Align.END;
      }
   }
   function valign() {
      if (height === 0) return Gtk.Align.FILL;
      switch (bar_pos) {
         case "top":
            return Gtk.Align.START;
         case "bottom":
            return Gtk.Align.END;
      }
   }

   function transitionType() {
      if (
         height === undefined ||
         !(height === 0 || height > monitor_height / 2)
      ) {
         return bar_pos === "top"
            ? Gtk.RevealerTransitionType.SLIDE_DOWN
            : Gtk.RevealerTransitionType.SLIDE_UP;
      }

      switch (module_pos) {
         case "start":
            return Gtk.RevealerTransitionType.SLIDE_RIGHT;
         case "end":
            return Gtk.RevealerTransitionType.SLIDE_LEFT;
         case "center":
            return bar_pos === "top"
               ? Gtk.RevealerTransitionType.SLIDE_DOWN
               : Gtk.RevealerTransitionType.SLIDE_UP;
      }
   }

   function margin_get(pos: string) {
      if (height === undefined) {
         return (bar_pos === "top" && pos === "bottom") ||
            (bar_pos === "bottom" && pos === "top")
            ? 0
            : margin;
      }
      if (height === 0) {
         return (module_pos === "start" && pos === "end") ||
            (module_pos === "end" && pos === "start")
            ? 0
            : margin;
      }
      if (height > monitor_height / 2) {
         if (module_pos === "center") {
            return (bar_pos === "top" && pos === "bottom") ||
               (bar_pos === "bottom" && pos === "top")
               ? 0
               : margin;
         }
         return (module_pos === "start" && pos === "end") ||
            (module_pos === "end" && pos === "start")
            ? 0
            : margin;
      }
      return (bar_pos === "top" && pos === "bottom") ||
         (bar_pos === "bottom" && pos === "top")
         ? 0
         : margin;
   }

   return (
      <PopupWindow
         name={name}
         valign={valign()}
         halign={halign()}
         gdkmonitor={gdkmonitor}
         height={height}
         width={width}
         margin_top={margin_get("top")}
         margin_bottom={margin_get("bottom")}
         margin_start={margin_get("start")}
         margin_end={margin_get("end")}
         transitionType={transitionType()}
         transitionDuration={transitionDuration}
      >
         {children}
      </PopupWindow>
   );
}
