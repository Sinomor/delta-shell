import Gio from "gi://Gio?version=2.0";
import { bash, ensureDirectory } from "@/src/lib/utils";
import { Gtk } from "ags/gtk4";
import { timeout } from "ags/time";
import app from "ags/gtk4/app";
import { createState, onCleanup } from "ags";
import { hide_all_windows, windows_names } from "@/windows";
import { config, theme } from "@/options";

export function ClipImage({
   id,
   content,
}: {
   id: string;
   content: RegExpMatchArray;
}) {
   const [_, size, unit, format, width, height] = content;
   const maxWidth =
      config.launcher.width.get() - theme.window.padding.get() * 2;
   let widthPx = (Number(width) / Number(height)) * 200;
   let heightPx: number;

   if (widthPx > maxWidth) heightPx = (200 / widthPx) * maxWidth;
   else heightPx = 200;

   const imagePath = `/tmp/ags/cliphist/${id}.png`;
   const [image, image_set] = createState("");
   let picturebox: Gtk.Picture;
   let appconnect: number;

   async function loadImage() {
      try {
         ensureDirectory("/tmp/ags/cliphist/");
         await bash(`cliphist decode ${id} > ${imagePath}`);
         image_set(imagePath);
      } catch (error) {
         console.error(`Failed to load image preview: ${error}`);
      }
   }

   loadImage();
   onCleanup(() => {
      if (appconnect) app.disconnect(appconnect);
   });

   return (
      <button
         cssClasses={["launcher-button", "clipbutton", "image-content"]}
         heightRequest={heightPx}
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

               if (winName == windows_names.launcher && !visible) {
                  picturebox.set_file(null);
                  bash(`rm -f ${imagePath}`);
               }
            });
         }}
      >
         <Gtk.Picture
            halign={Gtk.Align.START}
            $={(self) => (picturebox = self)}
            file={image.as((p) => Gio.file_new_for_path(p))}
         />
      </button>
   );
}
