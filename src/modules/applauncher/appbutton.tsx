import { Gtk } from "ags/gtk4";
import AstalApps from "gi://AstalApps?version=0.1";
import Pango from "gi://Pango?version=1.0";
import { hideWindows } from "@/windows";

export function AppButton({ app }: { app: AstalApps.Application }) {
   return (
      <button
         class={"appbutton"}
         onClicked={() => {
            app.launch();
            hideWindows();
         }}
         focusOnClick={false}
      >
         <box spacing={16}>
            <image iconName={app.iconName} iconSize={Gtk.IconSize.LARGE} />
            <label
               class={"name"}
               ellipsize={Pango.EllipsizeMode.END}
               label={app.name}
            />
         </box>
      </button>
   );
}
