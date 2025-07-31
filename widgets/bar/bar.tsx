import app from "ags/gtk4/app";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import { Workspaces } from "./items/workspaces";
import { Clock } from "./items/clock";
import { Launcher } from "./items/launcher";
import { SysBox } from "./items/sysbox";
import { Tray } from "./items/tray";
import { RecordIndicator } from "./items/recordindicator";
import { Keyboard } from "./items/keyboard";
import options from "@/options";
import { For, createState, onCleanup } from "ags";

const { name, position, spacing, modules } = options.bar;

const Bar_Items = {
   launcher: () => <Launcher />,
   workspaces: () => <Workspaces />,
   clock: () => <Clock />,
   tray: () => <Tray />,
   keyboard: () => <Keyboard />,
   sysbox: () => <SysBox />,
   record_indicator: () => <RecordIndicator />,
} as Record<string, any>;

function Start() {
   return (
      <box
         $type={"start"}
         class={"modules-start"}
         spacing={spacing}
         $={(self) => self.get_first_child()?.add_css_class("first-child")}
      >
         <For each={modules.start}>
            {(module: string) => {
               const Widget = Bar_Items[module];
               return Widget ? <Widget /> : <box />;
            }}
         </For>
      </box>
   );
}

function Center() {
   return (
      <box $type={"center"} class={"modules-center"} spacing={spacing}>
         <For each={modules.center}>
            {(module: string) => {
               const Widget = Bar_Items[module];
               return Widget ? <Widget /> : <box />;
            }}
         </For>
      </box>
   );
}

function End() {
   return (
      <box
         $type={"end"}
         class={"modules-end"}
         spacing={spacing}
         $={(self) => self.get_last_child()?.add_css_class("last-child")}
      >
         <For each={modules.end}>
            {(module: string) => {
               const Widget = Bar_Items[module];
               return Widget ? <Widget /> : <box />;
            }}
         </For>
      </box>
   );
}

export default function Bar(gdkmonitor: Gdk.Monitor) {
   const { BOTTOM, TOP, LEFT, RIGHT } = Astal.WindowAnchor;
   const windows = [
      options.powermenu.name,
      options.verification.name,
      options.calendar.name,
      options.control.name,
      options.launcher.name,
   ];
   const [windowsVisible, windowsVisible_set] = createState<string[]>([]);
   let bar: Astal.Window;

   // Обработчик изменения видимости окон
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
         name={name}
         namespace={name}
         class={name}
         gdkmonitor={gdkmonitor}
         exclusivity={Astal.Exclusivity.EXCLUSIVE}
         layer={Astal.Layer.TOP}
         anchor={(position.get() === "top" ? TOP : BOTTOM) | LEFT | RIGHT}
         application={app}
         $={(self) => (bar = self)}
      >
         <centerbox class={"bar-main"} heightRequest={options.bar.height}>
            <Start />
            <Center />
            <End />
         </centerbox>
      </window>
   );
}
