import { config, theme } from "@/options";
import { icons } from "@/src/lib/icons";
import { toggleWindow } from "@/src/lib/utils";
import BarItem from "@/src/widgets/baritem";
import { hide_all_windows, windows_names } from "@/windows";
import { Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import { createBinding } from "ags";
import { isVertical } from "../bar";
const notifd = AstalNotifd.get_default();

export function Notifications() {
   if (!config.notifications.enabled.get()) return <box />;
   const data = createBinding(notifd, "notifications");

   return (
      <BarItem
         window={windows_names.notifications_list}
         onPrimaryClick={config.bar.modules.notifications["on-click"].get()}
         onSecondaryClick={config.bar.modules.notifications[
            "on-click-right"
         ].get()}
         onMiddleClick={config.bar.modules.notifications[
            "on-click-middle"
         ].get()}
         data={{
            icon: (
               <image
                  iconName={icons.bell}
                  pixelSize={20}
                  valign={Gtk.Align.CENTER}
                  hexpand={isVertical}
               />
            ),
            count: (
               <label
                  label={data.as((d) => `${d.length}`)}
                  hexpand={isVertical}
               />
            ),
         }}
         format={config.bar.modules.notifications.format.get()}
      />
   );
}
