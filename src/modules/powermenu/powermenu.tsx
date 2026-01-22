import Gtk from "gi://Gtk";
import { icons } from "@/src/lib/icons";
import PowerMenu from "@/src/services/powermenu";
import { windows_names } from "@/windows";
import { config, theme } from "@/options";
import { t } from "@/i18n";
const powermenu = PowerMenu.get_default();

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
            <image iconName={icon} pixelSize={theme["icon-size"].large} />
            <label label={label} />
         </box>
      </button>
   );
}

const list = [
  { key: 'Sleep', label: t("modules.powermenu.sleep") },
  { key: 'Logout', label: t("modules.powermenu.logout") },
  { key: 'Reboot', label: t("modules.powermenu.reboot") },
  { key: 'Shutdown', label: t("modules.powermenu.shutdown") },
];

export function PowerMenuModule() {
   console.log("PowerMenu: initializing module");

   return (
      <box spacing={theme.spacing}>
         {list.map(({ key, label }) => (
            <MenuButton
               icon={icons.powermenu[key.toLowerCase()]}
               label={label}
               clicked={() => powermenu.action(key)}
            />
         ))}
      </box>
   );
}
