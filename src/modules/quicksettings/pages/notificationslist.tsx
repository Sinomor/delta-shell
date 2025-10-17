import { config, theme } from "@/options";
import { Gtk } from "ags/gtk4";
import { NotificationsListModule } from "../../notifications/notificationslist";

export function NotificationsListPage() {
   return (
      <box
         $type={"named"}
         name={"notificationslist"}
         heightRequest={
            config.notifications.list.height.get() -
            theme.window.padding.get() * 2
         }
         class={"qs-menu-page"}
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
      >
         <NotificationsListModule showArrow={true} />
      </box>
   );
}
