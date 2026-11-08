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
   const popupWidth = 440;
   const contentWidth = popupWidth - theme.window.padding * 2;

   return (
      <BarItemPopup name={windows_names.media} module={"media"} width={popupWidth}>
         <box
            orientation={Gtk.Orientation.VERTICAL}
            widthRequest={contentWidth}
            spacing={theme.spacing}
         >
            <MprisPlayers widthRequest={contentWidth} />
            <box
               valign={Gtk.Align.CENTER}
               halign={Gtk.Align.CENTER}
               spacing={theme.spacing}
               visible={list((players) => players.length === 0)}
               heightRequest={120}
               widthRequest={contentWidth}
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
