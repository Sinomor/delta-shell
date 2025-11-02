import BarItem from "@/src/widgets/baritem";
import { isVertical } from "../bar";
import { icons } from "@/src/lib/icons";
import SystemStats from "@/src/services/systemstats";
import { config } from "@/options";

export function RAM() {
   const systemstats = SystemStats.get_default();

   const memoryUsage = systemstats.memoryUsage.as((data) => {
      if (!data) return "";

      return Math.floor(data * 100).toString();
   });

   const memoryTotal = systemstats.memoryTotal.as((data) => {
      if (!data) return "";

      return (data / 1024 / 1024).toFixed(2).toString();
   });

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
            usage: <label label={memoryUsage} hexpand={isVertical} />,
            total: <label label={memoryTotal} hexpand={isVertical} />,
         }}
         format={config.bar.modules.ram.format.get()}
      />
   );
}
