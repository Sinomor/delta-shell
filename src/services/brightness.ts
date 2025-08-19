import { exec } from "ags/process";
import GObject, { register, getter, setter } from "ags/gobject";
import { monitorFile, readFileAsync } from "ags/file";
import { bash, dependencies } from "@/src/lib/utils";

let screen = "";
try {
   screen = exec(`bash -c "ls -w1 /sys/class/backlight | head -1"`).trim();
} catch (error) {
   console.warn("No backlight devices found");
}

const available = dependencies("brightnessctl") && screen !== "";

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

      bash(`brightnessctl set ${Math.floor(percent * 100)}% -q`).then(() => {
         this.#screen = percent;
         this.notify("screen");
      });
   }

   constructor() {
      super();

      if (this.#available) {
         monitorFile(`/sys/class/backlight/${screen}/brightness`, async (f) => {
            const v = await readFileAsync(f);
            this.#screen = Number(v) / this.#screenMax;
            this.notify("screen");
         });
      }
   }
}
