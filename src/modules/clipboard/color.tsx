import Pango from "gi://Pango?version=1.0";
import { bash } from "@/src/lib/utils";
import { Gdk, Gtk } from "ags/gtk4";
import { hide_all_windows } from "@/windows";
import Cliphist from "@/src/services/cliphist";
const clipboard = Cliphist.get_default();

export function ClipColor({ id, content }: { id: string; content: string }) {
   const gdkColor = new Gdk.RGBA();
   const isValid = gdkColor.parse(content);

   return (
      <button
         cssClasses={["launcher-button", "clipbutton", "color-content"]}
         onClicked={() => {
            clipboard.copy(id);
            hide_all_windows();
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
