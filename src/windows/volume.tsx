import { windows_names } from "@/windows";
import { BarItemPopup } from "../widgets/baritempopup";
import { VolumeModule } from "../modules/volume/volume";

export function VolumeWindow() {
   return (
      <BarItemPopup name={windows_names.volume} module={"volume"}>
         <VolumeModule />
      </BarItemPopup>
   );
}
