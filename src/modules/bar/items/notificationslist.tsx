import { config } from "@/options";
import { icons } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import { windows_names } from "@/windows";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import { createBinding } from "ags";
import { isVertical } from "../bar";

export function NotificationsList() {
   if (!config.notifications.enabled) return <box visible={false} />;
   const notifd = AstalNotifd.get_default();
   const notifications = createBinding(notifd, "notifications");

   return (
      <BarItem
         window={windows_names.notificationslist}
         onPrimaryClick={config.bar.modules.notifications["on-click"]}
         onSecondaryClick={config.bar.modules.notifications["on-click-right"]}
         onMiddleClick={config.bar.modules.notifications["on-click-middle"]}
         data={{
            icon: (
               <image
                  iconName={icons.bell}
                  pixelSize={20}
                  hexpand={isVertical}
               />
            ),
            count: (
               <label
                  label={notifications((v) => v.length.toString())}
                  hexpand={isVertical}
               />
            ),
         }}
         format={config.bar.modules.notifications.format}
      />
   );
}
