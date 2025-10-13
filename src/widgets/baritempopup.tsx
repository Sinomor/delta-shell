import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { Accessor, createComputed, createState } from "ags";
import { hide_all_windows } from "@/windows";
import Graphene from "gi://Graphene?version=1.0";
import Adw from "gi://Adw?version=1";
import { Popup } from "./popup";
import { config, theme } from "@/options";

type BarItemPopupProps = JSX.IntrinsicElements["window"] & {
   children?: any;
   module: string;
   width?: number;
   height?: number;
   margin?: number;
   gdkmonitor?: Gdk.Monitor;
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
   transitionDuration = config.transition.get(),
   ...props
}: BarItemPopupProps) {
   const { bar } = config;
   const bar_pos = bar.position.get();

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
      switch (bar_pos) {
         case "top":
            return Gtk.Align.START;
         case "bottom":
            return Gtk.Align.END;
      }
   }

   function transitionType() {
      return bar_pos === "top"
         ? Gtk.RevealerTransitionType.SLIDE_DOWN
         : Gtk.RevealerTransitionType.SLIDE_UP;
   }

   return (
      <Popup
         name={name}
         valign={valign()}
         halign={halign()}
         height={height}
         width={width}
         margin_top={margin}
         margin_bottom={margin}
         margin_start={margin}
         margin_end={margin}
         transitionType={transitionType()}
         transitionDuration={transitionDuration}
      >
         {children}
      </Popup>
   );
}
