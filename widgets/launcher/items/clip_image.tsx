import Gio from "gi://Gio?version=2.0";
import { bash } from "../../../utils/utils";
import { Gtk } from "ags/gtk4";
import { timeout } from "ags/time";
import app from "ags/gtk4/app";
import { createState, onCleanup } from "ags";
import { hide_all_windows } from "@/windows";
import { config } from "@/options";

export function ClipImage({
   id,
   content,
}: {
   id: string;
   content: RegExpMatchArray;
}) {
   const [_, size, unit, format, width, height] = content;
   const maxWidth = 460;
   const widthPx = (Number(width) / Number(height)) * 100;
   const heightPx = (105 / widthPx) * maxWidth;
   const imagePath = `/tmp/ags/cliphist/${id}.png`;
   const [image, image_set] = createState("");
   let picturebox: Gtk.Picture;
   let appconnect: number;

   async function loadImage() {
      try {
         await bash(`mkdir -p "/tmp/ags/cliphist/"`);
         await bash(`cliphist decode ${id} > ${imagePath}`);
         image_set(imagePath);
         timeout(1000, () => {
            bash(`rm -f ${imagePath}`).catch(print);
         });
      } catch (error) {
         console.error(`Failed to load image preview: ${error}`);
      }
   }

   loadImage();
   onCleanup(() => {
      if (appconnect) app.disconnect(appconnect);
   });

   return (
      <box class={"image-container"} heightRequest={heightPx}>
         <button
            cssClasses={["launcher-button", "clipbutton", "image-content"]}
            hexpand
            onClicked={() => {
               bash(`cliphist decode ${id} | wl-copy`);
               hide_all_windows();
            }}
            focusOnClick={false}
            $={() => {
               appconnect = app.connect("window-toggled", (_, win) => {
                  const winName = win.name;
                  const visible = win.visible;

                  if (winName == config.launcher.name && !visible) {
                     picturebox.set_file(null);
                  }
               });
            }}
         >
            <Gtk.Picture
               $={(self) => (picturebox = self)}
               file={image.as((p) => Gio.file_new_for_path(p))}
            />
         </button>
      </box>
   );
}
