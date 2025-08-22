import { interval } from "ags/time";
import GLib from "gi://GLib";

export class Timer {
   private _timeLeft: number;
   private _timeout: number;
   private _interval: any = null;
   private _startTime: number = 0;
   private _isPaused: boolean = true;
   private subscriptions = new Set<() => void>();

   constructor(timeout: number) {
      this._timeout = timeout;
      this._timeLeft = timeout;
   }

   get timeLeft(): number {
      return this._timeLeft;
   }

   set timeLeft(value: number) {
      this._timeLeft = value;
      this.notify();
   }

   get isPaused(): boolean {
      return this._isPaused;
   }

   set isPaused(value: boolean) {
      if (this._isPaused === value) return;

      this._isPaused = value;
      if (value) {
         this.pause();
      } else {
         this.resume();
      }
   }

   notify() {
      for (const sub of this.subscriptions) {
         sub();
      }
   }

   subscribe(callback: () => void): () => void {
      this.subscriptions.add(callback);
      return () => this.subscriptions.delete(callback);
   }

   start() {
      this.cancel();
      this._timeLeft = this._timeout;
      this._startTime = GLib.get_monotonic_time();
      this._isPaused = false;

      this._interval = interval(100, () => {
         if (this._isPaused) return;

         const now = GLib.get_monotonic_time();
         const elapsed = (now - this._startTime) / 1000;
         this._timeLeft = Math.max(0, this._timeout - elapsed);

         this.notify();

         if (this._timeLeft <= 0) {
            this.cancel();
         }
      });
   }

   pause() {
      this._isPaused = true;
   }

   resume() {
      if (!this._interval || this._timeLeft <= 0) return;

      this._isPaused = false;
      this._startTime =
         GLib.get_monotonic_time() - (this._timeout - this._timeLeft) * 1000;
   }

   cancel() {
      if (this._interval) {
         this._interval.cancel();
         this._interval = null;
      }
      this._isPaused = true;
   }

   reset() {
      this.cancel();
      this._timeLeft = this._timeout;
      this.notify();
   }
}
