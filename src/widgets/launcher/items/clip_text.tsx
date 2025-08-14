import Pango from "gi://Pango?version=1.0";
import { bash } from "@/src/lib/utils";
import { Gtk } from "ags/gtk4";
import { hide_all_windows } from "@/windows";

export function ClipText({ id, content }: { id: string; content: string }) {
   return (
      <button
         cssClasses={["launcher-button", "clipbutton", "text-content"]}
         onClicked={() => {
            bash(`cliphist decode ${id} | wl-copy`);
            hide_all_windows();
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
