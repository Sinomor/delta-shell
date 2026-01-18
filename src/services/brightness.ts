import { exec, execAsync } from "ags/process";
import GObject, { register, getter, setter } from "ags/gobject";
import { monitorFile, readFileAsync } from "ags/file";
import { bash, dependencies } from "@/src/lib/utils";

let internalDisplayName = "";
try {
   internalDisplayName = exec(
      `bash -c "ls -w1 /sys/class/backlight 2>/dev/null | head -1"`,
   ).trim();
   if (internalDisplayName) {
      console.log(
         `Brightness: detected internal display ${internalDisplayName}`,
      );
   }
} catch (error) {
   console.debug("Brightness: no internal displays found");
}

const externalDisplayBuses: number[] = [];
if (dependencies("ddcutil")) {
   try {
      const output = exec("sh -c 'ddcutil detect --brief 2>/dev/null'").trim();
      if (output) {
         const blocks = output
            .split("\n\n")
            .filter((block) => block.trim() !== "");
         for (const block of blocks) {
            const lines = block.split("\n").map((line) => line.trim());
            if (lines.length === 0) continue;

            if (!lines[0].startsWith("Display ")) continue;

            const i2cLine = lines.find((line) => line.includes("I2C bus:"));
            if (!i2cLine) continue;

            const match = i2cLine.match(/\/dev\/i2c-(\d+)/);
            if (match) {
               const bus = parseInt(match[1]);
               externalDisplayBuses.push(bus);
            }
         }

         if (externalDisplayBuses.length > 0) {
            console.log(
               `Brightness: detected ${externalDisplayBuses.length} external displays on buses: ${externalDisplayBuses.join(", ")}`,
            );
         }
      }
   } catch (error) {
      console.debug("Brightness: no external displays detected:", error);
   }
}

const hasInternal = dependencies("brightnessctl") && !!internalDisplayName;
const hasExternal = externalDisplayBuses.length > 0;
const available = hasInternal || hasExternal;

const getBrightness = (): number => {
   if (hasInternal) {
      try {
         const current = parseInt(exec("brightnessctl get").trim());
         const max = parseInt(exec("brightnessctl max").trim());
         return current / (max || 1);
      } catch (error) {
         console.warn("Failed to read internal display brightness:", error);
         return 1;
      }
   }

   if (hasExternal) {
      const values = externalDisplayBuses.map((bus) =>
         getExternalBrightness(bus),
      );

      const validValues = values.filter((v) => !isNaN(v) && v >= 0 && v <= 1);
      if (validValues.length === 0) return 1;

      return validValues.reduce((a, b) => a + b, 0) / validValues.length;
   }

   return 1;
};

const getExternalBrightness = (bus: number): number => {
   try {
      const output = exec(`ddcutil --bus ${bus} getvcp 10 --terse`);
      const tokens = output.trim().split(/\s+/);

      const cIndex = tokens.indexOf("C");
      if (cIndex === -1 || cIndex + 2 >= tokens.length) {
         console.warn(`Unexpected output format for bus ${bus}: "${output}"`);
         return 1;
      }

      const current = parseInt(tokens[cIndex + 1]);
      const max = parseInt(tokens[cIndex + 2]);

      if (isNaN(current) || isNaN(max) || max === 0) {
         console.warn(
            `Invalid brightness values for bus ${bus}: current=${current}, max=${max}`,
         );
         return 1;
      }

      const value = current / max;
      return value;
   } catch (error) {
      console.warn(
         `Failed to get brightness for display on bus ${bus}:`,
         error,
      );
      return 1;
   }
};

type MonitorState = {
   id: string;
   type: "internal" | "external";
   bus?: number;
   changing: boolean;
   pendingPercent: number | null;
};

@register({ GTypeName: "Brightness" })
export default class Brightness extends GObject.Object {
   static instance: Brightness;
   static get_default() {
      if (!this.instance) this.instance = new Brightness();
      return this.instance;
   }

   #screen = available ? getBrightness() : 0;
   #available = available;
   #monitors: MonitorState[] = [];

   @getter(Number)
   get screen() {
      return this.#screen;
   }

   @getter(Boolean)
   get available() {
      return this.#available;
   }

   @setter(Number)
   set screen(percent) {
      if (!this.#available) return;
      if (percent < 0) percent = 0;
      if (percent > 1) percent = 1;

      this.#screen = percent;
      this.notify("screen");

      for (const monitor of this.#monitors) {
         if (monitor.changing) {
            monitor.pendingPercent = percent;
         } else {
            this._setMonitorBrightness(monitor, percent);
         }
      }
   }

   constructor() {
      super();

      if (hasInternal) {
         this.#monitors.push({
            id: "internal",
            type: "internal",
            changing: false,
            pendingPercent: null,
         });
      }

      for (const bus of externalDisplayBuses) {
         this.#monitors.push({
            id: `external-${bus}`,
            type: "external",
            bus,
            changing: false,
            pendingPercent: null,
         });
      }

      if (this.#available) {
         this.#screen = getBrightness();

         if (hasInternal) {
            const internalMonitor = this.#monitors.find(
               (m) => m.type === "internal",
            );
            monitorFile(
               `/sys/class/backlight/${internalDisplayName}/brightness`,
               async (f) => {
                  if (internalMonitor?.changing) return;

                  await readFileAsync(f);
                  this.#screen = getBrightness();
                  this.notify("screen");
               },
            );
         }
      }
   }

   private async _setMonitorBrightness(monitor: MonitorState, percent: number) {
      monitor.changing = true;
      monitor.pendingPercent = null;

      try {
         if (monitor.type === "internal") {
            await this._setInternalBrightness(percent);
         } else if (monitor.type === "external" && monitor.bus !== undefined) {
            await this._setExternalBrightness(monitor.bus, percent);
         }
      } catch (err) {
         console.error(
            `Brightness: failed to set ${monitor.id} to ${Math.floor(percent * 100)}%:`,
            err,
         );
      } finally {
         monitor.changing = false;

         if (monitor.pendingPercent !== null) {
            const pending = monitor.pendingPercent;
            this._setMonitorBrightness(monitor, pending);
         }
      }
   }

   private async _setInternalBrightness(percent: number): Promise<void> {
      const value = Math.round(percent * 100);
      await bash(`brightnessctl set ${value}% -q`);
   }

   private async _setExternalBrightness(
      bus: number,
      percent: number,
   ): Promise<void> {
      const value = Math.round(percent * 100);
      await execAsync(`ddcutil --bus ${bus} setvcp 10 ${value}`);
   }
}
