import { theme } from "@/options";
import ScreenRecord from "@/src/services/screenrecord";
import BarItem from "@/src/widgets/baritem";
import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import { isVertical } from "../bar";
import { icons } from "@/src/lib/icons";
const screenRecord = ScreenRecord.get_default();

export function RecordIndicator() {
   return (
      <BarItem
         visible={createBinding(screenRecord, "recording")}
         onPrimaryClick={() => screenRecord.stop().catch(() => "")}
         hexpand={isVertical}
      >
         <image
            hexpand={isVertical}
            class={"record-indicator"}
            iconName={icons.video}
            pixelSize={20}
         />
      </BarItem>
   );
}
