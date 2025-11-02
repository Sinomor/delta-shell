import GObject, { register } from "ags/gobject";
import { createState } from "ags";

export type CalendarDay = {
   day: number;
   isToday: boolean;
   isWeekend: boolean;
   isOtherMonth: boolean;
};

@register({ GTypeName: "CalendarService" })
export default class CalendarService extends GObject.Object {
   static instance: CalendarService;

   static get_default() {
      if (!this.instance) this.instance = new CalendarService();
      return this.instance;
   }

   #currentDate = createState(new Date());

   constructor() {
      super();
   }

   private getCalendarDays(date: Date): CalendarDay[][] {
      const year = date.getFullYear();
      const month = date.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
      const daysInMonth = lastDay.getDate();

      const prevMonthLastDay = new Date(year, month, 0).getDate();

      const today = new Date();
      const isCurrentMonth =
         today.getFullYear() === year && today.getMonth() === month;
      const todayDate = today.getDate();

      const days: CalendarDay[] = [];

      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
         const dayIndex = days.length % 7;
         days.push({
            day: prevMonthLastDay - i,
            isToday: false,
            isWeekend: dayIndex >= 5,
            isOtherMonth: true,
         });
      }

      for (let day = 1; day <= daysInMonth; day++) {
         const dayIndex = days.length % 7;
         days.push({
            day,
            isToday: isCurrentMonth && day === todayDate,
            isWeekend: dayIndex >= 5,
            isOtherMonth: false,
         });
      }

      const remainingDays = 42 - days.length;
      for (let day = 1; day <= remainingDays; day++) {
         const dayIndex = days.length % 7;
         days.push({
            day,
            isToday: false,
            isWeekend: dayIndex >= 5,
            isOtherMonth: true,
         });
      }

      const weeks: CalendarDay[][] = [];
      for (let i = 0; i < 6; i++) {
         weeks.push(days.slice(i * 7, (i + 1) * 7));
      }

      return weeks;
   }

   get date() {
      return this.#currentDate[0];
   }

   get weeks() {
      return this.#currentDate[0]((date) => this.getCalendarDays(date));
   }

   get monthYear() {
      return this.#currentDate[0]((date) => {
         const month = date.toLocaleString("default", { month: "long" });
         const year = date.getFullYear();
         const today = new Date();
         const isToday =
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

         return `${isToday ? "" : "• "}${month} ${year}`;
      });
   }

   get isCurrentMonth() {
      return this.#currentDate[0]((date) => {
         const today = new Date();
         return (
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
         );
      });
   }

   nextMonth() {
      this.#currentDate[1]((prevDate) => {
         return new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1);
      });
   }

   prevMonth() {
      this.#currentDate[1]((prevDate) => {
         return new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1);
      });
   }

   resetToToday() {
      this.#currentDate[1](new Date());
   }
}
