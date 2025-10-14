import { windows_names } from "@/windows";
import { BarItemPopup } from "../widgets/baritempopup";
import { NetworkModule } from "../modules/network/network";

export function NetworkWindow() {
   return (
      <BarItemPopup name={windows_names.network} module={"network"}>
         <box class={"main"}>
            <NetworkModule />
         </box>
      </BarItemPopup>
   );
}
