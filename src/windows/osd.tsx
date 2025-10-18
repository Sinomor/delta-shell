import { config, theme } from "@/options";
import { windows_names } from "@/windows";
import { Astal, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import {
   osd_revealed,
   osd_visible,
   osd_visible_set,
   OsdModule,
} from "../modules/osd/osd";
import giCairo from "cairo";
const { position, vertical } = config.osd;
const { margin } = theme.window;

export function OsdWindow() {
   const { TOP, BOTTOM, RIGHT, LEFT } = Astal.WindowAnchor;
   let win: Astal.Window;
   const pos = position.get();

   function halign() {
      switch (pos) {
         case "top":
            return Gtk.Align.CENTER;
         case "bottom":
            return Gtk.Align.CENTER;
         case "top_left":
            return Gtk.Align.START;
         case "top_right":
            return Gtk.Align.END;
         case "bottom_left":
            return Gtk.Align.START;
         case "bottom_right":
            return Gtk.Align.END;
         case "right":
            return Gtk.Align.END;
         case "left":
            return Gtk.Align.START;
         default:
            return Gtk.Align.CENTER;
      }
   }

   function valign() {
      switch (pos) {
         case "top":
            return Gtk.Align.START;
         case "bottom":
            return Gtk.Align.END;
         case "top_left":
            return Gtk.Align.START;
         case "top_right":
            return Gtk.Align.START;
         case "bottom_left":
            return Gtk.Align.END;
         case "bottom_right":
            return Gtk.Align.END;
         case "right":
            return Gtk.Align.CENTER;
         case "left":
            return Gtk.Align.CENTER;
         default:
            return Gtk.Align.START;
      }
   }

   function transitionType() {
      if (vertical.get()) {
         if (pos.includes("right"))
            return Gtk.RevealerTransitionType.SLIDE_LEFT;
         if (pos.includes("left"))
            return Gtk.RevealerTransitionType.SLIDE_RIGHT;
      } else {
         if (pos === "right") return Gtk.RevealerTransitionType.SLIDE_LEFT;
         if (pos === "left") return Gtk.RevealerTransitionType.SLIDE_RIGHT;
      }
      return pos === "top"
         ? Gtk.RevealerTransitionType.SLIDE_DOWN
         : Gtk.RevealerTransitionType.SLIDE_UP;
   }

   return (
      <window
         name={windows_names.osd}
         application={app}
         anchor={TOP | BOTTOM | RIGHT | LEFT}
         layer={Astal.Layer.OVERLAY}
         visible={osd_visible}
         $={(self) => (win = self)}
         onNotifyVisible={({ visible }) => {
            if (visible) {
               win.get_native()
                  ?.get_surface()
                  ?.set_input_region(new giCairo.Region());
            }
         }}
      >
         <revealer
            transitionType={transitionType()}
            transitionDuration={config.transition.get() * 1000}
            halign={halign()}
            valign={valign()}
            revealChild={osd_revealed}
            onNotifyChildRevealed={({ childRevealed }) =>
               osd_visible_set(childRevealed)
            }
         >
            <box
               marginBottom={margin}
               marginTop={margin}
               marginEnd={margin}
               marginStart={margin}
            >
               <OsdModule visible={osd_visible} />
            </box>
         </revealer>
      </window>
   );
}
