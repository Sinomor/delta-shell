import { createBinding } from "ags";
import { icons, VolumeIcon } from "@/src/lib/icons";
import { Gtk } from "ags/gtk4";
import AstalWp from "gi://AstalWp?version=0.1";
import Brightness from "@/src/services/brightness";
import { config, theme } from "@/options";
import { qs_page_set } from "../quicksettings";
import { QSSlider } from "@/src/widgets/qsslider";
const brightness = Brightness.get_default();
const wp = AstalWp.get_default();

const Sliders = {
   brightness: () => (brightness.available ? <BrightnessBox /> : null),
   volume: () => <VolumeBox />,
   microphone: () => <MicrophoneBox />,
} as Record<string, any>;

function BrightnessBox() {
   const level = createBinding(brightness, "screen");

   return (
      <QSSlider
         level={level}
         min={0.05}
         icon={icons.brightness}
         onChangeValue={(value) => (brightness.screen = value)}
      />
   );
}

function VolumeBox() {
   const speaker = wp.get_default_speaker();
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
            <image
               iconName={icons.arrow.right}
               pixelSize={theme["icon-size"].normal}
            />
         </button>
      </box>
   );
}

function MicrophoneBox() {
   const microphone = wp.get_default_microphone();
   const level = createBinding(microphone, "volume");

   return (
      <box spacing={theme.spacing}>
         <QSSlider
            level={level}
            icon={icons.microphone.default}
            onChangeValue={(value) => microphone.set_volume(value)}
         />
         <button
            onClicked={() => qs_page_set("volume")}
            class={"slider-button"}
            focusOnClick={false}
         >
            <image
               iconName={icons.arrow.right}
               pixelSize={theme["icon-size"].normal}
            />
         </button>
      </box>
   );
}

export function QSSliders() {
   const getVisibleButtons = () => {
      const sliders = config.quicksettings.sliders;
      const visible = [];

      for (const slider of sliders) {
         const Widget = Sliders[slider];
         if (!Widget) {
            console.error(`Failed create qsslider: unknown name "${slider}"`);
            continue;
         }
         const result = Widget();
         if (result !== null && result !== undefined) {
            visible.push(result);
         }
      }

      return visible;
   };

   const sliders = getVisibleButtons();

   return (
      <box
         spacing={theme.spacing}
         orientation={Gtk.Orientation.VERTICAL}
         class={"sliders"}
      >
         {sliders}
      </box>
   );
}
