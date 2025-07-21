import { createBinding } from "ags";
import { icons, VolumeIcon } from "@/utils/icons";
import { Gtk } from "ags/gtk4";
import AstalWp from "gi://AstalWp?version=0.1";
import Brightness from "@/services/brightness";
import options from "@/options";
import { dependencies } from "@/utils/utils";
const brightness = Brightness.get_default();

function BrightnessBox() {
   const level = createBinding(brightness, "screen");

   return (
      <overlay
         class={level.as(
            (v) =>
               `slider-box brightness-box ${v < 0.16 ? "low-brightness" : ""}`,
         )}
         valign={Gtk.Align.CENTER}
      >
         <image
            $type={"overlay"}
            iconName={icons.brightness}
            pixelSize={20}
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.START}
         />
         <slider
            onChangeValue={({ value }) => {
               brightness.screen = value;
            }}
            hexpand
            min={0.1}
            value={level}
         />
      </overlay>
   );
}

function VolumeBox() {
   const speaker = AstalWp.get_default()?.audio!.defaultSpeaker!;
   const level = createBinding(speaker, "volume");

   return (
      <overlay
         class={level.as(
            (v) => `slider-box volume-box ${v < 0.05 ? "low-volume" : ""}`,
         )}
         valign={Gtk.Align.CENTER}
      >
         <image
            $type={"overlay"}
            iconName={VolumeIcon}
            pixelSize={20}
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.START}
         />
         <slider
            onChangeValue={({ value }) => speaker.set_volume(value)}
            hexpand
            value={level}
         />
      </overlay>
   );
}

function MicrophoneBox() {
   const mic = AstalWp.get_default()?.audio!.defaultMicrophone!;
   const level = createBinding(mic, "volume");
   const mute = createBinding(mic, "mute");

   return (
      <overlay
         class={level.as(
            (v) => `slider-box microphone-box ${v < 0.05 ? "low-mic" : ""}`,
         )}
         valign={Gtk.Align.CENTER}
      >
         <image
            $type={"overlay"}
            iconName={mute.as((m) => m ? icons.microphone_muted : icons.microphone)}
            pixelSize={20}
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.START}
         />
         <slider
            onChangeValue={({ value }) => mic.set_volume(value)}
            hexpand
            value={level}
         />
      </overlay>
   );
}

export function Sliders() {
   return (
      <box
         spacing={options.theme.spacing}
         orientation={Gtk.Orientation.VERTICAL}
         class={"sliders"}
      >
         <VolumeBox />
         <MicrophoneBox />
         {dependencies("brightnessctl") && <BrightnessBox />}
      </box>
   );
}
