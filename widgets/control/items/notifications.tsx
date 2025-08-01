import { Gtk } from "ags/gtk4";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import { Notification } from "@/widgets/notifications/notification";
import { icons } from "@/utils/icons";
import { createBinding, For } from "ags";
import options from "@/options";
const notifd = AstalNotifd.get_default();

function Clear() {
   return (
      <button
         class={"notifs-clear"}
         focusOnClick={false}
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

function Header() {
   return (
      <box class={"notifs-list-header"}>
         <label label={"Notifications"} />
         <box hexpand />
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
            class={"notifs-list"}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={options.theme.spacing}
            vexpand
         >
            <For each={list}>
               {(notif) => (
                  <Notification n={notif} showActions={true} popup={false} />
               )}
            </For>
         </box>
      </scrolledwindow>
   );
}

export function NotificationsList() {
   return (
      <box
         spacing={options.theme.spacing}
         orientation={Gtk.Orientation.VERTICAL}
      >
         <Header />
         <NotFound />
         <List />
      </box>
   );
}
