import app from "ags/gtk4/app";
import GLib from "gi://GLib";
import { createPoll } from "ags/time";
import { For, onCleanup } from "ags";
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
         onPrimaryClick={() => {
            if (!app.get_window(windows_names.calendar)?.visible)
               hide_all_windows();
            toggleWindow(windows_names.calendar);
         }}
         hexpand={isVertical}
      >
         {isVertical ? (
            <box orientation={Gtk.Orientation.VERTICAL}>
               <For each={time.as((t) => [...t.split(" ")])}>
                  {(part: string) => <label hexpand label={part} />}
               </For>
            </box>
         ) : (
            <label label={time} />
         )}
      </BarItem>
   );
}
