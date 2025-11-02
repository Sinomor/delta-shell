import { Gdk, Gtk } from "ags/gtk4";
import { onCleanup } from "ags";
import app from "ags/gtk4/app";
import {
   attachHoverScroll,
   bash,
   toggleQsModule,
   toggleWindow,
} from "../lib/utils";
import { compositor, theme } from "@/options";
import { isVertical } from "../modules/bar/bar";
import { windows_names } from "@/windows";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import AstalNiri from "gi://AstalNiri?version=0.1";
import AstalWp from "gi://AstalWp?version=0.1";
import ScreenRecord from "@/src/services/screenrecord";

type FormatData = Record<string, JSX.Element>;

type BarItemProps = JSX.IntrinsicElements["box"] & {
   window?: string;
   children?: any;
   format?: string;
   data?: FormatData;
   onPrimaryClick?: string | null | Function;
   onSecondaryClick?: string | null | Function;
   onMiddleClick?: string | null | Function;
   onScrollDown?: string | null | Function;
   onScrollUp?: string | null | Function;
};

let speaker: AstalWp.Endpoint | undefined;
let screenRecord: ScreenRecord | undefined;
let hyprland: AstalHyprland.Hyprland | undefined;

function getSpeaker() {
   if (!speaker) speaker = AstalWp.get_default()?.get_default_speaker();
   return speaker;
}

function getScreenRecord() {
   if (!screenRecord) screenRecord = ScreenRecord.get_default();
   return screenRecord;
}

function getHyprland() {
   if (!hyprland) hyprland = AstalHyprland.get_default();
   return hyprland;
}

export const FunctionsList = {
   "toggle-launcher": () => toggleWindow(windows_names.applauncher),
   "toggle-qs": () => toggleWindow(windows_names.quicksettings),
   "toggle-calendar": () => toggleWindow(windows_names.calendar),
   "toggle-powermenu": () => toggleWindow(windows_names.powermenu),
   "toggle-clipboard": () => toggleWindow(windows_names.clipboard),
   "toggle-weather": () => toggleQsModule(windows_names.weather),
   "toggle-notifs": () => toggleQsModule(windows_names.notificationslist),
   "toggle-volume": () => toggleQsModule(windows_names.volume),
   "toggle-network": () => toggleQsModule(windows_names.network),
   "toggle-bluetooth": () => toggleQsModule(windows_names.bluetooth),
   "toggle-power": () => toggleQsModule(windows_names.power, "battery"),
   "workspace-up": () => {
      const comp = compositor.get();
      if (comp === "niri") {
         AstalNiri.msg.focus_workspace_up();
      } else if (comp === "hyprland") {
         getHyprland()?.dispatch("workspace", "+1");
      }
   },
   "workspace-down": () => {
      const comp = compositor.get();
      if (comp === "niri") {
         AstalNiri.msg.focus_workspace_down();
      } else if (comp === "hyprland") {
         getHyprland()?.dispatch("workspace", "-1");
      }
   },
   "volume-up": () => {
      const spk = getSpeaker();
      if (spk) spk.set_volume(spk.volume + 0.01);
   },
   "volume-down": () => {
      const spk = getSpeaker();
      if (spk) spk.set_volume(spk.volume - 0.01);
   },
   "volume-toggle": () => {
      const spk = getSpeaker();
      if (spk) spk.set_mute(!spk.get_mute());
   },
   "switch-language": async () => {
      const comp = compositor.get();
      if (comp === "niri") {
         bash("niri msg action switch-layout next");
      } else if (comp === "hyprland") {
         try {
            const json = await bash(`hyprctl devices -j`);
            const devices = JSON.parse(json);

            const mainKeyboard = devices.keyboards.find(
               (kb: any) => kb.main === true,
            );

            if (mainKeyboard?.name) {
               bash(`hyprctl switchxkblayout ${mainKeyboard.name} next`);
            }
         } catch (error) {
            console.error("Failed to switch keyboard layout:", error);
         }
      }
   },
   "screenrecord-toggle": () => {
      const sr = getScreenRecord();
      if (sr) {
         if (sr.recording) sr.stop();
         else sr.start();
      }
   },
} as Record<string, any>;

