import { icons } from "@/src/lib/icons";
import { Gtk } from "ags/gtk4";
import { createBinding, For } from "ags";
import { theme } from "@/options";
import Calendar, { CalendarDay } from "@/src/services/calendar";
const calendar = Calendar.get_default();

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
   const label = createBinding(calendar, "date").as((date: Date) => {
      const month = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();

      const today = new Date();
      const isCurrentMonth =
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();

      return `${isCurrentMonth ? "" : "• "}${month} ${year}`;
   });

   return (
      <box class={"header"} spacing={theme.spacing}>
         <button
            class={"monthyear"}
            onClicked={() => calendar.reset()}
            focusOnClick={false}
            label={label}
         />
         <box hexpand />
         <button
            focusOnClick={false}
            class={"monthshift"}
            onClicked={() => calendar.shiftMonth(-1)}
         >
            <image iconName={icons.arrow.left} pixelSize={20} />
         </button>
         <button
            focusOnClick={false}
            class={"monthshift"}
            onClicked={() => calendar.shiftMonth(1)}
         >
            <image iconName={icons.arrow.right} pixelSize={20} />
         </button>
      </box>
   );
}

export function CalendarModule() {
   const weeks = createBinding(calendar, "calendar");

   return (
      <box
         $={(self) => {
            self.connect("map", () => calendar.reset());
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
            <For each={weeks}>
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
