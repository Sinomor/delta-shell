import { config, theme } from "@/options";
import { BarItemPopup } from "../common/baritempopup";
import { windows_names } from "@/windows";
import { Gdk, Gtk } from "ags/gtk4";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import { icons } from "@/utils/icons";
import { createBinding, For } from "ags";
import { Notification } from "./items/notification";
const { height } = config.notifications.list;
const width =
   config.notifications.width.get() +
   theme.window.padding.get() * 2 +
   theme.window.border.width.get() * 2;
const notifd = AstalNotifd.get_default();

function Clear() {
   return (
      <button
         class={"notifs-clear"}
         focusOnClick={false}
         tooltipText={"Clear all"}
         onClicked={() => {
            notifd.notifications.forEach((n) => n.dismiss());
         }}
      >
         <image
            halign={Gtk.Align.CENTER}
            iconName={icons.trash}
            pixelSize={20}
         />
      </button>
   );
}

function DND() {
   return (
      <button
         class={"notifs-dnd"}
         tooltipText={"Don't disturb"}
         focusOnClick={false}
         onClicked={() => notifd.set_dont_disturb(!notifd.dontDisturb)}
      >
         <image
            halign={Gtk.Align.CENTER}
            iconName={createBinding(notifd, "dontDisturb").as((dnd) =>
               dnd ? icons.bell_off : icons.bell,
            )}
            pixelSize={20}
         />
      </button>
   );
}

function Header() {
   return (
      <box class={"notifs-header"} spacing={theme.spacing}>
         <label label={"Notifications"} />
         <box hexpand />
         <DND />
         <Clear />
      </box>
   );
}

function NotFound() {
   return (
      <box
         halign={Gtk.Align.CENTER}
         valign={Gtk.Align.CENTER}
         class={"notifs-not-found"}
         vexpand
         visible={createBinding(notifd, "notifications").as(
            (n) => n.length === 0,
         )}
      >
         <label label={"Your inbox is empty"} />
      </box>
   );
}

function List() {
   const list = createBinding(notifd, "notifications").as((notifs) =>
      notifs.sort((a, b) => b.time - a.time),
   );

   return (
      <scrolledwindow>
         <box
            class={"list"}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={theme.spacing}
            vexpand
         >
            <For each={list}>
               {(notif) => (
                  <Notification n={notif} onClose={() => notif.dismiss()} />
               )}
            </For>
         </box>
      </scrolledwindow>
   );
}

function NotificationsList() {
   return (
      <box
         spacing={theme.spacing}
         orientation={Gtk.Orientation.VERTICAL}
         widthRequest={width}
         class={"main"}
      >
         <Header />
         <NotFound />
         <List />
      </box>
   );
}

export default function (gdkmonitor: Gdk.Monitor) {
   return (
      <BarItemPopup
         name={windows_names.notifications_list}
         module={"notifications"}
         gdkmonitor={gdkmonitor}
         width={width}
         height={height.get()}
      >
         <NotificationsList />
      </BarItemPopup>
   );
}
