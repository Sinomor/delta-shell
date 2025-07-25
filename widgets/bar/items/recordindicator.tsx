import options from "@/options";
import ScreenRecord from "@/services/screenrecord";
import BarItem from "@/widgets/common/baritem";
import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
const screenRecord = ScreenRecord.get_default();

export function RecordIndicator() {
   return (
      <BarItem
         visible={createBinding(screenRecord, "recording")}
         onPrimaryClick={() => screenRecord.stop().catch(() => "")}
      >
         <box spacing={options.bar.spacing}>
            <box class={"record-indicator"} valign={Gtk.Align.CENTER} />
            <label
               label={createBinding(screenRecord, "timer").as((time) => {
                  const sec = time % 60;
                  const min = Math.floor(time / 60);
                  return `${min}:${sec < 10 ? "0" + sec : sec}`;
               })}
            />
         </box>
      </BarItem>
   );
}
