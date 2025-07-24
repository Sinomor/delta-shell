import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { Accessor, createState } from "ags";
import { hide_all_windows } from "@/windows";
import Graphene from "gi://Graphene?version=1.0";
import Adw from "gi://Adw?version=1";

type PopupWindowProps = JSX.IntrinsicElements["window"] & {
   children?: any;
   width?: number;
   margin?: number;
};

export function PopupWindow({
   children,
   name,
   width,
   margin,
   visible = false,
   halign,
   valign,
   ...props
}: PopupWindowProps) {
   const { TOP, BOTTOM, RIGHT, LEFT } = Astal.WindowAnchor;
   let contentbox: Adw.Clamp;

   return (
      <window
         {...props}
         visible={visible}
         name={name}
         namespace={name}
         keymode={Astal.Keymode.ON_DEMAND}
         layer={Astal.Layer.TOP}
         anchor={TOP | BOTTOM | RIGHT | LEFT}
         application={app}
         onNotifyVisible={({ visible }) => {
            if (visible) contentbox.grab_focus();
         }}
      >
         <Gtk.EventControllerKey
            onKeyPressed={({ widget }, keyval: number) => {
               if (keyval === Gdk.KEY_Escape) {
                  widget.hide();
               }
            }}
         />
         <Gtk.GestureClick
            onPressed={({ widget }, _, x, y) => {
               const [, rect] = children.compute_bounds(widget);
               const position = new Graphene.Point({ x, y });

               if (!rect.contains_point(position)) {
                  hide_all_windows();
               }
            }}
         />
         <Adw.Clamp
            $={(self) => (contentbox = self)}
            focusable
            halign={halign}
            valign={valign}
            maximum_size={width}
            margin_end={margin}
            margin_start={margin}
            marginBottom={margin}
            marginTop={margin}
         >
            {children}
         </Adw.Clamp>
      </window>
   );
}
