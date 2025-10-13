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
const { width, position } = config.osd;
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
         default:
            return Gtk.Align.START;
      }
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
            transitionType={
               config.osd.position.get().includes("top")
                  ? Gtk.RevealerTransitionType.SLIDE_DOWN
                  : Gtk.RevealerTransitionType.SLIDE_UP
            }
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
