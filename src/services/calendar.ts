import GObject, { register, property, getter, setter } from "ags/gobject";
import { config } from "@/options"

export type CalendarDay = {
   date: Date;
   day: number;
   isToday: boolean;
   isWeekend: boolean;
   isOtherMonth: boolean;
};

@register({ GTypeName: "Calendar" })
export default class Calendar extends GObject.Object {
   static instance: Calendar;

   static get_default() {
      if (!this.instance) this.instance = new Calendar();
      return this.instance;
   }

   private _date: Date = new Date();

   constructor() {
      super();
   }

   @getter(Object)
   get date() {
      return new Date(this._date);
   }

   @setter(Date)
   set date(d: Date) {
      if (this._date.getTime() === d.getTime()) return;
      this._date = d;
      this.notify("date");
      this.notify("month");
      this.notify("year");
      this.notify("calendar");
   }

   @getter(Number) get month() {
      return this._date.getMonth();
   }
   @getter(Number) get year() {
      return this._date.getFullYear();
   }

   dayToNumber(day: string): number  {
      switch (day.trim().toLowerCase()) {
        case 'saturday': return 6;
        case 'friday': return 5;
        case 'thursday': return 4;
        case 'wednesday': return 3;
        case 'tuesday': return 2;
        case 'monday': return 1;
        case 'sunday': return 0;
        default: throw new Error(`${day} is not a day`);
      }
    }

   weekDays(start_day_of_week: string) {
      switch (start_day_of_week.trim().toLowerCase()) {
        case "monday": return ["M","T","W","T","F","S","S"];
        case "tuesday": return ["T","W","T","F","S","S","M"];
        case "wednesday": return ["W","T","F","S","S","M","T"];
        case "thursday": return ["T","F","S","S","M","T","W"];
        case "friday": return ["F","S","S","M","T","W","T"];
        case "saturday": return ["S","S","M","T","W","T","F"];
        case "sunday": return ["S","M","T","W","T","F","S"];
        default: throw new Error(`${start_day_of_week} is not a day`);
      }
    }

   weekEndDays(days: string[]): number[] {
    return days
      .map(day => this.dayToNumber(day));
   }

   @getter(Object)
   get calendar() {
      const year = this.year;
      const month = this.month;
      const now = new Date();

      const startOfMonth = new Date(year, month, 1);
      const startDayOfWeek = (startOfMonth.getDay() - this.dayToNumber(config.calendar.start_day_of_week) + 7) % 7;

      const days: CalendarDay[] = [];

      const currentIterDate = new Date(year, month, 1 - startDayOfWeek);

      for (let i = 0; i < 42; i++) {
         const isToday =
            currentIterDate.getDate() === now.getDate() &&
            currentIterDate.getMonth() === now.getMonth() &&
            currentIterDate.getFullYear() === now.getFullYear();

         days.push({
            date: new Date(currentIterDate),
            day: currentIterDate.getDate(),
            isToday,
            isWeekend:
               this.weekEndDays(config.calendar.week_end_days).includes(currentIterDate.getDay()),
            isOtherMonth: currentIterDate.getMonth() !== month,
         });

         currentIterDate.setDate(currentIterDate.getDate() + 1);
      }

      const weeks: CalendarDay[][] = [];
      for (let i = 0; i < 6; i++) {
         weeks.push(days.slice(i * 7, (i + 1) * 7));
      }

      return weeks;
   }

   shiftMonth(delta: number) {
      this.date = new Date(this.year, this.month + delta, 1);
   }

   reset() {
      this.date = new Date();
   }
}
