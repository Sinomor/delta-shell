import GLib from "gi://GLib";
import { createPoll } from "ags/time";
import { With } from "ags";
import { windows_names } from "@/windows";
import { config } from "@/options";
import BarItem from "@/src/widgets/baritem";
import { isVertical, orientation } from "../bar";
const { format } = config.bar.modules.clock;

export function Clock() {
   const time = createPoll(
      "",
      1000,
      () => GLib.DateTime.new_now_local().format(format)!,
   );

   return (
      <BarItem
         window={windows_names.calendar}
         onPrimaryClick={config.bar.modules.clock["on-click"]}
         onSecondaryClick={config.bar.modules.clock["on-click-right"]}
         onMiddleClick={config.bar.modules.clock["on-click-middle"]}
      >
         {isVertical ? (
            <With value={time}>
               {(time) => (
                  <box orientation={orientation}>
                     {time.split(" ").map((part) => (
                        <label hexpand label={part} />
                     ))}
                  </box>
               )}
            </With>
         ) : (
            <label label={time} />
         )}
      </BarItem>
   );
}
