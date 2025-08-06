import AstalTray from "gi://AstalTray?version=0.1";
import { icons } from "../../../utils/icons";
import { Gtk } from "ags/gtk4";
import { createBinding, createState, For } from "ags";
import BarItem from "@/widgets/common/baritem";
import { config } from "@/options";
const tray = AstalTray.get_default();

export const Tray = () => {
   const [tray_visible, tray_visible_set] = createState(false);
   const items = createBinding(tray, "items");

   const init = (btn: Gtk.MenuButton, item: AstalTray.TrayItem) => {
      btn.menuModel = item.menuModel;
      btn.insert_action_group("dbusmenu", item.actionGroup);
      item.connect("notify::action-group", () => {
         btn.insert_action_group("dbusmenu", item.actionGroup);
      });
   };

   return (
      <box class={"tray"}>
         <revealer
            revealChild={tray_visible}
            transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
            transitionDuration={config.transition}
         >
            <box class={"items"}>
               <For each={items}>
                  {(item) => (
                     <menubutton $={(self) => init(self, item)}>
                        <image
                           gicon={createBinding(item, "gicon")}
                           pixelSize={20}
                        />
                     </menubutton>
                  )}
               </For>
            </box>
         </revealer>
         <BarItem onPrimaryClick={() => tray_visible_set((v) => !v)}>
            <image
               iconName={tray_visible((v) =>
                  v ? icons.arrow.right : icons.arrow.left,
               )}
               pixelSize={20}
            />
         </BarItem>
      </box>
   );
};
