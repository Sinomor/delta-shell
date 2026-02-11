import Gtk from "gi://Gtk";
import { NetworkPage } from "./pages/network";
import { MainPage } from "./pages/main";
import { BluetoothPage } from "./pages/bluetooth";
import { PowerPage } from "./pages/power";
import { VolumePage } from "./pages/volume";
import { createEffect, createState, onCleanup } from "ags";
import { windows_names } from "@/windows";
import { config } from "@/options";
import AstalNetwork from "gi://AstalNetwork?version=0.1";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
import { WeatherPage } from "./pages/weather";
import { NotificationsListPage } from "./pages/notificationslist";
export const [qs_page, qs_page_set] = createState("main");

export function QuickSettingsModule() {
   console.log("QuickSettings: initializing module");
   const network = AstalNetwork.get_default();
   const bluetooth = AstalBluetooth.get_default();

   return (
      <stack
         transitionDuration={config.transition * 1000}
         class={"stack"}
         vhomogeneous={false}
         hhomogeneous={false}
         interpolate_size={true}
         transitionType={Gtk.StackTransitionType.CROSSFADE}
         $={(self) => {
            createEffect(() => {
               const page = qs_page();
               console.log(`QuickSettings: switching to page ${page}`);
               self.set_visible_child_name(page);
            });
         }}
      >
         <MainPage />
         {network.wifi !== null && <NetworkPage />}
         {bluetooth.adapter !== null && <BluetoothPage />}
         <PowerPage />
         <VolumePage />
         {config.weather.enabled && <WeatherPage />}
         {config.notifications.enabled && <NotificationsListPage />}
      </stack>
   );
}
