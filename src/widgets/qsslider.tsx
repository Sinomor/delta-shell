import { theme } from "@/options";
import { Accessor } from "ags";
import { Gtk } from "ags/gtk4";

type SliderProps = {
   level: Accessor<number>;
   icon: string | Accessor<string>;
   max?: number;
   min?: number;
   onChangeValue: (value: number) => void;
};

export function QSSlider({
   level,
   icon,
   min,
   max,
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
            max={max}
            min={min}
            hexpand
            value={level}
         />
      </overlay>
   );
}
