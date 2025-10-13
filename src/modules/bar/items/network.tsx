import { getNetworkIconBinding } from "@/src/lib/icons";
import BarItem from "@/src/widgets/baritem";
import AstalNetwork from "gi://AstalNetwork";
import { createBinding, createComputed } from "gnim";
const network = AstalNetwork.get_default();

export function Network() {
   return (
      <BarItem>
         <image
            visible={createComputed(
               [
                  createBinding(network, "primary"),
                  ...(network.wifi !== null
                     ? [createBinding(network.wifi, "enabled")]
                     : []),
               ],
               (primary, enabled) => {
                  if (
                     primary === AstalNetwork.Primary.WIRED &&
                     network.wired.internet === AstalNetwork.Internet.CONNECTED
                  )
                     return true;
                  return enabled;
               },
            )}
            pixelSize={20}
            iconName={getNetworkIconBinding()}
         />
      </BarItem>
   );
}
