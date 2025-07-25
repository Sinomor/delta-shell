import Pango from "gi://Pango";
import Gtk from "gi://Gtk";
import AstalNotifd from "gi://AstalNotifd";
import GLib from "gi://GLib?version=2.0";
import { isIcon, fileExists } from "@/utils/utils";
import Gio from "gi://Gio?version=2.0";
import options from "@/options";

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

export function Notification(props: {
   n: AstalNotifd.Notification;
   showActions?: boolean;
}) {
   const { n, showActions = true } = props;
   const hasActions = showActions && n.get_actions().length > 0;

   function Header() {
      return (
         <box class={"header"} spacing={options.theme.spacing}>
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
               onClicked={() => n.dismiss()}
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
         <box class={"content"} spacing={options.theme.spacing}>
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
         <box class="actions" spacing={options.theme.spacing}>
            {n.actions.map(({ label, id }) => (
               <button hexpand onClicked={() => n.invoke(id)}>
                  <label label={label} halign={Gtk.Align.CENTER} hexpand />
               </button>
            ))}
         </box>
      );
   }

   return (
      <box
         orientation={Gtk.Orientation.VERTICAL}
         class={`notification ${urgency(n)}`}
         spacing={options.theme.spacing}
      >
         <Header />
         <Content />
         {hasActions && <Actions />}
      </box>
   );
}
