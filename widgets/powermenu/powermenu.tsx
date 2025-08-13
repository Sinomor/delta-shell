import Astal from "gi://Astal?version=4.0";
import Gdk from "gi://Gdk";
import Gtk from "gi://Gtk";
import app from "ags/gtk4/app";
import { icons } from "@/utils/icons";
import Powermenu from "@/utils/powermenu";
import { hide_all_windows, windows_names } from "@/windows";
import { PopupWindow } from "../common/popupwindow";
import { config, theme } from "@/options";
const powermenu = Powermenu.get_default();

type MenuButtonProps = {
   icon: string;
   label: string;
   clicked: () => void;
};

function MenuButton({ icon, label, clicked }: MenuButtonProps) {
   return (
      <button class={"menubutton"} onClicked={clicked} focusOnClick={false}>
         <box
            orientation={Gtk.Orientation.VERTICAL}
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.CENTER}
            spacing={theme.spacing}
         >
            <image iconName={icon} iconSize={Gtk.IconSize.LARGE} />
            <label label={label} />
         </box>
      </button>
   );
}

const list = ["Sleep", "Logout", "Reboot", "Shutdown"];

function PowerMenu() {
   return (
      <box class={"main"} spacing={theme.spacing}>
         {list.map((value) => (
            <MenuButton
               icon={icons.powermenu[value.toLowerCase()]}
               label={value}
               clicked={() => powermenu.action(value)}
            />
         ))}
      </box>
   );
}

export default function () {
   return (
      <PopupWindow name={windows_names.powermenu}>
         <PowerMenu />
      </PopupWindow>
   );
}
