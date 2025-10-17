import { windows_names } from "@/windows";
import { BarItemPopup } from "../widgets/baritempopup";
import { BluetoothModule } from "../modules/bluetooth/bluetooth";

export function BluetoothWindow() {
   return (
      <BarItemPopup name={windows_names.bluetooth} module={"bluetooth"}>
         <BluetoothModule />
      </BarItemPopup>
   );
}
