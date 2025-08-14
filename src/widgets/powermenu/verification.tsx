import Gtk from "gi://Gtk";
import Powermenu from "@/src/services/powermenu";
import { createBinding } from "ags";
import { hide_all_windows, windows_names } from "@/windows";
import { PopupWindow } from "../common/popupwindow";
import { config, theme } from "@/options";
import { bash } from "@/src/lib/utils";
const powermenu = Powermenu.get_default();

function Verification() {
   return (
      <box class={"main"} orientation={Gtk.Orientation.VERTICAL} spacing={20}>
         <label label={createBinding(powermenu, "title")} class={"title"} />
         <label label={"Are you sure?"} class={"label"} />
         <box homogeneous={true} spacing={theme.spacing}>
            <button
               label={"No"}
               focusOnClick={false}
               onClicked={() => hide_all_windows()}
            />
            <button
               label={"Yes"}
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

export default function () {
   return (
      <PopupWindow name={windows_names.verification}>
         <Verification />
      </PopupWindow>
   );
}
