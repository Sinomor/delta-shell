import Pango from "gi://Pango?version=1.0";
import { bash } from "@/src/lib/utils";
import { Gdk, Gtk } from "ags/gtk4";
import { hideWindows } from "@/windows";
import Clipboard from "@/src/services/clipboard";
const clipboard = Clipboard.get_default();

export function ClipColor({ id, content }: { id: string; content: string }) {
   const gdkColor = new Gdk.RGBA();
   const isValid = gdkColor.parse(content);

   return (
      <button
         cssClasses={["clipbutton", "color-content"]}
         onClicked={() => {
            clipboard.copy(id);
            hideWindows();
         }}
         focusOnClick={false}
      >
         <box spacing={16}>
            <box
               widthRequest={20}
               heightRequest={20}
               valign={Gtk.Align.CENTER}
               class={"color"}
               css={`
                  background: ${isValid ? content : "transparent"};
               `}
            />
            <label
               hexpand
               class={"name"}
               maxWidthChars={35}
               ellipsize={Pango.EllipsizeMode.END}
               halign={Gtk.Align.START}
               valign={Gtk.Align.CENTER}
               label={content}
            />
         </box>
      </button>
   );
}
