import { Gdk, Gtk } from "ags/gtk4";
import { onCleanup } from "ags";
import app from "ags/gtk4/app";
import { attachHoverScroll, toggleWindow } from "../lib/utils";
import { theme } from "@/options";
import { isVertical } from "../modules/bar/bar";
import { windows_names } from "@/windows";

type FormatData = Record<string, JSX.Element>;

type BarItemProps = JSX.IntrinsicElements["box"] & {
   window?: string;
   children?: any;
   format?: string;
   data?: FormatData;
   onPrimaryClick?: () => void;
   onSecondaryClick?: () => void;
   onMiddleClick?: () => void;
   onScrollDown?: () => void;
   onScrollUp?: () => void;
};

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
   onPrimaryClick = () => {},
   onSecondaryClick = () => {},
   onMiddleClick = () => {},
   onScrollUp = () => {},
   onScrollDown = () => {},
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
                     onScrollUp();
                  } else if (dy > 0) {
                     onScrollDown();
                  }
               });
            }
         }}
         {...rest}
      >
         <Gtk.GestureClick
            onPressed={(ctrl) => {
               const button = ctrl.get_current_button();
               if (button === Gdk.BUTTON_PRIMARY) onPrimaryClick();
               else if (button === Gdk.BUTTON_SECONDARY) onSecondaryClick();
               else if (button === Gdk.BUTTON_MIDDLE) onMiddleClick();
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
