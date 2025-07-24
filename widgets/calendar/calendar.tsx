import { getCalendarLayout } from "./layout";
import { icons } from "../../utils/icons";
import app from "ags/gtk4/app";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import Graphene from "gi://Graphene?version=1.0";
import { createState, For } from "ags";
import { hide_all_windows } from "../../windows";
import options from "@/options";
const { name, margin } = options.calendar;

type Day = {
   day: string;
   today: number;
   weekend?: number;
};

let calendarJson = getCalendarLayout(undefined, true);
let monthshift = 0;

function getDateInXMonthsTime(x: number) {
   const currentDate = new Date();
   let targetMonth = currentDate.getMonth() + x;
   let targetYear = currentDate.getFullYear();

   targetYear += Math.floor(targetMonth / 12);
   targetMonth = ((targetMonth % 12) + 12) % 12;

   let targetDate = new Date(targetYear, targetMonth, 1);

   return targetDate;
}

const weekDays = [
   { day: "M", today: 0 },
   { day: "T", today: 0 },
   { day: "W", today: 0 },
   { day: "T", today: 0 },
   { day: "F", today: 0 },
   { day: "S", today: 0, weekend: 1 },
   { day: "S", today: 0, weekend: 1 },
];

function CalendarDay({ day, today, weekend }: Day) {
   return (
      <button
         cssClasses={[
            `calendar-button`,
            today == 1
               ? "today"
               : today == -1
                 ? "other-month"
                 : weekend == 1
                   ? "weekend"
                   : "",
         ]}
         focusOnClick={false}
      >
         <box halign={Gtk.Align.CENTER}>
            <label halign={Gtk.Align.CENTER} label={String(day)} />
         </box>
      </button>
   );
}

function Calendar() {
   let calendarbox: Gtk.Box;

   function addCalendarChildren(box: Gtk.Box, calendarJson: Day[][]) {
      while (box.observe_children().get_n_items() > 0) {
         const child = box.observe_children().get_item(0) as Gtk.Widget;
         if (child) {
            box.remove(child);
            child.unparent();
         }
      }

      calendarJson.forEach((row) => {
         const rowBox = (
            <box spacing={options.theme.spacing}>
               {row.map((day: Day) => (
                  <CalendarDay day={day.day} today={day.today} />
               ))}
            </box>
         );
         box.append(rowBox);
      });
   }

   function shiftCalendarXMonths(x: number) {
      const newShift = x === 0 ? 0 : monthshift + x;
      if (newShift === monthshift) return;

      if (x === 0) monthshift = 0;
      else monthshift += x;

      const newDate =
         monthshift === 0 ? new Date() : getDateInXMonthsTime(monthshift);

      calendarJson = getCalendarLayout(newDate, monthshift === 0);
      calendarMonthYearLabel_set(
         `${monthshift === 0 ? "" : "• "}${newDate.toLocaleString("default", { month: "long" })} ${newDate.getFullYear()}`,
      );

      addCalendarChildren(calendarbox, calendarJson);
   }

   const [calendarMonthYearLabel, calendarMonthYearLabel_set] =
      createState<string>("");

   function MonthYear() {
      return (
         <button
            class={"monthyear"}
            onClicked={() => shiftCalendarXMonths(0)}
            focusOnClick={false}
            label={calendarMonthYearLabel((m) => m)}
            $={(self) => {
               self.label = `${new Date().toLocaleString("default", { month: "long" })} ${new Date().getFullYear()}`;
            }}
         />
      );
   }

   function Header() {
      return (
         <box class={"header"} spacing={options.theme.spacing}>
            <MonthYear />
            <box hexpand />
            <button
               focusOnClick={false}
               class={"monthshift"}
               onClicked={() => shiftCalendarXMonths(-1)}
            >
               <image iconName={icons.arrow.left} pixelSize={20} />
            </button>
            <button
               focusOnClick={false}
               class={"monthshift"}
               onClicked={() => shiftCalendarXMonths(1)}
            >
               <image iconName={icons.arrow.right} pixelSize={20} />
            </button>
         </box>
      );
   }

   function CalendarDays() {
      return (
         <box
            spacing={options.theme.spacing}
            class={"days"}
            orientation={Gtk.Orientation.VERTICAL}
            $={(self) => {
               calendarbox = self;
               addCalendarChildren(self, calendarJson);
            }}
         />
      );
   }

   return (
      <box
         class={"main"}
         $={(self) => {
            self.connect("map", () => {
               shiftCalendarXMonths(0);
            });
         }}
         orientation={Gtk.Orientation.VERTICAL}
         spacing={options.theme.spacing}
      >
         <Header />
         <box class={"weekdays"} spacing={options.theme.spacing}>
            {weekDays.map((day: Day) => (
               <CalendarDay
                  day={day.day}
                  today={day.today}
                  weekend={day.weekend}
               />
            ))}
         </box>
         <CalendarDays />
      </box>
   );
}

export default function (gdkmonitor: Gdk.Monitor) {
   const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;
   let win: Astal.Window;
   let contentbox: Gtk.Box;

   function onKey(
      _e: Gtk.EventControllerKey,
      keyval: number,
      _: number,
      mod: number,
   ) {
      if (keyval === Gdk.KEY_Escape) {
         hide_all_windows();
      }
   }

   function onClick(_e: Gtk.GestureClick, _: number, x: number, y: number) {
      const [, rect] = contentbox.compute_bounds(win);
      const position = new Graphene.Point({ x, y });

      if (!rect.contains_point(position)) {
         hide_all_windows();
      }
   }

   return (
      <window
         $={(ref) => (win = ref)}
         class={name}
         name={name}
         namespace={name}
         gdkmonitor={gdkmonitor}
         exclusivity={Astal.Exclusivity.NORMAL}
         anchor={TOP | BOTTOM | LEFT | RIGHT}
         keymode={Astal.Keymode.ON_DEMAND}
         layer={Astal.Layer.TOP}
         application={app}
         visible={false}
         onNotifyVisible={({ visible }) => {
            if (visible) contentbox.grab_focus();
         }}
      >
         <Gtk.EventControllerKey onKeyPressed={onKey} />
         <Gtk.GestureClick onPressed={onClick} />
         <box
            $={(ref) => (contentbox = ref)}
            focusable
            halign={Gtk.Align.CENTER}
            valign={
               options.bar.position.get() === "top"
                  ? Gtk.Align.START
                  : Gtk.Align.END
            }
            marginTop={margin}
            marginBottom={margin}
            orientation={Gtk.Orientation.VERTICAL}
         >
            <Calendar />
         </box>
      </window>
   );
}
