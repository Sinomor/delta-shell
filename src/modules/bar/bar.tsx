import app from "ags/gtk4/app";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import { Workspaces } from "./items/workspaces";
import { Clock } from "./items/clock";
import { Launcher } from "./items/launcher";
import { Tray } from "./items/tray";
import { RecordIndicator } from "./items/recordindicator";
import { Keyboard } from "./items/keyboard";
import { For, createState, onCleanup } from "ags";
import { Weather } from "./items/weather";
import { config, theme } from "@/options";
import { windows_names } from "@/windows";
import { Notifications } from "./items/notifications";
import { Volume } from "./items/volume";
import { Network } from "./items/network";
import { Bluetooth } from "./items/bluetooth";
import { Battery } from "./items/battery";
import { QuickSettings } from "./items/quicksettings";
import { Clipboard } from "./items/clipboard";

const { position, modules } = config.bar;
const { spacing } = theme.bar;
export const isVertical =
   position.get() === "right" || position.get() === "left";

export function BarModule({
   gdkmonitor,
   $,
}: JSX.IntrinsicElements["window"] & { gdkmonitor: Gdk.Monitor }) {
   const Bar_Items = {
      launcher: () => <Launcher />,
      workspaces: () => <Workspaces gdkmonitor={gdkmonitor} />,
      clock: () => <Clock />,
      tray: () => <Tray />,
      keyboard: () => <Keyboard />,
      recordindicator: () => <RecordIndicator />,
      weather: () => <Weather />,
      notifications: () => <Notifications />,
      volume: () => <Volume />,
      network: () => <Network />,
      bluetooth: () => <Bluetooth />,
      battery: () => <Battery />,
      quicksettings: () => <QuickSettings />,
      clipboard: () => <Clipboard />,
   } as Record<string, any>;

   const getModules = (string: string) => {
      const baritems = modules[string].get();
      const items = [];

      for (const baritem of baritems) {
         const Widget = Bar_Items[baritem];
         if (Widget) items.push(Widget());
         else console.error(`Failed create baritem: unknown name ${baritem}`);
      }

      return items;
   };

   function Start() {
      return (
         <box
            $type={"start"}
            class={"modules-start"}
            spacing={spacing}
            orientation={
               isVertical
                  ? Gtk.Orientation.VERTICAL
                  : Gtk.Orientation.HORIZONTAL
            }
            $={(self) => self.get_first_child()?.add_css_class("first-child")}
         >
            {getModules("start")}
         </box>
      );
   }

   function Center() {
      return (
         <box
            $type={"center"}
            class={"modules-center"}
            spacing={spacing}
            orientation={
               isVertical
                  ? Gtk.Orientation.VERTICAL
                  : Gtk.Orientation.HORIZONTAL
            }
         >
            {getModules("center")}
         </box>
      );
   }

   function End() {
      return (
         <box
            $type={"end"}
            class={"modules-end"}
            spacing={spacing}
            orientation={
               isVertical
                  ? Gtk.Orientation.VERTICAL
                  : Gtk.Orientation.HORIZONTAL
            }
            $={(self) => self.get_last_child()?.add_css_class("last-child")}
         >
            {getModules("end")}
         </box>
      );
   }

   return (
      <centerbox
         class={"main"}
         orientation={
            isVertical ? Gtk.Orientation.VERTICAL : Gtk.Orientation.HORIZONTAL
         }
         $={(self) => {
            const size = config.bar.size.get();
            isVertical
               ? (self.widthRequest = size)
               : (self.heightRequest = size);
         }}
      >
         <Start />
         <Center />
         <End />
      </centerbox>
   );
}
