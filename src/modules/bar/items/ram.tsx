import BarItem from "@/src/widgets/baritem";
import { isVertical } from "../bar";
import { icons } from "@/src/lib/icons";
import SystemMonitor from "@/src/services/systemmonitor";
import { config, theme } from "@/options";
import { createBinding } from "gnim";

export function RAM() {
   const conf = config.bar.modules.ram;
   const systemmonitor = SystemMonitor.get_default();
   const memoryUsage = createBinding(systemmonitor, "memoryUsage");
   const memoryTotal = createBinding(systemmonitor, "memoryTotal");

   return (
      <BarItem
         data={{
            icon: (
               <image
                  iconName={icons.memory}
                  pixelSize={theme["icon-size"].normal}
                  hexpand={isVertical}
               />
            ),
            usage: (
               <label
                  label={memoryUsage((v) => Math.floor(v * 100).toString())}
                  hexpand={isVertical}
               />
            ),
            total: (
               <label
                  label={memoryTotal((v) =>
                     (v / 1024 / 1024).toFixed(2).toString(),
                  )}
                  hexpand={isVertical}
               />
            ),
         }}
         format={conf.format}
      />
   );
}
