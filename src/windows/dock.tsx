import { windows_names } from "@/windows";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { createEffect, createState } from "gnim";
import { DockModule } from "../modules/dock/dock";
import giCairo from "cairo";
import { timeout } from "ags/time";
import Graphene from "gi://Graphene?version=1.0";
const { BOTTOM, TOP, LEFT, RIGHT } = Astal.WindowAnchor;
export const [revealed, setRevealed] = createState(false);
export const [popup, setPopup] = createState(false);
export const [ignore, setIgnore] = createState(false);

export function DockWindow({
   gdkmonitor,
   $,
}: JSX.IntrinsicElements["window"] & { gdkmonitor: Gdk.Monitor }) {
   const align = {
      top: Gtk.Align.START,
      bottom: Gtk.Align.END,
      left: Gtk.Align.START,
      right: Gtk.Align.END,
   }["bottom"];
   const isVertical = false;
   let box: Gtk.Box;
   let win: Astal.Window;

   let lastX = 0;
   let lastY = 0;

   const isCursorInsideBox = () => {
      if (!box || !win) return false;

      const [, bounds] = box.compute_bounds(win);
      if (!bounds) return false;

      const point = new Graphene.Point({ x: lastX, y: lastY });

      return bounds.contains_point(point);
   };

   createEffect(() => {
      if (!popup() && !isCursorInsideBox()) setRevealed(false);
   });

   createEffect(() => {
      popup();
      revealed();
      if (ignore()) setRevealed(true);
   });

   return (
      <window
         visible
         name={windows_names.dock}
         namespace={windows_names.dock}
         class={windows_names.dock}
         gdkmonitor={gdkmonitor}
         anchor={BOTTOM | LEFT | RIGHT}
         application={app}
         $={(self) => {
            if ($) $(self);
            win = self;
         }}
      >
         <box
            valign={!isVertical ? align : Gtk.Align.FILL}
            orientation={Gtk.Orientation.VERTICAL}
            halign={Gtk.Align.CENTER}
            $={(self) => (box = self)}
         >
            <Gtk.EventControllerMotion
               onEnter={() => setRevealed(true)}
               onLeave={() => !popup.peek() && setRevealed(false)}
               onMotion={(_, x, y) => {
                  lastX = x;
                  lastY = y;
                  console.log(x, y);
               }}
            />
            <revealer
               revealChild={revealed}
               onNotifyChildRevealed={({ childRevealed }) => {}}
               transitionType={Gtk.RevealerTransitionType.SLIDE_UP}
               transitionDuration={300}
            >
               <box class={"main"}>
                  <DockModule gdkmonitor={gdkmonitor} />
               </box>
            </revealer>
            <box
               cssClasses={["autohide-trigger"]}
               css={"background: black"}
               heightRequest={1}
            />
         </box>
      </window>
   );
}
