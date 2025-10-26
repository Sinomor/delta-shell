import app from "ags/gtk4/app";
import GLib from "gi://GLib";
import { createPoll } from "ags/time";
import { onCleanup, With } from "ags";
import { hide_all_windows, windows_names } from "@/windows";
import { toggleWindow } from "@/src/lib/utils";
import { config } from "@/options";
import BarItem from "@/src/widgets/baritem";
import { isVertical } from "../bar";
import { Gtk } from "ags/gtk4";
const { format } = config.bar.date;

export function Clock() {
   const time = createPoll(
      "",
      1000,
      () => GLib.DateTime.new_now_local().format(format.get())!,
   );

   return (
      <BarItem
         window={windows_names.calendar}
         onPrimaryClick={() => toggleWindow(windows_names.calendar)}
         hexpand={isVertical}
      >
         {isVertical ? (
            <box orientation={Gtk.Orientation.VERTICAL}>
               <With value={time}>
                  {(time) => (
                     <box
                        orientation={
                           isVertical
                              ? Gtk.Orientation.VERTICAL
                              : Gtk.Orientation.HORIZONTAL
                        }
                     >
                        {time.split(" ").map((part) => (
                           <label hexpand label={part} />
                        ))}
                     </box>
                  )}
               </With>
            </box>
         ) : (
            <label label={time} />
         )}
      </BarItem>
   );
}
