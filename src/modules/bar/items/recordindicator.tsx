import { config } from "@/options";
import ScreenRecord from "@/src/services/screenrecord";
import BarItem from "@/src/widgets/baritem";
import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import { isVertical } from "../bar";
import { icons } from "@/src/lib/icons";

export function RecordIndicator() {
   const conf = config.bar.modules.recordindicator;
   const screenRecord = ScreenRecord.get_default();
   const timer = createBinding(screenRecord, "timer");

   return (
      <BarItem
         visible={createBinding(screenRecord, "recording")}
         onPrimaryClick={conf["on-click"]}
         onSecondaryClick={conf["on-click-right"]}
         onMiddleClick={conf["on-click-middle"]}
         data={{
            icon: (
               <image
                  hexpand={isVertical}
                  class={"record-indicator"}
                  iconName={icons.video}
                  pixelSize={20}
               />
            ),
            progress: (
               <label
                  hexpand={isVertical}
                  label={timer((time) => {
                     const sec = time % 60;
                     const min = Math.floor(time / 60);
                     return `${min}:${sec < 10 ? "0" + sec : sec}`;
                  })}
               />
            ),
         }}
         format={conf.format}
      />
   );
}
