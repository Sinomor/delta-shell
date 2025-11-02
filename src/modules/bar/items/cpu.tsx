import BarItem from "@/src/widgets/baritem";
import { isVertical } from "../bar";
import { icons } from "@/src/lib/icons";
import SystemStats from "@/src/services/systemstats";
import { config } from "@/options";

export function CPU() {
   const systemstats = SystemStats.get_default();
   const cpuUsage = systemstats.cpuUsage.as((data) => {
      if (!data) return "";

      return Math.floor(data * 100).toString();
   });

   return (
      <BarItem
         data={{
            icon: (
               <image
                  iconName={icons.cpu}
                  pixelSize={20}
                  hexpand={isVertical}
               />
            ),
            usage: <label label={cpuUsage} hexpand={isVertical} />,
         }}
         format={config.bar.modules.cpu.format.get()}
         visible={cpuUsage.as((d) => d !== "")}
      />
   );
}
