import app from "ags/gtk4/app";
import { Astal, Gdk } from "ags/gtk4";
import { timeout } from "ags/time";
import Wp from "gi://AstalWp";
import Gtk from "gi://Gtk";
import { icons, VolumeIcon } from "@/src/lib/icons";
import { Accessor, createState, onCleanup } from "ags";
import Brightness from "@/src/services/brightness";
import giCairo from "cairo";
import { config, theme } from "@/options";
import { windows_names } from "@/windows";
const { width, position } = config.osd;
const { margin } = theme.window;
const [visible, visible_set] = createState(false);
const [revealed, setRevealed] = createState(false);

function OnScreenProgress({ visible }: { visible: Accessor<boolean> }) {
   const brightness = Brightness.get_default();
   const speaker = Wp.get_default()?.get_default_speaker();

   const [iconName, iconName_set] = createState("");
   const [value, value_set] = createState(0);
   let firstStart = true;
   let count = 0;

   function show(v: number, icon: string) {
      visible_set(true);
      setRevealed(true);
      value_set(v);
      iconName_set(icon);
      count++;

      timeout(config.osd.timeout.get() * 1000, () => {
         count--;
         if (count === 0) {
            setRevealed(false);
         }
      });
   }

   return (
      <box
         $={() => {
            if (brightness) {
               const brightnessconnect = brightness.connect(
                  "notify::screen",
                  () => {
                     show(brightness.screen, icons.brightness);
                  },
               );
               onCleanup(() => brightness.disconnect(brightnessconnect));
            }
            timeout(500, () => (firstStart = false));
            if (speaker) {
               const volumeconnect = speaker.connect("notify::volume", () => {
                  if (firstStart) return;
                  show(speaker.volume, VolumeIcon.get());
               });
               const muteconnect = speaker.connect("notify::mute", () => {
                  if (firstStart) return;
                  show(speaker.volume, VolumeIcon.get());
               });
               onCleanup(() => {
                  speaker.disconnect(volumeconnect);
                  speaker.disconnect(muteconnect);
               });
            }
         }}
      >
         <overlay class={"main"}>
            <image
               $type={"overlay"}
               iconName={iconName((i) => i)}
               class={value((v) => `osd-icon ${v < 0.1 ? "low" : ""}`)}
               valign={Gtk.Align.CENTER}
               halign={Gtk.Align.START}
               pixelSize={24}
            />
            <levelbar
               widthRequest={width}
               valign={Gtk.Align.CENTER}
               value={value((v) => v)}
            />
         </overlay>
      </box>
   );
}

export default function () {
   const { TOP, BOTTOM, RIGHT, LEFT } = Astal.WindowAnchor;
   let win: Astal.Window;
   const pos = position.get();

   function halign() {
      switch (pos) {
         case "top":
            return Gtk.Align.CENTER;
         case "bottom":
            return Gtk.Align.CENTER;
         case "top_left":
            return Gtk.Align.START;
         case "top_right":
            return Gtk.Align.END;
         case "bottom_left":
            return Gtk.Align.START;
         case "bottom_right":
            return Gtk.Align.END;
         default:
            return Gtk.Align.CENTER;
      }
   }

   function valign() {
      switch (pos) {
         case "top":
            return Gtk.Align.START;
         case "bottom":
            return Gtk.Align.END;
         case "top_left":
            return Gtk.Align.START;
         case "top_right":
            return Gtk.Align.START;
         case "bottom_left":
            return Gtk.Align.END;
         case "bottom_right":
            return Gtk.Align.END;
         default:
            return Gtk.Align.START;
      }
   }

   return (
      <window
         name={windows_names.osd}
         application={app}
         anchor={TOP | BOTTOM | RIGHT | LEFT}
         layer={Astal.Layer.OVERLAY}
         visible={visible}
         $={(self) => (win = self)}
         onNotifyVisible={({ visible }) => {
            if (visible) {
               win.get_native()
                  ?.get_surface()
                  ?.set_input_region(new giCairo.Region());
            }
         }}
      >
         <revealer
            transitionType={
               config.osd.position.get().includes("top")
                  ? Gtk.RevealerTransitionType.SLIDE_DOWN
                  : Gtk.RevealerTransitionType.SLIDE_UP
            }
            transitionDuration={config.transition.get() * 1000}
            halign={halign()}
            valign={valign()}
            revealChild={revealed}
            onNotifyChildRevealed={({ childRevealed }) =>
               visible_set(childRevealed)
            }
         >
            <box
               marginBottom={margin}
               marginTop={margin}
               marginEnd={margin}
               marginStart={margin}
            >
               <OnScreenProgress visible={visible} />
            </box>
         </revealer>
      </window>
   );
}
