import BarItem from "@/src/widgets/baritem";
import AstalWp from "gi://AstalWp";
import { icons } from "@/src/lib/icons";
import { windows_names } from "@/windows";
import { isVertical } from "../bar";
import { config } from "@/options";
import { createBinding } from "gnim";

export function Microphone() {
   const microphone = AstalWp.get_default()?.get_default_microphone();

   return (
      <BarItem
         window={windows_names.volume}
         onPrimaryClick={config.bar.modules.microphone["on-click"]}
         onSecondaryClick={config.bar.modules.microphone["on-click-right"]}
         onMiddleClick={config.bar.modules.microphone["on-click-middle"]}
         onScrollUp={config.bar.modules.microphone["on-scroll-up"]}
         onScrollDown={config.bar.modules.microphone["on-scroll-down"]}
         data={{
            icon: (
               <image
                  hexpand={isVertical}
                  iconName={icons.microphone.default}
                  pixelSize={20}
               />
            ),
            percent: (
               <label
                  hexpand={isVertical}
                  label={createBinding(microphone, "volume").as((volume) =>
                     Math.floor(volume * 100).toString(),
                  )}
               />
            ),
         }}
         format={config.bar.modules.microphone.format}
      />
   );
}
