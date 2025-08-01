import AstalNotifd from "gi://AstalNotifd";
import { Notification } from "./notification";
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
import options from "@/options";
import giCairo from "cairo";
const notifd = AstalNotifd.get_default();
const { name, margin, timeout } = options.notifications_popup;

export function NotificationPopup(gdkmonitor: Gdk.Monitor) {
   const { TOP, BOTTOM, RIGHT, LEFT } = Astal.WindowAnchor;
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

   const halign = createComputed(
      [options.notifications_popup.position],
      (position) => {
         switch (position) {
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
      },
   );
   const valign = createComputed(
      [options.notifications_popup.position],
      (position) => {
         switch (position) {
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
      },
   );

   return (
      <window
         class={name}
         gdkmonitor={gdkmonitor}
         name={name}
         visible={windowVisibility}
         anchor={TOP | BOTTOM | RIGHT | LEFT}
         $={(self) => (win = self)}
         onNotifyVisible={({ visible }) => {
            if (visible) {
               contentbox.grab_focus();
               win
                  .get_native()
                  ?.get_surface()
                  ?.set_input_region(new giCairo.Region());
            }
         }}
      >
         <box
            $={(self) => (contentbox = self)}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={options.theme.spacing}
            halign={halign.get()}
            valign={valign.get()}
            focusable
            marginTop={margin}
            marginEnd={margin}
            marginStart={margin}
            marginBottom={margin}
         >
            <For each={notifications}>
               {(n) => (
                  <Notification
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
