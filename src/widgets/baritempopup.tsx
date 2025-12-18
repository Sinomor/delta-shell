import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { Accessor, createComputed, createState } from "ags";
import { hide_all_windows } from "@/windows";
import Graphene from "gi://Graphene?version=1.0";
import Adw from "gi://Adw?version=1";
import { Popup } from "./popup";
import { config, theme } from "@/options";
import { isVertical } from "../modules/bar/bar";

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
   transitionDuration = config.transition,
   ...props
}: BarItemPopupProps) {
   const { bar } = config;
   const bar_pos = bar.position;
   const bar_margin = theme.bar.margin;

   const module_pos = bar.modules.start.includes(module)
      ? "start"
      : bar.modules.center.includes(module)
        ? "center"
        : "end";

   function halign() {
      if (isVertical) {
         switch (bar_pos) {
            case "right":
               return Gtk.Align.END;
            case "left":
               return Gtk.Align.START;
         }
      } else {
         switch (module_pos) {
            case "start":
               return Gtk.Align.START;
            case "center":
               return Gtk.Align.CENTER;
            case "end":
               return Gtk.Align.END;
         }
      }
   }
   function valign() {
      if (isVertical) {
         switch (module_pos) {
            case "start":
               return Gtk.Align.START;
            case "center":
               return Gtk.Align.CENTER;
            case "end":
               return Gtk.Align.END;
         }
      } else {
         switch (bar_pos) {
            case "top":
               return Gtk.Align.START;
            case "bottom":
               return Gtk.Align.END;
         }
      }
   }

   function transitionType() {
      switch (bar_pos) {
         case "top":
            return Gtk.RevealerTransitionType.SLIDE_DOWN;
         case "bottom":
            return Gtk.RevealerTransitionType.SLIDE_UP;
         case "right":
            return Gtk.RevealerTransitionType.SLIDE_LEFT;
         case "left":
            return Gtk.RevealerTransitionType.SLIDE_RIGHT;
      }
   }

   return (
      <Popup
         name={name}
         valign={valign()}
         halign={halign()}
         height={height}
         width={width}
         margin_top={
            isVertical ? (bar_margin[0] === 0 ? margin : bar_margin[0]) : margin
         }
         margin_bottom={
            isVertical ? (bar_margin[2] === 0 ? margin : bar_margin[2]) : margin
         }
         margin_start={
            !isVertical
               ? bar_margin[3] === 0
                  ? margin
                  : bar_margin[3]
               : margin
         }
         margin_end={
            !isVertical
               ? bar_margin[1] === 0
                  ? margin
                  : bar_margin[1]
               : margin
         }
         transitionType={transitionType()}
         transitionDuration={transitionDuration}
      >
         {children}
      </Popup>
   );
}
