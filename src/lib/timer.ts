import { interval } from "ags/time";
import GLib from "gi://GLib";

type TimerCallback = () => void;
type Unsubscribe = () => void;

export class Timer {
   private _timeLeft: number;
   private readonly _timeout: number;
   private _interval: ReturnType<typeof interval> | null = null;
   private _startTime: number = 0;
   private _isPaused: boolean = true;
   private readonly subscriptions = new Set<TimerCallback>();

   constructor(timeout: number) {
      this._timeout = timeout;
      this._timeLeft = timeout;
   }

   get timeLeft(): number {
      return this._timeLeft;
   }

   set timeLeft(value: number) {
      if (this._timeLeft === value) return;
      this._timeLeft = Math.max(0, value);
      this.notify();
   }

   get isPaused(): boolean {
      return this._isPaused;
   }

   set isPaused(value: boolean) {
      if (this._isPaused === value) return;

      this._isPaused = value;
      value ? this.pause() : this.resume();
   }

   get timeout(): number {
      return this._timeout;
   }

   get isRunning(): boolean {
      return this._interval !== null && !this._isPaused;
   }

   private notify() {
      this.subscriptions.forEach((callback) => callback());
   }

   subscribe(callback: TimerCallback): Unsubscribe {
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
      if (!this.isRunning) return;
      this._isPaused = true;
   }

   resume() {
      if (!this._interval || this._timeLeft <= 0 || !this._isPaused) return;

      this._isPaused = false;
      const elapsedBeforePause = this._timeout - this._timeLeft;
      this._startTime = GLib.get_monotonic_time() - elapsedBeforePause * 1000;
   }

   cancel() {
      this._interval?.cancel();
      this._interval = null;
      this._isPaused = true;
   }

   reset() {
      this.cancel();
      this._timeLeft = this._timeout;
      this.notify();
   }

   dispose() {
      this.cancel();
      this.subscriptions.clear();
   }
}
