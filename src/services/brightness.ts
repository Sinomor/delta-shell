import { exec } from "ags/process";
import GObject, { register, getter, setter } from "ags/gobject";
import { monitorFile, readFileAsync } from "ags/file";
import { bash, dependencies } from "@/src/lib/utils";

let internalDisplay = "";
try {
   internalDisplay = exec(
      `bash -c "ls -w1 /sys/class/backlight 2>/dev/null | head -1"`,
   ).trim();
   if (internalDisplay) {
      console.log(`Brightness: detected internal display ${internalDisplay}`);
   }
} catch (error) {
   console.debug("Brightness: no internal displays found");
}

const externalDisplays: number[] = [];
if (dependencies("ddcutil")) {
   try {
      const output = exec("sh -c 'ddcutil detect --brief 2>/dev/null'").trim();
      if (output) {
         const buses = output
            .split("\n")
            .filter((line) => line.includes("I2C bus"))
            .map((line) => {
               const match = line.match(/\/dev\/i2c-(\d+)/);
               return match ? parseInt(match[1]) : null;
            })
            .filter((bus) => bus !== null) as number[];

         if (buses.length > 0) {
            externalDisplays.push(...buses);
            console.log(
               `Brightness: detected ${buses.length} external displays on buses: ${buses.join(", ")}`,
            );
         }
      }
   } catch (error) {
      console.debug("Brightness: no external displays detected:", error);
   }
}

const hasInternal = dependencies("brightnessctl") && !!internalDisplay;
const hasExternal = externalDisplays.length > 0;
const available = hasInternal || hasExternal;

const setBrightness = async (percent: number) => {
   const value = Math.round(percent * 100);

   if (hasInternal) {
      bash(`brightnessctl set ${value}% -q`);
   }

   if (hasExternal) {
      externalDisplays.map((bus) => {
         try {
            exec(`ddcutil --bus ${bus} setvcp 10 ${value}`);
         } catch (err) {
            console.warn(
               `Failed to set brightness for display on bus ${bus}:`,
               err,
            );
         }
      });
   }
};

const get = available
   ? (args: string) => Number(exec(`brightnessctl ${args}`))
   : () => 0;

@register({ GTypeName: "Brightness" })
export default class Brightness extends GObject.Object {
   static instance: Brightness;
   static get_default() {
      if (!this.instance) this.instance = new Brightness();
      return this.instance;
   }

   #screenMax = available ? get("max") : 1;
   #screen = available ? get("get") / (get("max") || 1) : 0;
   #available = available;
   #changing = false;

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

      this.#changing = true;
      this.#screen = percent;
      this.notify("screen");

      setBrightness(percent)
         .then(() => {
            setTimeout(() => {
               this.#changing = false;
            }, 100);
         })
         .catch((err) => {
            console.error(
               `Brightness: failed to set brightness to ${Math.floor(percent * 100)}%:`,
               err,
            );
            this.#changing = false;
         });
   }

   constructor() {
      super();

      if (this.#available) {
         monitorFile(
            `/sys/class/backlight/${this.#screen}/brightness`,
            async (f) => {
               if (this.#changing) return;
               const v = await readFileAsync(f);
               this.#screen = Number(v) / this.#screenMax;
               this.notify("screen");
            },
         );
      }
   }
}
