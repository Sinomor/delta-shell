import { Gtk } from "ags/gtk4";
import AstalApps from "gi://AstalApps?version=0.1";
import Pango from "gi://Pango?version=1.0";
import { hide_all_windows } from "@/windows";

export function AppButton({ app }: { app: AstalApps.Application }) {
   return (
      <button
         cssClasses={["launcher-button", "appbutton"]}
         onClicked={() => {
            hide_all_windows();
            app.launch();
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
