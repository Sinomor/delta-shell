import { Astal, Gdk } from "ags/gtk4";
import giCairo from "cairo";
import { createState, onCleanup } from "ags";
import { config } from "@/options";
import { windows_names } from "@/windows";
import app from "ags/gtk4/app";

export default function BarShadow({
   gdkmonitor,
   $,
}: JSX.IntrinsicElements["window"] & { gdkmonitor: Gdk.Monitor }) {
   const { BOTTOM, TOP, LEFT, RIGHT } = Astal.WindowAnchor;
   const windows = [
      windows_names.powermenu,
      windows_names.verification,
      windows_names.calendar,
      windows_names.control,
      windows_names.launcher,
      windows_names.weather,
      windows_names.notifications_list,
   ];
   const [windowsVisible, windowsVisible_set] = createState<string[]>([]);
   let bar: Astal.Window;

   const appconnect = app.connect("window-toggled", (_, win) => {
      const winName = win.name;
      if (!windows.includes(winName)) return;
      const newVisible = windowsVisible.get();

      if (win.visible) {
         if (!newVisible.includes(winName)) {
            newVisible.push(winName);
         }
      } else {
         const index = newVisible.indexOf(winName);
         if (index > -1) {
            newVisible.splice(index, 1);
         }
      }

      windowsVisible_set(newVisible);

      bar.set_layer(
         newVisible.length > 0 ? Astal.Layer.OVERLAY : Astal.Layer.TOP,
      );
   });

   onCleanup(() => app.disconnect(appconnect));

   return (
      <window
         visible
         name={windows_names.bar_shadow}
         namespace={windows_names.bar_shadow}
         class={"shadows"}
         gdkmonitor={gdkmonitor}
         layer={Astal.Layer.TOP}
         anchor={TOP | BOTTOM | RIGHT | LEFT}
         application={app}
         $={(self) => {
            bar = self;
            if ($) $(self);
            self
               .get_native()
               ?.get_surface()
               ?.set_input_region(new giCairo.Region());
         }}
      >
         <box class="shadow">
            <box class="border" vexpand hexpand>
               <box class="corner" vexpand hexpand />
            </box>
         </box>
      </window>
   );
}
