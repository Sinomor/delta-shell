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
const speaker = AstalWp.get_default()?.get_default_speaker();
const screenRecord = ScreenRecord.get_default();

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
      if (comp === "niri") AstalNiri.msg.focus_workspace_up();
      if (comp === "hyprland")
         AstalHyprland.get_default().dispatch("workspace", "+1");
   },
   "workspace-down": () => {
      const comp = compositor.get();
      if (comp === "niri") AstalNiri.msg.focus_workspace_down();
      if (comp === "hyprland")
         AstalHyprland.get_default().dispatch("workspace", "-1");
   },
   "volume-up": () => speaker.set_volume(speaker.volume + 0.01),
   "volume-down": () => speaker.set_volume(speaker.volume - 0.01),
   "volume-toggle": () => speaker.set_mute(!speaker.get_mute()),
   "switch-language": async () => {
      const comp = compositor.get();
      if (comp === "niri") bash("niri msg action switch-layout next");
      if (comp === "hyprland") {
         try {
            const json = await bash(`hyprctl devices -j`);
            const devices = JSON.parse(json);

            const mainKeyboard = devices.keyboards.find(
               (kb: any) => kb.main === true,
            );

            if (mainKeyboard && mainKeyboard.name) {
               bash(`hyprctl switchxkblayout ${mainKeyboard.name} next`);
            }
         } catch (error) {
            console.error("Failed to switch keyboard layout:", error);
         }
      }
   },
   "screenrecord-toggle": () => {
      if (screenRecord.recording) screenRecord.stop();
      else screenRecord.start();
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
                  if (dy < 0) {
                     typeof onScrollUp === "function"
                        ? onScrollUp()
                        : onScrollUp !== null && FunctionsList[onScrollUp]();
                  } else if (dy > 0) {
                     typeof onScrollDown === "function"
                        ? onScrollDown()
                        : onScrollDown !== null &&
                          FunctionsList[onScrollDown]();
                  }
               });
            }
         }}
         {...rest}
      >
         <Gtk.GestureClick
            onPressed={(ctrl) => {
               const button = ctrl.get_current_button();
               if (button === Gdk.BUTTON_PRIMARY)
                  typeof onPrimaryClick === "function"
                     ? onPrimaryClick()
                     : onPrimaryClick !== null &&
                       FunctionsList[onPrimaryClick]();
               else if (button === Gdk.BUTTON_SECONDARY)
                  typeof onSecondaryClick === "function"
                     ? onSecondaryClick()
                     : onSecondaryClick !== null &&
                       FunctionsList[onSecondaryClick]();
               else if (button === Gdk.BUTTON_MIDDLE)
                  typeof onMiddleClick === "function"
                     ? onMiddleClick()
                     : onMiddleClick !== null && FunctionsList[onMiddleClick]();
            }}
            button={0}
         />
         <box
            class={"content"}
            orientation={orientation}
            spacing={theme.bar.spacing.get() / 2}
            hexpand={isVertical}
         >
            {content}
         </box>
      </box>
   );
}
