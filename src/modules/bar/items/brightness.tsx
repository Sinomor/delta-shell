import BarItem from "@/src/widgets/baritem";
import { Gtk } from "ags/gtk4";
import { windows_names } from "@/windows";
import { isVertical } from "../bar";
import { config, theme } from "@/options";
import { createBinding } from "gnim";
import Brightness from "@/src/services/brightness";
import { icons } from "@/src/lib/icons";
const brightness = Brightness.get_default();

export function ScreenBrightness() {
   if (!brightness.available) {
      console.warn(
         "Bar: brightness module skipped: brightness service unavailable",
      );
      return <box visible={false} />;
   }
   const conf = config.bar.modules.brightness;
   const level = createBinding(brightness, "screen");

   return (
      <BarItem
         onPrimaryClick={conf["on-click"]}
         onSecondaryClick={conf["on-click-right"]}
         onMiddleClick={conf["on-click-middle"]}
         onScrollUp={conf["on-scroll-up"]}
         onScrollDown={conf["on-scroll-down"]}
         data={{
            icon: (
               <image
                  hexpand={isVertical}
                  iconName={icons.brightness}
                  pixelSize={theme["icon-size"].normal}
               />
            ),
            percent: (
               <label
                  hexpand={isVertical}
                  label={level((v) => Math.floor(v * 100).toString())}
               />
            ),
         }}
         format={conf.format}
      />
   );
}
