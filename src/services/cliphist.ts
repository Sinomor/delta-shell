import GObject, { register, getter } from "ags/gobject";
import { bash, dependencies, ensureDirectory } from "@/src/lib/utils";
import { createState } from "ags";
import { config } from "@/options";
import { monitorFile } from "ags/file";
import GLib from "gi://GLib?version=2.0";
import { execAsync, subprocess } from "ags/process";
import Gio from "gi://Gio?version=2.0";
import { timeout } from "ags/time";

const cacheDir = GLib.get_user_cache_dir();

@register({ GTypeName: "Cliphist" })
export default class Cliphist extends GObject.Object {
   static instance: Cliphist;

   static get_default() {
      if (!this.instance) this.instance = new Cliphist();
      return this.instance;
   }

   #list = createState<string[]>([]);
   #updatePending = false;

   constructor() {
      super();
      if (config.clipboard.enabled) this.start();
   }

   async start() {
      if (!dependencies("wl-paste", "cliphist")) return;

      try {
         await this.stop();

         const maxItems = config.clipboard["max-items"];
         bash(`wl-paste --watch cliphist -max-items ${maxItems} store`);
         monitorFile(`${cacheDir}/cliphist/db`, () => this.scheduleUpdate());
      } catch (error) {
         console.error("Failed to start clipboard monitoring:", error);
      }
   }

   private scheduleUpdate() {
      if (this.#updatePending) return;

      this.#updatePending = true;
      timeout(500, () => {
         this.#updatePending = false;
         this.update();
      });
   }

   async stop() {
      subprocess(`pkill -f "wl-paste.*cliphist"`);
      bash(`rm -f ${cacheDir}/delta-shell/cliphist/*`);
   }

   async update() {
      if (!dependencies("cliphist")) return;

      try {
         const output = await execAsync(["cliphist", "list"]);

         if (!output.trim()) {
            this.#list[1]([]);
            return;
         }

         // Простой и понятный код
         this.#list[1](output.split("\n").filter((line) => line.trim()));
      } catch (error) {
         console.error("Failed to update clipboard history:", error);
         this.#list[1]([]);
      }
   }

   async load_image(id: string) {
      if (!dependencies("cliphist")) return;
      const imagePath = `${cacheDir}/delta-shell/cliphist/${id}.png`;

      try {
         ensureDirectory(`${cacheDir}/delta-shell/cliphist`);
         await bash(`cliphist decode ${id} > ${imagePath}`);
         return imagePath;
      } catch (error) {
         console.error("Failed to load image preview:", error);
      }
   }

   async copy(id: string) {
      if (!dependencies("cliphist")) return;
      try {
         // Funny workaround for wl-copy acting weird with a single character being piped to it
         // Use wl-copy directly if the decoded content is only one character, otherwise
         // we may pipe to it as usual
         let bytes = await bash(`cliphist decode ${id} | xxd -p -c 256`);
         let bytes_to_text = `echo -n "${bytes}" | xxd -r -p`;

         if (bytes.trim().length <= 2) {
            return await bash(`wl-copy $(${bytes_to_text})`);
         }
         
         return await bash(`${bytes_to_text} | wl-copy`);
      } catch (error) {
         console.error("Failed to copy item:", error);
      }
   }

   async clear() {
      if (!dependencies("cliphist")) return;

      try {
         await bash("cliphist wipe");
         await this.update();
      } catch (error) {
         console.error("Failed to clear clipboard history:", error);
      }
   }

   get list() {
      return this.#list[0];
   }
}
