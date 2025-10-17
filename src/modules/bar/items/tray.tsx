import AstalTray from "gi://AstalTray?version=0.1";
import { icons } from "@/src/lib/icons";
import { Gtk } from "ags/gtk4";
import { createBinding, createState, For } from "ags";
import BarItem from "@/src/widgets/baritem";
import { config } from "@/options";
import { isVertical } from "../bar";
const tray = AstalTray.get_default();

export const Tray = () => {
   const [tray_visible, tray_visible_set] = createState(false);
   const items = createBinding(tray, "items").as((items) =>
      items.filter((item) => item.id !== null),
   );

   const init = (btn: Gtk.MenuButton, item: AstalTray.TrayItem) => {
      btn.menuModel = item.menuModel;
      btn.insert_action_group("dbusmenu", item.actionGroup);
      item.connect("notify::action-group", () => {
         btn.insert_action_group("dbusmenu", item.actionGroup);
      });
   };

   function icon(visible: boolean) {
      if (isVertical) {
         return visible ? icons.arrow.down : icons.arrow.up;
      } else {
         return visible ? icons.arrow.right : icons.arrow.left;
      }
   }

   return (
      <box
         class={"tray"}
         orientation={
            isVertical ? Gtk.Orientation.VERTICAL : Gtk.Orientation.HORIZONTAL
         }
      >
         <revealer
            revealChild={tray_visible}
            transitionType={
               isVertical
                  ? Gtk.RevealerTransitionType.SLIDE_UP
                  : Gtk.RevealerTransitionType.SLIDE_RIGHT
            }
            transitionDuration={config.transition.get() * 1000}
         >
            <box
               class={"items"}
               hexpand={isVertical}
               orientation={
                  isVertical
                     ? Gtk.Orientation.VERTICAL
                     : Gtk.Orientation.HORIZONTAL
               }
            >
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
         <BarItem
            onPrimaryClick={() => tray_visible_set((v) => !v)}
            hexpand={isVertical}
         >
            <image
               hexpand={isVertical}
               iconName={tray_visible((v) => icon(v))}
               pixelSize={20}
            />
         </BarItem>
      </box>
   );
};
