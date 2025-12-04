import GObject, { register, property, getter, setter } from "ags/gobject";

export type CalendarDay = {
   date: Date;
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

   @getter(Object)
   get calendar() {
      const year = this.year;
      const month = this.month;
      const now = new Date();

      const startOfMonth = new Date(year, month, 1);
      const startDayOfWeek = (startOfMonth.getDay() + 6) % 7;

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
               currentIterDate.getDay() === 0 || currentIterDate.getDay() === 6,
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
