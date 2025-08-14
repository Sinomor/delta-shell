import app from "ags/gtk4/app";
import GLib from "gi://GLib";
import { createPoll } from "ags/time";
import { onCleanup } from "ags";
import BarItem from "@/src/widgets/common/baritem";
import { hide_all_windows, windows_names } from "@/windows";
import { toggleWindow } from "@/src/lib/utils";
import { config } from "@/options";
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
      >
         <label label={time((t) => t)} />
      </BarItem>
   );
}
