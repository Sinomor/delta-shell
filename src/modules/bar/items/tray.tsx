import AstalTray from "gi://AstalTray?version=0.1";
import { icons } from "@/src/lib/icons";
import { Gdk, Gtk } from "ags/gtk4";
import { createBinding, createState, For, onCleanup } from "ags";
import BarItem from "@/src/widgets/baritem";
import { config, theme } from "@/options";
import { isVertical, orientation } from "../bar";

export function Tray() {
   const conf = config.bar.modules.tray;
   const tray = AstalTray.get_default();
   const items = createBinding(tray, "items").as((items) =>
      items.filter((item) => item.id !== null),
   );

   function position() {
      switch (config.bar.position) {
         case "top":
            return Gtk.PositionType.BOTTOM;
         case "bottom":
            return Gtk.PositionType.TOP;
         case "left":
            return Gtk.PositionType.LEFT;
         case "right":
            return Gtk.PositionType.RIGHT;
      }
   }

   const content = (
      <box
         class={"items"}
         hexpand={isVertical}
         orientation={orientation}
         spacing={theme.bar.spacing}
      >
         <For each={items}>
            {(item) => {
               let popovermenu: Gtk.PopoverMenu;

               return (
                  <box
                     class={"item"}
                     hexpand={isVertical}
                     $={(self) => {
                        popovermenu.connect("notify::visible", ({ visible }) =>
                           self[visible ? "add_css_class" : "remove_css_class"](
                              "active",
                           ),
                        );
                     }}
                  >
                     <image
                        gicon={item.gicon}
                        hexpand={isVertical}
                        tooltipMarkup={item.tooltipMarkup || item.title}
                        pixelSize={theme["icon-size"].normal}
                     />
                     <Gtk.GestureClick
                        onPressed={() => item.about_to_show()}
                        onReleased={(ctrl, _, x, y) => {
                           const button = ctrl.get_current_button();
                           if (button === Gdk.BUTTON_PRIMARY) {
                              item.activate(x, y);
                           } else if (button === Gdk.BUTTON_SECONDARY) {
                              if (popovermenu) {
                                 if (popovermenu.visible) {
                                    popovermenu.popdown();
                                 } else {
                                    popovermenu.popup();
                                 }
                              }
                           } else if (button === Gdk.BUTTON_MIDDLE) {
                              item.secondary_activate(x, y);
                           }
                        }}
                        button={0}
                     />
                     <Gtk.PopoverMenu
                        menuModel={item.menuModel}
                        position={position()}
                        $={(self) => {
                           popovermenu = self;
                           self.insert_action_group(
                              "dbusmenu",
                              item.actionGroup,
                           );

                           const conns = [
                              item.connect("notify::action-group", (item) => {
                                 self.insert_action_group(
                                    "dbusmenu",
                                    item.actionGroup,
                                 );
                              }),

                              item.connect("notify::menu-model", (item) => {
                                 self.set_menu_model(item.menuModel);
                              }),
                           ];

                           onCleanup(() => {
                              conns.map((id) => item.disconnect(id));
                           });
                        }}
                     />
                  </box>
               );
            }}
         </For>
      </box>
   );

   if (conf.compact) {
      const [visible, setVisible] = createState(false);

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
            orientation={orientation}
            spacing={theme.bar.spacing}
         >
            <revealer
               revealChild={visible}
               transitionType={
                  isVertical
                     ? Gtk.RevealerTransitionType.SLIDE_UP
                     : Gtk.RevealerTransitionType.SLIDE_RIGHT
               }
               transitionDuration={config.transition * 1000}
            >
               {content}
            </revealer>
            <button onClicked={() => setVisible((v) => !v)} class={"toggle"}>
               <image
                  hexpand={isVertical}
                  iconName={visible((v) => icon(v))}
                  pixelSize={theme["icon-size"].normal}
               />
            </button>
         </box>
      );
   } else {
      return <box class={"tray"}>{content}</box>;
   }
}
