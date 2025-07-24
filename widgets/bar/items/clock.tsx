import app from "ags/gtk4/app";
import GLib from "gi://GLib";
import { createPoll } from "ags/time";
import { onCleanup } from "ags";
import options from "@/options";
import BarItem from "@/widgets/common/baritem";
import { hide_all_windows } from "@/windows";
import { toggleWindow } from "@/utils/utils";
const { format } = options.bar.date;
const { name } = options.calendar;

export function Clock() {
   const time = createPoll(
      "",
      1000,
      () => GLib.DateTime.new_now_local().format(format.get())!,
   );

   return (
      <BarItem
         window={name}
         onPrimaryClick={() => {
            if (!app.get_window(name)?.visible) hide_all_windows();
            toggleWindow(name);
         }}
      >
         <label label={time((t) => t)} />
      </BarItem>
   );
}
