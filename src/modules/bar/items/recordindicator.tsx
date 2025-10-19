import { theme } from "@/options";
import ScreenRecord from "@/src/services/screenrecord";
import BarItem from "@/src/widgets/baritem";
import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import { isVertical } from "../bar";
const screenRecord = ScreenRecord.get_default();

export function RecordIndicator() {
   return (
      <BarItem
         visible={createBinding(screenRecord, "recording")}
         onPrimaryClick={() => screenRecord.stop().catch(() => "")}
         hexpand={isVertical}
      >
         <box
            spacing={theme.bar.spacing}
            orientation={
               isVertical
                  ? Gtk.Orientation.VERTICAL
                  : Gtk.Orientation.HORIZONTAL
            }
         >
            <box
               class={"record-indicator"}
               valign={Gtk.Align.CENTER}
               halign={Gtk.Align.CENTER}
            />
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
