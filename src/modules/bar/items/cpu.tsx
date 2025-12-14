import BarItem from "@/src/widgets/baritem";
import { isVertical } from "../bar";
import { icons } from "@/src/lib/icons";
import SystemStats from "@/src/services/systemstats";
import { config } from "@/options";
import { createBinding, With } from "gnim";

export function CPU() {
   const conf = config.bar.modules.cpu;
   const systemstats = SystemStats.get_default();
   const cpuUsage = createBinding(systemstats, "cpuUsage");

   return (
      <BarItem
         visible={cpuUsage((u) => u !== -1)}
         data={{
            icon: (
               <image
                  iconName={icons.cpu}
                  pixelSize={20}
                  hexpand={isVertical}
               />
            ),
            usage: (
               <label
                  label={cpuUsage((v) => Math.floor(v * 100).toString())}
                  hexpand={isVertical}
               />
            ),
         }}
         format={conf.format}
      />
   );
}
