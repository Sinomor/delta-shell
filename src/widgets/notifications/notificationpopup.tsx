import AstalNotifd from "gi://AstalNotifd";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import {
   createBinding,
   createComputed,
   createState,
   For,
   onCleanup,
} from "ags";
import app from "ags/gtk4/app";
import GLib from "gi://GLib";
import giCairo from "gi://cairo";
import { config, theme } from "@/options";
import { windows_names } from "@/windows";
import { Notification, PopupNotification } from "./items/notification";
import { timeout } from "ags/time";
const notifd = AstalNotifd.get_default();
const { position } = config.notifications;
const { margin } = theme.window;

export function NotificationPopup() {
   const { TOP, BOTTOM, RIGHT, LEFT } = Astal.WindowAnchor;
   const pos = position.get();
   let contentbox: Gtk.Box;
   let win: Astal.Window;
   const [notifications, notifications_set] = createState(
      new Array<AstalNotifd.Notification>(),
   );
   const doNotDisturb = createBinding(notifd, "dont_disturb");

   const notifiedHandler = notifd.connect("notified", (_, id, replaced) => {
      const notification = notifd.get_notification(id);

      if (replaced && notifications.get().some((n) => n.id === id)) {
         notifications_set((ns) =>
            ns.map((n) => (n.id === id ? notification : n)),
         );
      } else {
         notifications_set((ns) => [notification, ...ns]);
      }
   });

   const resolvedHandler = notifd.connect("resolved", (_, id) => {
      notifications_set((ns) => ns.filter((n) => n.id !== id));
   });

   onCleanup(() => {
      notifd.disconnect(notifiedHandler);
      notifd.disconnect(resolvedHandler);
      unsub();
   });

   const windowVisibility = createComputed(
      [notifications, doNotDisturb],
      (notifications, doNotDisturb) => {
         return !doNotDisturb && notifications.length > 0;
      },
   );

   function handleHideNotification(notification: AstalNotifd.Notification) {
      if (notification.transient) return notification.dismiss();

      notifications_set((notifications) =>
         notifications.filter((notif) => notif.id !== notification.id),
      );
   }

   function halign() {
      switch (pos) {
         case "top":
            return Gtk.Align.CENTER;
         case "bottom":
            return Gtk.Align.CENTER;
         case "top_left":
            return Gtk.Align.START;
         case "top_right":
            return Gtk.Align.END;
         case "bottom_left":
            return Gtk.Align.START;
         case "bottom_right":
            return Gtk.Align.END;
         default:
            return Gtk.Align.CENTER;
      }
   }
   function valign() {
      switch (pos) {
         case "top":
            return Gtk.Align.START;
         case "bottom":
            return Gtk.Align.END;
         case "top_left":
            return Gtk.Align.START;
         case "top_right":
            return Gtk.Align.START;
         case "bottom_left":
            return Gtk.Align.END;
         case "bottom_right":
            return Gtk.Align.END;
         default:
            return Gtk.Align.START;
      }
   }

   const unsub = notifications.subscribe(() => {
      timeout(100, () => {
         const [_success, bounds] = contentbox.compute_bounds(win);

         const height = bounds.get_height();
         const width = bounds.get_width();
         const x = bounds.get_x();
         const y = bounds.get_y();

         const region = new giCairo.Region();

         // @ts-expect-error
         region.unionRectangle(
            new giCairo.Rectangle({
               x,
               y,
               width,
               height,
            }),
         );

         win.get_native()?.get_surface()?.set_input_region(region);
      });
   });

   return (
      <window
         name={windows_names.notifications_popup}
         visible={windowVisibility}
         anchor={TOP | BOTTOM | RIGHT | LEFT}
         $={(self) => (win = self)}
         onNotifyVisible={({ visible }) => {
            if (visible) {
               contentbox.grab_focus();
            }
         }}
      >
         <box
            $={(self) => (contentbox = self)}
            orientation={Gtk.Orientation.VERTICAL}
            halign={halign()}
            valign={valign()}
            focusable
            marginEnd={margin}
            marginStart={margin}
         >
            <For each={notifications}>
               {(n) => (
                  <PopupNotification
                     n={n}
                     showActions={true}
                     onHide={handleHideNotification}
                  />
               )}
            </For>
         </box>
      </window>
   );
}
