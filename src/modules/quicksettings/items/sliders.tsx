import { createBinding } from "ags";
import { icons, VolumeIcon } from "@/src/lib/icons";
import { Gtk } from "ags/gtk4";
import AstalWp from "gi://AstalWp?version=0.1";
import Brightness from "@/src/services/brightness";
import { dependencies } from "@/src/lib/utils";
import { theme } from "@/options";
import { qs_page_set } from "../quicksettings";
const brightness = Brightness.get_default();

function BrightnessBox() {
   const level = createBinding(brightness, "screen");

   return (
      <overlay
         class={level.as(
            (v) => `slider-box brightness-box ${v < 0.16 ? "low" : ""}`,
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
            (v) => `slider-box volume-box ${v < 0.05 ? "low" : ""}`,
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
