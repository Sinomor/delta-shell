import AstalNotifd from "gi://AstalNotifd?version=0.1";
import { Gdk, Gtk } from "ags/gtk4";
import { icons } from "@/src/lib/icons";
import { createBinding, For } from "ags";
import { config, theme } from "@/options";
import { Notification } from "./notification";
import { qs_page_set } from "../quicksettings/quicksettings";
const notifd = AstalNotifd.get_default();

function Header({ showArrow = false }: { showArrow?: boolean }) {
   return (
      <box class={"notifs-header"} spacing={theme.spacing}>
         {showArrow && (
            <button
               cssClasses={["qs-header-button", "qs-page-prev"]}
               focusOnClick={false}
               onClicked={() => qs_page_set("main")}
            >
               <image iconName={icons.arrow.left} pixelSize={20} />
            </button>
         )}
         <label label={"Notifications"} />
         <box hexpand />
         <button
            cssClasses={["qs-header-button", "notifs-dnd"]}
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
         <button
            cssClasses={["qs-header-button", "notifs-clear"]}
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

export function NotificationsListModule({
   showArrow = false,
}: {
   showArrow?: boolean;
}) {
   return (
      <box
         spacing={theme.spacing}
         orientation={Gtk.Orientation.VERTICAL}
         widthRequest={config.notifications.width}
         class={"notifications-list"}
      >
         <Header showArrow={showArrow} />
         <NotFound />
         <List />
      </box>
   );
}
