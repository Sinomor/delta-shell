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
import { Volume } from "./items/volume";
import { Network } from "./items/network";
import { Bluetooth } from "./items/bluetooth";
import { Battery } from "./items/battery";
import { QuickSettings } from "./items/quicksettings";
import { Clipboard } from "./items/clipboard";
import { PowerMenu } from "./items/powermenu";
import { NotificationsList } from "./items/notificationslist";
import { Separator } from "./items/separator";
import { CPU } from "./items/cpu";
import { RAM } from "./items/ram";

const { position, modules, size } = config.bar;
const { spacing } = theme.bar;
export const isVertical = position === "right" || position === "left";
export const orientation = isVertical
   ? Gtk.Orientation.VERTICAL
   : Gtk.Orientation.HORIZONTAL;

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
      notificationslist: () => <NotificationsList />,
      volume: () => <Volume />,
      network: () => <Network />,
      bluetooth: () => <Bluetooth />,
      battery: () => <Battery />,
      quicksettings: () => <QuickSettings />,
      clipboard: () => <Clipboard />,
      powermenu: () => <PowerMenu />,
      separator: () => <Separator />,
      cpu: () => <CPU />,
      ram: () => <RAM />,
   } as Record<string, any>;

   const getModules = (location: "start" | "center" | "end") => {
      const baritems = modules[location];
      const items = [];

      for (const baritem of baritems) {
         const Widget = Bar_Items[baritem];
         if (!Widget) {
            console.error(`Failed create qsbutton: unknown name "${baritem}"`);
            continue;
         }
         const result = Widget();
         if (result !== null && result !== undefined) {
            items.push(result);
         }
      }

      return items;
   };

   function Start() {
      return (
         <box
            $type={"start"}
            class={"modules-start"}
            spacing={spacing}
            orientation={orientation}
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
            orientation={orientation}
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
            orientation={orientation}
            $={(self) => self.get_last_child()?.add_css_class("last-child")}
         >
            {getModules("end")}
         </box>
      );
   }

   return (
      <centerbox
         class={"main"}
         orientation={orientation}
         $={(self) => {
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
