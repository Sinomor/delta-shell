import Gtk from "gi://Gtk";
import Powermenu from "@/src/services/powermenu";
import { createBinding } from "ags";
import { hide_all_windows, windows_names } from "@/windows";
import { config, theme } from "@/options";
import { bash } from "@/src/lib/utils";
import Pango from "gi://Pango?version=1.0";
import Adw from "gi://Adw?version=1";
const powermenu = Powermenu.get_default();

export function VerificationModule() {
   return (
      <box class={"main"} orientation={Gtk.Orientation.VERTICAL} spacing={20}>
         <label label={createBinding(powermenu, "title")} class={"title"} />
         <Adw.Clamp maximumSize={280}>
            <label
               label={createBinding(powermenu, "label")}
               wrap
               justify={Gtk.Justification.CENTER}
               wrapMode={Pango.WrapMode.CHAR}
               class={"label"}
            />
         </Adw.Clamp>
         <box homogeneous={true} spacing={theme.spacing}>
            <button
               label={"Cancel"}
               focusOnClick={false}
               onClicked={() => {
                  powermenu.cancelAction();
                  hide_all_windows();
               }}
            />
            <button
               label={createBinding(powermenu, "title")}
               focusOnClick={false}
               onClicked={() => {
                  bash(powermenu.cmd);
                  hide_all_windows();
               }}
            />
         </box>
      </box>
   );
}
