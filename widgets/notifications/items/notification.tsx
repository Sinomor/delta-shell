import Pango from "gi://Pango";
import Gtk from "gi://Gtk";
import AstalNotifd from "gi://AstalNotifd";
import GLib from "gi://GLib?version=2.0";
import { isIcon, fileExists } from "@/utils/utils";
import Gio from "gi://Gio?version=2.0";
import { createState } from "ags";
import { timeout } from "ags/time";
import { config, theme } from "@/options";
import Adw from "gi://Adw?version=1";
import { Timer } from "@/utils/timer";

const time = (time: number, format = "%H:%M") =>
   GLib.DateTime.new_from_unix_local(time).format(format);

function urgency(n: AstalNotifd.Notification) {
   const { LOW, NORMAL, CRITICAL } = AstalNotifd.Urgency;
   switch (n.urgency) {
      case LOW:
         return "low";
      case CRITICAL:
         return "critical";
      case NORMAL:
      default:
         return "normal";
   }
}

export function Notification({
   n,
   showActions = true,
   onClose,
   ...props
}: {
   n: AstalNotifd.Notification;
   showActions?: boolean;
   onClose: () => void;
}) {
   const notificationActions = n.actions.filter(
      (action) => action.id !== "default",
   );
   const hasActions = showActions && notificationActions.length > 0;

   function Header() {
      return (
         <box class={"header"} spacing={theme.spacing}>
            {(n.appIcon || isIcon(n.desktopEntry)) && (
               <image
                  class={"app-icon"}
                  iconName={n.appIcon || n.desktopEntry}
                  visible={Boolean(n.appIcon || n.desktopEntry)}
               />
            )}
            <label
               class={"app-name"}
               halign={Gtk.Align.START}
               ellipsize={Pango.EllipsizeMode.END}
               label={n.appName || "Unknown"}
            />
            <label
               class={"time"}
               hexpand
               halign={Gtk.Align.END}
               label={time(n.time)!}
            />
            <button
               onClicked={() => onClose()}
               class={"close"}
               focusOnClick={false}
            >
               <image iconName="window-close-symbolic" />
            </button>
         </box>
      );
   }

   function Content() {
      return (
         <box class={"content"} spacing={theme.spacing}>
            {n.image && fileExists(n.image) && (
               <scrolledwindow valign={Gtk.Align.START} class={"image"}>
                  <Gtk.Picture
                     contentFit={Gtk.ContentFit.COVER}
                     file={Gio.file_new_for_path(n.image)}
                  />
               </scrolledwindow>
            )}
            {n.image && isIcon(n.image) && (
               <box class={"icon"} valign={Gtk.Align.START}>
                  <image
                     iconName={n.image}
                     iconSize={Gtk.IconSize.LARGE}
                     halign={Gtk.Align.CENTER}
                     valign={Gtk.Align.CENTER}
                  />
               </box>
            )}
            <box hexpand orientation={Gtk.Orientation.VERTICAL}>
               <label
                  class={"body"}
                  maxWidthChars={30}
                  wrap={true}
                  halign={Gtk.Align.START}
                  useMarkup={true}
                  wrapMode={Pango.WrapMode.CHAR}
                  justify={Gtk.Justification.FILL}
                  label={n.body ? n.body : n.summary}
               />
            </box>
         </box>
      );
   }

   function Actions() {
      return (
         <box class="actions" spacing={theme.spacing}>
            {notificationActions.map(({ label, id }) => (
               <button hexpand onClicked={() => n.invoke(id)}>
                  <label label={label} halign={Gtk.Align.CENTER} hexpand />
               </button>
            ))}
         </box>
      );
   }

   return (
      <Adw.Clamp maximum_size={config.notifications.width.get()} {...props}>
         <box
            orientation={Gtk.Orientation.VERTICAL}
            widthRequest={config.notifications.width.get()}
            cssClasses={["notification", `${urgency(n)}`]}
            spacing={theme.spacing}
         >
            <Header />
            <Content />
            {hasActions && <Actions />}
         </box>
      </Adw.Clamp>
   );
}

export function PopupNotification({
   n,
   showActions = true,
   onHide,
}: {
   n: AstalNotifd.Notification;
   showActions?: boolean;
   onHide?: (notification: AstalNotifd.Notification) => void;
}) {
   const [revealed, revealed_set] = createState(false);

   const timer = new Timer(config.notifications.timeout.get() * 1000);

   timer.subscribe(async () => {
      revealed_set(true);
      if (timer.timeLeft <= 0) {
         revealed_set(false);

         timeout(
            config.transition.get() * 100 + 100,
            () => onHide && onHide(n),
         );
      }
   });

   const margin = theme.window.margin.get();
   return (
      <revealer
         transitionType={
            config.notifications.position.get().includes("top")
               ? Gtk.RevealerTransitionType.SLIDE_DOWN
               : Gtk.RevealerTransitionType.SLIDE_UP
         }
         transitionDuration={config.transition.get() * 1000}
         revealChild={revealed}
      >
         <Gtk.EventControllerMotion
            onEnter={() => (timer.isPaused = true)}
            onLeave={() => (timer.isPaused = false)}
         />
         <Notification
            n={n}
            onClose={() => revealed_set(false)}
            margin_top={margin / 2}
            margin_bottom={margin / 2}
            margin_start={margin}
            margin_end={margin}
         />
      </revealer>
   );
}
