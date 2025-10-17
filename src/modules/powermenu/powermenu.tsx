import Gtk from "gi://Gtk";
import { icons } from "@/src/lib/icons";
import Powermenu from "@/src/services/powermenu";
import { hide_all_windows, windows_names } from "@/windows";
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

export function PowerMenuModule() {
   return (
      <box spacing={theme.spacing}>
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
