import { icons } from "@/src/lib/icons";
import { Gtk } from "ags/gtk4";
import { For } from "ags";
import { theme } from "@/options";
import CalendarService, { CalendarDay } from "@/src/services/calendar";
const calendar = CalendarService.get_default();

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function CalendarDayButton({ day }: { day: CalendarDay }) {
   const classes = ["calendar-button"];

   if (day.isToday) classes.push("today");
   else if (day.isWeekend && day.isOtherMonth)
      classes.push("other-month-weekend");
   else if (day.isOtherMonth) classes.push("other-month");
   else if (day.isWeekend) classes.push("weekend");

   return (
      <button cssClasses={classes} focusOnClick={false}>
         <box halign={Gtk.Align.CENTER}>
            <label halign={Gtk.Align.CENTER} label={String(day.day)} />
         </box>
      </button>
   );
}

function WeekDayHeader({ day, index }: { day: string; index: number }) {
   const isWeekend = index >= 5;

   return (
      <button
         cssClasses={["calendar-button", isWeekend ? "weekend" : ""]}
         focusOnClick={false}
      >
         <box halign={Gtk.Align.CENTER}>
            <label halign={Gtk.Align.CENTER} label={day} />
         </box>
      </button>
   );
}

function Header() {
   return (
      <box class={"header"} spacing={theme.spacing}>
         <button
            class={"monthyear"}
            onClicked={() => calendar.resetToToday()}
            focusOnClick={false}
            label={calendar.monthYear}
         />
         <box hexpand />
         <button
            focusOnClick={false}
            class={"monthshift"}
            onClicked={() => calendar.prevMonth()}
         >
            <image iconName={icons.arrow.left} pixelSize={20} />
         </button>
         <button
            focusOnClick={false}
            class={"monthshift"}
            onClicked={() => calendar.nextMonth()}
         >
            <image iconName={icons.arrow.right} pixelSize={20} />
         </button>
      </box>
   );
}

export function CalendarModule() {
   return (
      <box
         $={(self) => {
            self.connect("map", () => calendar.resetToToday());
         }}
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
      >
         <Header />
         <box class={"weekdays"} spacing={theme.spacing}>
            {WEEK_DAYS.map((day, index) => (
               <WeekDayHeader day={day} index={index} />
            ))}
         </box>
         <box
            spacing={theme.spacing}
            class={"days"}
            orientation={Gtk.Orientation.VERTICAL}
         >
            <For each={calendar.weeks}>
               {(week) => (
                  <box spacing={theme.spacing}>
                     {week.map((day) => (
                        <CalendarDayButton day={day} />
                     ))}
                  </box>
               )}
            </For>
         </box>
      </box>
   );
}