function parseFormat(format: string, data: FormatData): JSX.Element[] {
   const result: JSX.Element[] = [];
   const groups = format.split(" ").filter((group) => group.trim() !== "");

   for (const group of groups) {
      const elements: JSX.Element[] = [];
      let currentText = "";

      for (let i = 0; i < group.length; i++) {
         if (group[i] === "{" && group.indexOf("}", i) > i) {
            if (currentText) {
               elements.push(
                  <label label={currentText} hexpand={isVertical} />,
               );
               currentText = "";
            }

            const end = group.indexOf("}", i);
            const key = group.substring(i + 1, end);

            if (data[key]) {
               elements.push(data[key]);
            } else {
               elements.push(<label label={`{${key}}`} hexpand={isVertical} />);
            }

            i = end;
         } else {
            currentText += group[i];
         }
      }

      if (currentText) {
         elements.push(<label label={currentText} hexpand={isVertical} />);
      }

      if (elements.length > 0) {
         result.push(<box>{elements}</box>);
      }
   }

   return result;
}

function handleClick(
   button: number,
   onPrimary?: string | null | Function,
   onSecondary?: string | null | Function,
   onMiddle?: string | null | Function,
) {
   let handler: string | Function | null | undefined;

   if (button === Gdk.BUTTON_PRIMARY) {
      handler = onPrimary;
   } else if (button === Gdk.BUTTON_SECONDARY) {
      handler = onSecondary;
   } else if (button === Gdk.BUTTON_MIDDLE) {
      handler = onMiddle;
   }

   if (!handler || handler === "default") return;

   if (typeof handler === "function") {
      handler();
   } else {
      const func = FunctionsList[handler as keyof typeof FunctionsList];
      if (func) func();
   }
}

function handleScroll(
   dy: number,
   onUp?: string | null | Function,
   onDown?: string | null | Function,
) {
   const handler = dy < 0 ? onUp : dy > 0 ? onDown : null;

   if (!handler || handler === "default") return;

   if (typeof handler === "function") {
      handler();
   } else {
      const func = FunctionsList[handler as keyof typeof FunctionsList];
      if (func) func();
   }
}

export default function BarItem({
   window = "",
   children,
   format,
   data = {},
   onPrimaryClick = "default",
   onSecondaryClick = "default",
   onMiddleClick = "default",
   onScrollUp = "default",
   onScrollDown = "default",
   ...rest
}: BarItemProps) {
   const content = format ? parseFormat(format, data) : children;

   const orientation = isVertical
      ? Gtk.Orientation.VERTICAL
      : Gtk.Orientation.HORIZONTAL;

   const spacing = theme.bar.spacing.get() / 2;

   return (
      <box
         class={"bar-item"}
         $={(self) => {
            if (window) {
               const appconnect = app.connect("window-toggled", (_, win) => {
                  if (win.name === window) {
                     self[win.visible ? "add_css_class" : "remove_css_class"](
                        "active",
                     );
                  }
               });
               onCleanup(() => app.disconnect(appconnect));

               attachHoverScroll(self, ({ dy }) => {
                  handleScroll(dy, onScrollUp, onScrollDown);
               });
            }
         }}
         {...rest}
      >
         <Gtk.GestureClick
            onPressed={(ctrl) => {
               handleClick(
                  ctrl.get_current_button(),
                  onPrimaryClick,
                  onSecondaryClick,
                  onMiddleClick,
               );
            }}
            button={0}
         />
         <box
            class={"content"}
            orientation={orientation}
            spacing={spacing}
            hexpand={isVertical}
         >
            {content}
         </box>
      </box>
   );
}
