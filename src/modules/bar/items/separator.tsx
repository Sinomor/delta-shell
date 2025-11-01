import { Gtk } from "ags/gtk4";
import { isVertical } from "../bar";

export function Separator() {
   return (
      <Gtk.Separator
         orientation={
            isVertical ? Gtk.Orientation.VERTICAL : Gtk.Orientation.HORIZONTAL
         }
      />
   );
}
