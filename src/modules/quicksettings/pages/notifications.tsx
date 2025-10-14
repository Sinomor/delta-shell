import { config, theme } from "@/options";
import { Gtk } from "ags/gtk4";
import { NotificationsListModule } from "../../notifications/notificationslist";
const width =
   config.notifications.width.get() +
   theme.window.padding.get() * 2 +
   theme.window.border.width.get() * 2;

export function NotificationsPage() {
   return (
      <box
         $type={"named"}
         name={"notifications"}
         heightRequest={500}
         widthRequest={width}
         cssClasses={["qs-menu-page", "notifications-page"]}
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
      >
         <NotificationsListModule width={width} showArrow={true} />
      </box>
   );
}
