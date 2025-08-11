import { interval, timeout } from "ags/time";
import AstalIO from "gi://AstalIO?version=0.1";
import GLib from "gi://GLib";

export class Timer {
   public isPaused: boolean;
   public timeout: number;
   public timeLeft: number;
   private lastTickTime: number;
   private interval: AstalIO.Time | null;
   protected subscriptions = new Set<() => void>();

   constructor(timeout: number) {
      this.isPaused = false;
      this.timeout = timeout;
      this.timeLeft = timeout;
      this.lastTickTime = GLib.get_monotonic_time();

      this.interval = interval(20, () => this.tick());
   }

   notify() {
      for (const sub of this.subscriptions) {
         sub();
      }
   }

   protected unsubscribe(callback: () => void) {
      this.subscriptions.delete(callback);

      if (
         this.subscriptions.size === 0 &&
         this.isPaused &&
         this.interval != null
      ) {
         console.warn("Timer was disconnected while paused");
         // clean it up anyway
         this.isPaused = false;
      }
   }

   subscribe(callback: () => void) {
      this.subscriptions.add(callback);

      return () => this.unsubscribe(callback);
   }

   tick() {
      const now = GLib.get_monotonic_time();

      if (this.isPaused) {
         this.lastTickTime = now;
         return;
      }

      const delta = (now - this.lastTickTime) / 1000;
      this.timeLeft -= delta;

      if (this.timeLeft <= 0) {
         this.timeLeft = 0;
         this.cancel();
      }

      this.notify();
      this.lastTickTime = now;
   }

   cancel() {
      this.interval?.cancel();
      this.interval = null;
   }
}
