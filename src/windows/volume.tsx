import { windows_names } from "@/windows";
import { BarItemPopup } from "../widgets/baritempopup";
import { VolumeModule } from "../modules/volume/volume";
import { hasBarItem } from "../lib/utils";

export function VolumeWindow() {
   return (
      <BarItemPopup
         name={windows_names.volume}
         module={hasBarItem("volume") ? "volume" : "microphone"}
      >
         <VolumeModule />
      </BarItemPopup>
   );
}
