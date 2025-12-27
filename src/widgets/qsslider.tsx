import { theme } from "@/options";
import { Accessor } from "ags";
import { Gtk } from "ags/gtk4";

type SliderProps = {
   level: Accessor<number>;
   icon: string | Accessor<string>;
   onChangeValue: (value: number) => void;
};

export function QSSlider({
   level,
   icon,
   onChangeValue,
   ...props
}: SliderProps) {
   return (
      <overlay
         class={level.as((v) => `slider-box ${v < 0.16 ? "low" : ""}`)}
         valign={Gtk.Align.CENTER}
      >
         <image
            $type={"overlay"}
            iconName={icon}
            pixelSize={theme["icon-size"].normal}
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.START}
         />
         <slider
            onChangeValue={({ value }) => {
               onChangeValue(value);
            }}
            hexpand
            min={0.1}
            value={level}
         />
      </overlay>
   );
}
