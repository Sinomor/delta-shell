import BarItem from "@/src/widgets/baritem";
import { isVertical } from "../bar";
import { icons } from "@/src/lib/icons";
import SystemStats from "@/src/services/systemstats";
import { config } from "@/options";
import { createBinding, With } from "gnim";

export function CPU() {
   const systemstats = SystemStats.get_default();
   const cpuUsage = createBinding(systemstats, "cpuUsage");

   return (
      <With value={cpuUsage}>
         {(usage) =>
            usage !== -1 ? (
               <BarItem
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
                           label={cpuUsage((v) =>
                              Math.floor(v * 100).toString(),
                           )}
                           hexpand={isVertical}
                        />
                     ),
                  }}
                  format={config.bar.modules.cpu.format}
               />
            ) : (
               <box visible={false} />
            )
         }
      </With>
   );
}
