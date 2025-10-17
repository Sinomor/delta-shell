import { config, theme } from "@/options";
import { windows_names } from "@/windows";
import { BarItemPopup } from "../widgets/baritempopup";
import { NotificationsListModule } from "../modules/notifications/notificationslist";
const { height } = config.notifications.list;
const width =
   config.notifications.width.get() +
   theme.window.padding.get() * 2 +
   theme.window.border.width.get() * 2;

export function NotificationsListWindow() {
   return (
      <BarItemPopup
         name={windows_names.notifications_list}
         module={"notifications"}
         width={width}
         height={height.get()}
      >
         <NotificationsListModule />
      </BarItemPopup>
   );
}
