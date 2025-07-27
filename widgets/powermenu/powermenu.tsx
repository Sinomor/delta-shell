import Astal from "gi://Astal?version=4.0";
import Gdk from "gi://Gdk";
import Gtk from "gi://Gtk";
import app from "ags/gtk4/app";
import Graphene from "gi://Graphene?version=1.0";
import { icons } from "@/utils/icons";
import Powermenu from "@/utils/powermenu";
import { hide_all_windows } from "@/windows";
import options from "@/options";
import { PopupWindow } from "../common/popupwindow";
const { name } = options.powermenu;
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
            spacing={options.theme.spacing}
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
      <box class={"main"} spacing={options.theme.main_padding}>
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

export default function (gdkmonitor: Gdk.Monitor) {
   return (
      <PopupWindow name={name} gdkmonitor={gdkmonitor}>
         <PowerMenu />
      </PopupWindow>
   );
}
