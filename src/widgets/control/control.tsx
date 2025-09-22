import Gtk from "gi://Gtk";
import { NetworkPage } from "./pages/network";
import { MainPage } from "./pages/main";
import { BluetoothPage } from "./pages/bluetooth";
import { PowerModesPage } from "./pages/powermodes";
import { createState, onCleanup } from "ags";
import { hide_all_windows, windows_names } from "@/windows";
import { PopupWindow } from "../common/popupwindow";
import { BarItemPopup } from "../common/baritempopup";
import { config } from "@/options";
import AstalNetwork from "gi://AstalNetwork?version=0.1";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
export const [control_page, control_page_set] = createState("main");
const network = AstalNetwork.get_default();
const bluetooth = AstalBluetooth.get_default();

function Control() {
   return (
      <stack
         class={"main"}
         transitionDuration={config.transition.get() * 1000}
         widthRequest={440}
         vhomogeneous={false}
         interpolate_size={true}
         transitionType={Gtk.StackTransitionType.CROSSFADE}
         $={(self) => {
            const unsub = control_page.subscribe(() =>
               self.set_visible_child_name(control_page.get()),
            );
            onCleanup(() => unsub());
         }}
      >
         <MainPage />
         {network.wifi !== null && <NetworkPage />}
         {bluetooth.adapter !== null && <BluetoothPage />}
         <PowerModesPage />
      </stack>
   );
}

export default function () {
   return (
      <BarItemPopup name={windows_names.control} module={"sysbox"} width={440}>
         <Control />
      </BarItemPopup>
   );
}
