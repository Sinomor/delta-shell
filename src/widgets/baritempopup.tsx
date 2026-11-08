import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { Accessor, createComputed, createState } from "ags";
import Graphene from "gi://Graphene?version=1.0";
import Adw from "gi://Adw?version=1";
import { Popup } from "./popup";
import { config, theme } from "@/options";
import { isVertical } from "../modules/bar/bar";
import { getBarItemForWindow } from "./baritem";

type BarItemPopupProps = JSX.IntrinsicElements["window"] & {
   children?: any;
   module: string;
   width?: number;
   height?: number;
   margin?: number;
   gdkmonitor?: Gdk.Monitor;
   transitionDuration?: number;
   centerOnBarItem?: boolean;
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
   centerOnBarItem,
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

   const shouldCenterOnBarItem =
      (centerOnBarItem ?? true) && module_pos === "center";

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

   function handleShow(context: {
      window: Astal.Window;
      revealer: Gtk.Revealer;
      clamp: Adw.Clamp;
   }) {
      if (!shouldCenterOnBarItem || !name) return;

      const barItem = getBarItemForWindow(name);
      if (!barItem) return;

      const barWindow = barItem.get_root() as Astal.Window;
      if (!barWindow) return;

      try {
         const barMon = barWindow.gdkmonitor;
         if (barMon && context.window.gdkmonitor !== barMon) {
            context.window.set_gdkmonitor(barMon);
         }
      } catch (e) {
         // Ignore monitor assignment error
      }

      const [success, bounds] = barItem.compute_bounds(barWindow);
      if (!success) return;

      const screenMargin = theme.window.margin ?? 10;

      if (!isVertical) {
         const barWidth =
            barWindow.get_width() > 0 ? barWindow.get_width() : 1920;
         const itemCenterX = bounds.origin.x + bounds.size.width / 2;
         const measuredWidth =
            context.clamp.measure(Gtk.Orientation.HORIZONTAL, -1)[1];
         const popupWidth = width
            ? Math.min(width, measuredWidth || width)
            : measuredWidth || 380;

         const targetLeft = itemCenterX - popupWidth / 2;
         const clampedLeft = Math.max(
            screenMargin,
            Math.min(barWidth - screenMargin - popupWidth, targetLeft),
         );

         context.revealer.set_halign(Gtk.Align.START);
         context.clamp.set_margin_start(Math.round(clampedLeft));
         context.clamp.set_margin_end(0);
      } else {
         const barHeight =
            barWindow.get_height() > 0 ? barWindow.get_height() : 1080;
         const itemCenterY = bounds.origin.y + bounds.size.height / 2;
         const measuredHeight =
            context.clamp.measure(Gtk.Orientation.VERTICAL, -1)[1];
         const popupHeight = height
            ? Math.min(height, measuredHeight || height)
            : measuredHeight || 300;

         const targetTop = itemCenterY - popupHeight / 2;
         const clampedTop = Math.max(
            screenMargin,
            Math.min(barHeight - screenMargin - popupHeight, targetTop),
         );

         context.revealer.set_valign(Gtk.Align.START);
         context.clamp.set_margin_top(Math.round(clampedTop));
         context.clamp.set_margin_bottom(0);
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
         onShow={handleShow}
         {...props}
      >
         {children}
      </Popup>
   );
}
