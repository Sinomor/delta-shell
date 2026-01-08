import { config, theme } from "@/options";
import BarItem from "@/src/widgets/baritem";
import { createState, onCleanup } from "ags";
import { icons } from "@/src/lib/icons";
import { isVertical } from "../bar";
import { compositor } from "@/src/lib/compositor";

export function Keyboard() {
   if (!compositor.isHyprland() && !compositor.isNiri()) {
      console.warn(
         `Bar: keyboard module skipped: ${compositor.name} is not supported`,
      );
      return <box visible={false} />;
   }

   const conf = config.bar.modules.keyboard;
   const [layout, setLayout] = createState({ full: "Unknown", short: "?" });

   compositor.keyboard.getLayout().then(setLayout);
   const unsub = compositor.keyboard.onLayoutChange(() => {
      compositor.keyboard.getLayout().then(setLayout);
   });

   onCleanup(unsub);

   return (
      <BarItem
         onPrimaryClick={conf["on-click"]}
         onSecondaryClick={conf["on-click-right"]}
         onMiddleClick={conf["on-click-middle"]}
         data={{
            lang: <label hexpand={isVertical} label={layout((l) => l.short)} />,
            icon: (
               <image
                  hexpand={isVertical}
                  iconName={icons.keyboard}
                  pixelSize={theme["icon-size"].normal}
               />
            ),
         }}
         format={conf.format}
      />
   );
}
