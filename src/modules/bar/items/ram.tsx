import BarItem from "@/src/widgets/baritem";
import { isVertical } from "../bar";
import { icons } from "@/src/lib/icons";
import SystemStats from "@/src/services/systemstats";
import { config } from "@/options";
import { createBinding } from "gnim";

export function RAM() {
   const conf = config.bar.modules.ram;
   const systemstats = SystemStats.get_default();
   const memoryUsage = createBinding(systemstats, "memoryUsage");
   const memoryTotal = createBinding(systemstats, "memoryTotal");

   return (
      <BarItem
         data={{
            icon: (
               <image
                  iconName={icons.memory}
                  pixelSize={20}
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
