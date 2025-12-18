import { config, theme } from "@/options";
import { windows_names } from "@/windows";
import { BarItemPopup } from "../widgets/baritempopup";
import { NotificationsListModule } from "../modules/notifications/notificationslist";
const { height } = config.notifications.list;
const width =
   config.notifications.width +
   theme.window.padding * 2 +
   theme.window.border.width * 2;

export function NotificationsListWindow() {
   return (
      <BarItemPopup
         name={windows_names.notificationslist}
         module={"notificationslist"}
         width={width}
         height={height}
      >
         <NotificationsListModule />
      </BarItemPopup>
   );
}
