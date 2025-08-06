import { Gdk, Gtk } from "ags/gtk4";
import { CCProps, onCleanup, FCProps } from "ags";
import app from "ags/gtk4/app";

type BarItemProps = JSX.IntrinsicElements["box"] & {
   window?: string;
   children: any;
   onPrimaryClick?: () => void;
   onSecondaryClick?: () => void;
   onMiddleClick?: () => void;
};

export default function BarItem({
   window = "",
   children,
   onPrimaryClick = () => {},
   onSecondaryClick = () => {},
   onMiddleClick = () => {},
   ...rest
}: BarItemProps) {
   return (
      <box
         class={"bar-item"}
         $={(self) => {
            if (window) {
               const appconnect = app.connect("window-toggled", (_, win) => {
                  const winName = win.name;
                  if (winName !== window) return;
                  const visible = win.visible;
                  self[visible ? "add_css_class" : "remove_css_class"](
                     "active",
                  );
               });
               onCleanup(() => app.disconnect(appconnect));
            }
         }}
         {...rest}
      >
         <Gtk.GestureClick
            onPressed={(ctrl, _, x, y) => {
               const button = ctrl.get_current_button();
               if (button === Gdk.BUTTON_PRIMARY) {
                  onPrimaryClick();
               } else if (button === Gdk.BUTTON_SECONDARY) {
                  onSecondaryClick();
               } else if (button === Gdk.BUTTON_MIDDLE) {
                  onMiddleClick();
               }
            }}
            button={0}
         />
         <box class={"content"}>{children}</box>
      </box>
   );
}
