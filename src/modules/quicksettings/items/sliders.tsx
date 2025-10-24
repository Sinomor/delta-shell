import { createBinding } from "ags";
import { icons, VolumeIcon } from "@/src/lib/icons";
import { Gtk } from "ags/gtk4";
import AstalWp from "gi://AstalWp?version=0.1";
import Brightness from "@/src/services/brightness";
import { theme } from "@/options";
import { qs_page_set } from "../quicksettings";
import { QSSlider } from "@/src/widgets/qsslider";

function BrightnessBox() {
   const brightness = Brightness.get_default();
   const level = createBinding(brightness, "screen");

   return (
      <QSSlider
         level={level}
         icon={icons.brightness}
         onChangeValue={(value) => (brightness.screen = value)}
      />
   );
}

function VolumeBox() {
   const speaker = AstalWp.get_default()?.audio!.defaultSpeaker!;
   const level = createBinding(speaker, "volume");

   return (
      <box spacing={theme.spacing}>
         <QSSlider
            level={level}
            icon={VolumeIcon}
            onChangeValue={(value) => speaker.set_volume(value)}
         />
         <button
            onClicked={() => qs_page_set("volume")}
            class={"slider-button"}
            focusOnClick={false}
         >
            <image iconName={icons.arrow.right} pixelSize={20} />
         </button>
      </box>
   );
}

export function Sliders() {
   return (
      <box
         spacing={theme.spacing}
         orientation={Gtk.Orientation.VERTICAL}
         class={"sliders"}
      >
         <VolumeBox />
         {brightness.available && <BrightnessBox />}
      </box>
   );
}
