import Gio from "gi://Gio?version=2.0";
import { bash, ensureDirectory } from "@/src/lib/utils";
import { Gtk } from "ags/gtk4";
import { timeout } from "ags/time";
import app from "ags/gtk4/app";
import { createState, onCleanup } from "ags";
import { hide_all_windows, windows_names } from "@/windows";
import { config, theme } from "@/options";
import Cliphist from "@/src/services/cliphist";
const clipboard = Cliphist.get_default();

export function ClipImage({
   id,
   content,
}: {
   id: string;
   content: RegExpMatchArray;
}) {
   const [_, size, unit, format, width, height] = content;
   const maxWidth = config.launcher.width - theme.window.padding * 2;
   let widthPx = (Number(width) / Number(height)) * 200;
   let heightPx: number;

   if (widthPx > maxWidth) heightPx = (200 / widthPx) * maxWidth;
   else heightPx = 200;

   return (
      <button
         cssClasses={["launcher-button", "clipbutton", "image-content"]}
         heightRequest={heightPx}
         hexpand
         onClicked={() => {
            clipboard.copy(id);
            hide_all_windows();
         }}
         focusOnClick={false}
      >
         <Gtk.Picture
            class={"image"}
            halign={Gtk.Align.START}
            $={async (self) => {
               const image = await clipboard.load_image(id);
               if (image) self.set_file(Gio.file_new_for_path(image));
            }}
         />
      </button>
   );
}
