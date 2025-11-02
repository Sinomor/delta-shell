import GObject, { register } from "ags/gobject";
import { createState } from "ags";
import { readFileAsync } from "ags/file";
import { interval } from "ags/time";

const UPDATE_INTERVAL = 2000;

@register({ GTypeName: "SystemStats" })
export default class SystemStats extends GObject.Object {
   static instance: SystemStats;

   static get_default() {
      if (!this.instance) this.instance = new SystemStats();
      return this.instance;
   }

   #interval: ReturnType<typeof interval> | null = null;
   #cpuUsage = createState(0);
   #memoryAvailable = createState(0);
   #memoryTotal = createState(0);
   #memoryUsage = createState(0);

   private lastCpuInfo: { idle: number; total: number } | null = null;

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

   get cpuUsage() {
      return this.#cpuUsage[0];
   }

   get memoryAvailable() {
      return this.#memoryAvailable[0];
   }

   get memoryTotal() {
      return this.#memoryTotal[0];
   }

   get memoryUsage() {
      return this.#memoryUsage[0];
   }

   private async recalculateCpuUsage() {
      try {
         const statFile = await readFileAsync("/proc/stat");

         const newlineIdx = statFile.indexOf("\n");
         if (newlineIdx === -1 || !statFile.startsWith("cpu ")) {
            console.error("couldn't parse /proc/stat");
            return;
         }

         const cpuLine = statFile.substring(4, newlineIdx).trim();
         const parts = cpuLine.split(" ");

         let total = 0;
         const stats: number[] = [];

         for (const part of parts) {
            const val = parseInt(part, 10);
            stats.push(val);
            total += val;
         }

         const idle = stats[3] + stats[4];

         if (this.lastCpuInfo !== null) {
            const deltaIdle = idle - this.lastCpuInfo.idle;
            const deltaTotal = total - this.lastCpuInfo.total;

            if (deltaTotal > 0) {
               this.#cpuUsage[1](1 - deltaIdle / deltaTotal);
            }
         }

         this.lastCpuInfo = { idle, total };
      } catch (error) {
         console.error("Error calculating CPU usage:", error);
      }
   }

   private async recalculateMemoryUsage() {
      try {
         const meminfo = await readFileAsync("/proc/meminfo");
         const lines = meminfo.split("\n");

         let total: number | undefined;
         let available: number | undefined;

         for (const line of lines) {
            if (!line) continue;
            if (total !== undefined && available !== undefined) break;

            const colonIdx = line.indexOf(":");
            if (colonIdx === -1) continue;

            const label = line.substring(0, colonIdx);

            if (label !== "MemTotal" && label !== "MemAvailable") {
               continue;
            }

            const rest = line.substring(colonIdx + 1).trim();
            const spaceIdx = rest.indexOf(" ");

            if (spaceIdx === -1) continue;

            const numStr = rest.substring(0, spaceIdx);
            const amount = parseInt(numStr, 10);

            if (isNaN(amount)) continue;

            if (label === "MemTotal") {
               total = amount;
            } else if (label === "MemAvailable") {
               available = amount;
            }
         }

         if (total === undefined || available === undefined) {
            console.error("couldn't parse /proc/meminfo");
            return;
         }

         this.#memoryAvailable[1](available);
         this.#memoryTotal[1](total);

         if (total > 0) {
            this.#memoryUsage[1](1 - available / total);
         }
      } catch (error) {
         console.error("Error calculating memory usage:", error);
      }
   }

   private async update() {
      await Promise.all([
         this.recalculateCpuUsage(),
         this.recalculateMemoryUsage(),
      ]);
   }
}
