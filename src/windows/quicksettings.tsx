import { windows_names } from "@/windows";
import { QuickSettingsModule } from "../modules/quicksettings/quicksettings";
import { BarItemPopup } from "../widgets/baritempopup";

export function QuickSettingsWindow() {
   return (
      <BarItemPopup
         name={windows_names.quicksettings}
         module={"sysbox"}
         width={440}
      >
         <QuickSettingsModule />
      </BarItemPopup>
   );
}
