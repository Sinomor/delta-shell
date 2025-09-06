import GObject, { register, getter } from "ags/gobject";
import { bash, cacheDir, dependencies, ensureDirectory } from "@/src/lib/utils";
import { createState } from "ags";
import { config } from "@/options";
import { monitorFile } from "ags/file";
import GLib from "gi://GLib?version=2.0";
import { subprocess } from "ags/process";

@register({ GTypeName: "Cliphist" })
export default class Cliphist extends GObject.Object {
   static instance: Cliphist;

   static get_default() {
      if (!this.instance) this.instance = new Cliphist();
      return this.instance;
   }

   #list = createState<string[]>([]);

   constructor() {
      super();
      this.start();
   }

   async start() {
      if (!dependencies("wl-paste", "cliphist")) return;

      try {
         await this.stop();

         const maxItems = config.launcher.clipboard.max_items.get();
         bash(`wl-paste --watch cliphist -max-items ${maxItems} store`);
         monitorFile(`${GLib.get_user_cache_dir()}/cliphist/db`, () =>
            this.update(),
         );
      } catch (error) {
         console.error("Failed to start clipboard monitoring:", error);
      }
   }

   async stop() {
      subprocess(`pkill -f "wl-paste.*cliphist"`);
      bash(`rm -f ${cacheDir}/cliphist/*.png`);
   }

   async update() {
      if (!dependencies("cliphist")) return;

      try {
         const list = await bash("cliphist list");
         this.#list[1](list.split("\n").filter((line) => line.trim()));
      } catch (error) {
         console.error("Failed to update clipboard history:", error);
      }
   }

   async load_image(id: string) {
      if (!dependencies("cliphist")) return;
      const imagePath = `${cacheDir}/cliphist/${id}.png`;

      try {
         ensureDirectory(`${cacheDir}/cliphist`);
         await bash(`cliphist decode ${id} > ${imagePath}`);
         return imagePath;
      } catch (error) {
         console.error("Failed to load image preview:", error);
      }
   }

   async copy(id: string) {
      if (!dependencies("cliphist")) return;
      try {
         return await bash(`cliphist decode ${id} | wl-copy`);
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
