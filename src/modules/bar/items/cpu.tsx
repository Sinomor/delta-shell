import BarItem from "@/src/widgets/baritem";
import { isVertical } from "../bar";
import { icons } from "@/src/lib/icons";
import SystemMonitor from "@/src/services/systemmonitor";
import { config, theme } from "@/options";
import { createBinding, With } from "gnim";

export function CPU() {
   const conf = config.bar.modules.cpu;
   const systemmonitor = SystemMonitor.get_default();
   const cpuUsage = createBinding(systemmonitor, "cpuUsage");

   return (
      <BarItem
         visible={cpuUsage((u) => u !== -1)}
         data={{
            icon: (
               <image
                  iconName={icons.cpu}
                  pixelSize={theme['icon-size'].normal}
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
