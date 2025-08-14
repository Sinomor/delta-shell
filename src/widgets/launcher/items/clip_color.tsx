import Pango from "gi://Pango?version=1.0";
import { bash } from "@/src/lib/utils";
import { Gdk, Gtk } from "ags/gtk4";
import { hide_all_windows } from "@/windows";

export function ClipColor({ id, content }: { id: string; content: string }) {
   const gdkColor = new Gdk.RGBA();
   const isValid = gdkColor.parse(content);

   return (
      <button
         cssClasses={["launcher-button", "clipbutton", "color-content"]}
         onClicked={() => {
            bash(`cliphist decode ${id} | wl-copy`);
            hide_all_windows();
         }}
         focusOnClick={false}
      >
         <box spacing={16}>
            <box
               widthRequest={20}
               heightRequest={20}
               valign={Gtk.Align.CENTER}
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
