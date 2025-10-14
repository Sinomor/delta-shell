import { windows_names } from "@/windows";
import { BarItemPopup } from "../widgets/baritempopup";
import { PowerModule } from "../modules/power/power";

export function PowerWindow() {
   return (
      <BarItemPopup name={windows_names.power} module={"battery"}>
         <box class={"main"}>
            <PowerModule />
         </box>
      </BarItemPopup>
   );
}
