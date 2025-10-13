import { timeout } from "ags/time";
import Wp from "gi://AstalWp";
import Gtk from "gi://Gtk";
import { icons, VolumeIcon } from "@/src/lib/icons";
import { Accessor, createState, onCleanup } from "ags";
import Brightness from "@/src/services/brightness";
import { config, theme } from "@/options";
import { windows_names } from "@/windows";
const { width, position } = config.osd;
export const [osd_visible, osd_visible_set] = createState(false);
export const [osd_revealed, osd_revealed_set] = createState(false);

export function OsdModule({ visible }: { visible: Accessor<boolean> }) {
   const brightness = Brightness.get_default();
   const speaker = Wp.get_default()?.get_default_speaker();

   const [iconName, iconName_set] = createState("");
   const [value, value_set] = createState(0);
   let firstStart = true;
   let count = 0;

   function show(v: number, icon: string) {
      osd_visible_set(true);
      osd_revealed_set(true);
      value_set(v);
      iconName_set(icon);
      count++;

      timeout(config.osd.timeout.get() * 1000, () => {
         count--;
         if (count === 0) {
            osd_revealed_set(false);
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
