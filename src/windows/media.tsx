import { windows_names } from "@/windows";
import { BarItemPopup } from "../widgets/baritempopup";
import { MprisPlayers } from "../modules/quicksettings/items/media";
import AstalMpris from "gi://AstalMpris?version=0.1";
import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import { theme } from "@/options";
import { icons } from "../lib/icons";

export function MediaWindow() {
   const mpris = AstalMpris.get_default();
   const list = createBinding(mpris, "players");

   return (
      <BarItemPopup name={windows_names.media} module={"media"} width={380}>
         <box orientation={Gtk.Orientation.VERTICAL}>
            <MprisPlayers />
            <box
               valign={Gtk.Align.CENTER}
               halign={Gtk.Align.CENTER}
               spacing={theme.spacing}
               visible={list((players) => players.length === 0)}
               heightRequest={100}
            >
               <image
                  iconName={icons.player.icon}
                  pixelSize={theme["icon-size"].large}
               />
               <label label={"No media players running"} />
            </box>
         </box>
      </BarItemPopup>
   );
}
