import Pango from "gi://Pango?version=1.0";
import { bash } from "@/src/lib/utils";
import { Gtk } from "ags/gtk4";
import { hideWindows } from "@/windows";
import Clipboard from "@/src/services/clipboard";
const clipboard = Clipboard.get_default();

export function ClipText({ id, content }: { id: string; content: string }) {
   return (
      <button
         cssClasses={["clipbutton", "text-content"]}
         onClicked={() => {
            clipboard.copy(id);
            hideWindows();
         }}
         focusOnClick={false}
      >
         <label
            hexpand
            class={"name"}
            maxWidthChars={35}
            ellipsize={Pango.EllipsizeMode.END}
            halign={Gtk.Align.START}
            label={content}
         />
      </button>
   );
}
