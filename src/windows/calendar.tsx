import { windows_names } from "@/windows";
import { CalendarModule } from "../modules/calendar/calendar";
import { BarItemPopup } from "../widgets/baritempopup";

export function CalendarWindow() {
   return (
      <BarItemPopup
         name={windows_names.calendar}
         module={"clock"}
         width={360}
      >
         <CalendarModule />
      </BarItemPopup>
   );
}
