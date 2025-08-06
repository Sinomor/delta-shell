import Astal from "gi://Astal?version=4.0";
import Gdk from "gi://Gdk";
import Gtk from "gi://Gtk";
import app from "ags/gtk4/app";
import Graphene from "gi://Graphene?version=1.0";
import Powermenu from "@/utils/powermenu";
import { exec } from "ags/process";
import { createBinding } from "ags";
import { hide_all_windows, windows_names } from "@/windows";
import { PopupWindow } from "../common/popupwindow";
import { config, theme } from "@/options";
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
                  exec(powermenu.cmd);
                  hide_all_windows();
               }}
            />
         </box>
      </box>
   );
}

export default function (gdkmonitor: Gdk.Monitor) {
   return (
      <PopupWindow name={windows_names.verification} gdkmonitor={gdkmonitor}>
         <Verification />
      </PopupWindow>
   );
}
