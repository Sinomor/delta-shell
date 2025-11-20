import { readFileAsync } from "ags/file";
import GObject, { register, property } from "ags/gobject";
import { interval } from "ags/time";

const UPDATE_INTERVAL = 2000;

@register({ GTypeName: "SystemInfo" })
export default class SystemInfo extends GObject.Object {
   static instance: SystemInfo;

   static get_default() {
      if (!this.instance) this.instance = new SystemInfo();
      return this.instance;
   }

   @property(Number)
   cpuUsage = 0;

   @property(Number)
   memoryUsed = 0;

   @property(Number)
   memoryTotal = 0;

   @property(Number)
   memoryUsage = 0;

   #interval: ReturnType<typeof interval> | null = null;
   #lastCpuTotal = 0;
   #lastCpuUsed = 0;

   constructor() {
      super();
      this.update();
      this.start();
   }

   start() {
      if (this.#interval) return;

      this.#interval = interval(UPDATE_INTERVAL, () => {
         this.update();
      });
   }

   stop() {
      if (this.#interval) {
         this.#interval.cancel();
         this.#interval = null;
      }
   }

   private async updateCpuUsage() {
      try {
         const GTop = (await import("gi://GTop")).default;
         const cpu = new GTop.glibtop_cpu();
         GTop.glibtop_get_cpu(cpu);

         const total = cpu.total;
         const idle = cpu.idle;
         const used = total - idle;

         if (this.#lastCpuTotal > 0) {
            const totalDiff = total - this.#lastCpuTotal;
            const usedDiff = used - this.#lastCpuUsed;

            if (totalDiff > 0) {
               this.cpuUsage = usedDiff / totalDiff;
            }
         }

         this.#lastCpuTotal = total;
         this.#lastCpuUsed = used;
      } catch (error) {
         this.cpuUsage = -1;
         console.error("Failed to get CPU usage:", error);
      }
   }

   private async updateMemoryUsage() {
      try {
         const meminfo = await readFileAsync("/proc/meminfo");

         let total: number | undefined;
         let available: number | undefined;

         for (const line of meminfo.split("\n")) {
            if (!line) continue;

            if (total && available) {
               break;
            }

            let [label, rest] = line.split(":");
            rest = rest.trim();
            console.assert(
               rest.endsWith("kB"),
               "memory stat has unexpected unit " + rest,
            );
            rest = rest.slice(0, -3);
            const amount = parseInt(rest);

            if (label == "MemTotal") {
               total = amount;
            } else if (label == "MemAvailable") {
               available = amount;
            }
         }

         if (total === undefined || available === undefined) {
            console.error("couldn't parse /proc/meminfo");
            return;
         }

         this.memoryTotal = total;

         if (total > 0) {
            this.memoryUsage = 1 - available / total;
         }
      } catch (error) {
         console.error("Error calculating memory usage:", error);
      }
   }

   private update() {
      if (this.cpuUsage !== -1) this.updateCpuUsage();
      this.updateMemoryUsage();
   }
}
