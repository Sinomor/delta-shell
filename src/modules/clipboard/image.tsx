import Gio from "gi://Gio?version=2.0";
import { Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { createState } from "ags";
import { hideWindows } from "@/windows";
import { config, theme } from "@/options";
import Clipboard from "@/src/services/clipboard";
import Adw from "gi://Adw?version=1";
const clipboard = Clipboard.get_default();

export function ClipImage({
   id,
   content,
}: {
   id: string;
   content: RegExpMatchArray;
}) {
   const [_, size, unit, format, width, height] = content;

   const widthPx = config.clipboard.width - theme.window.padding * 2 - 20;
   const heightPx = Math.floor((widthPx * Number(height)) / Number(width));

   return (
      <Adw.Clamp maximumSize={widthPx}>
         <button
            cssClasses={["clipbutton", "image-content"]}
            onClicked={() => {
               clipboard.copy(id);
               hideWindows();
            }}
            focusOnClick={false}
         >
            <Gtk.Picture
               class={"image"}
               contentFit={Gtk.ContentFit.CONTAIN}
               heightRequest={heightPx}
               $={async (self) => {
                  const image = await clipboard.load_image(id);
                  if (image) self.set_file(Gio.file_new_for_path(image));
               }}
            />
         </button>
      </Adw.Clamp>
   );
}
