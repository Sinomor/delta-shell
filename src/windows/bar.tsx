import { windows_names } from "@/windows";
import { Astal, Gdk } from "ags/gtk4";
import { BarModule, isVertical } from "../modules/bar/bar";
import { config, theme } from "@/options";
import { createState, onCleanup } from "gnim";
import app from "ags/gtk4/app";
import giCairo from "cairo";
const { position, modules } = config.bar;
const { spacing } = theme.bar;
const { BOTTOM, TOP, LEFT, RIGHT } = Astal.WindowAnchor;
const [windowsVisible, windowsVisible_set] = createState<string[]>([]);

export function BarWindow({
   gdkmonitor,
   $,
}: JSX.IntrinsicElements["window"] & { gdkmonitor: Gdk.Monitor }) {
   const windows = [
      windows_names.powermenu,
      windows_names.verification,
      windows_names.calendar,
      windows_names.quicksettings,
      windows_names.applauncher,
      windows_names.weather,
      windows_names.notifications_list,
      windows_names.volume,
      windows_names.network,
      windows_names.bluetooth,
      windows_names.power,
      windows_names.clipboard,
   ];
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

   function anchor() {
      switch (position.get()) {
         case "top":
            return TOP | LEFT | RIGHT;
         case "bottom":
            return BOTTOM | LEFT | RIGHT;
         case "right":
            return RIGHT | BOTTOM | TOP;
         case "left":
            return LEFT | BOTTOM | TOP;
      }
   }

   return (
      <window
         visible
         name={windows_names.bar}
         namespace={windows_names.bar}
         class={windows_names.bar}
         gdkmonitor={gdkmonitor}
         exclusivity={Astal.Exclusivity.EXCLUSIVE}
         layer={Astal.Layer.TOP}
         anchor={anchor()}
         application={app}
         $={(self) => {
            bar = self;
            if ($) $(self);
         }}
      >
         <BarModule gdkmonitor={gdkmonitor} />
      </window>
   );
}

export function BarShadowWindow({
   gdkmonitor,
   $,
}: JSX.IntrinsicElements["window"] & { gdkmonitor: Gdk.Monitor }) {
   const windows = [
      windows_names.powermenu,
      windows_names.verification,
      windows_names.calendar,
      windows_names.quicksettings,
      windows_names.launcher,
      windows_names.weather,
      windows_names.notifications_list,
      windows_names.volume,
      windows_names.network,
      windows_names.bluetooth,
      windows_names.power,
      windows_names.clipboard,
   ];
   let shadow: Astal.Window;

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

      shadow.set_layer(
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
            shadow = self;
            if ($) $(self);
            self
               .get_native()
               ?.get_surface()
               ?.set_input_region(new giCairo.Region());
         }}
      >
         <box class={"shadow"}>
            <box class={"border"} vexpand hexpand>
               <box class={"corner"} vexpand hexpand />
            </box>
         </box>
      </window>
   );
}
