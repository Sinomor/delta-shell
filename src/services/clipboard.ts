import GObject, { register, property } from "ags/gobject";
import { bash, bashRaw, dependencies, ensureDirectory } from "@/src/lib/utils";
import { config } from "@/options";
import { monitorFile } from "ags/file";
import GLib from "gi://GLib?version=2.0";
import { subprocess } from "ags/process";
import Gio from "gi://Gio?version=2.0";
import { timeout } from "ags/time";

const cacheDir = GLib.get_user_cache_dir();

@register({ GTypeName: "Clipboard" })
export default class Clipboard extends GObject.Object {
   static instance: Clipboard;

   static get_default() {
      if (!this.instance) this.instance = new Clipboard();
      return this.instance;
   }

   @property(Array)
   list: string[] = [];

   updating = false;
   fileMonitor?: Gio.FileMonitor;

   constructor() {
      super();
      if (config.clipboard.enabled) this.start();
   }

   async start() {
      if (!dependencies("wl-paste", "cliphist")) {
         console.error(
            "Clipboard: required dependencies not found (wl-paste, cliphist)",
         );
         return;
      }

      try {
         const maxItems = config.clipboard["max-items"];

         await subprocess(`pkill -f "wl-paste.*cliphist"`);
         await bash(`rm -f ${cacheDir}/delta-shell/cliphist/*`);
         bash(`wl-paste --watch cliphist -max-items ${maxItems} store`);
         this.startMonitoring();

         console.log("Clipboard: service started");
      } catch (error) {
         console.error(
            "Clipboard: failed to start clipboard monitoring:",
            error,
         );
      }
   }

   private startMonitoring() {
      if (this.fileMonitor) this.fileMonitor.cancel();

      this.fileMonitor = monitorFile(`${cacheDir}/cliphist/db`, () =>
         this.scheduleUpdate(),
      );
   }

   private scheduleUpdate() {
      if (this.updating) return;

      this.updating = true;
      timeout(500, () => {
         this.updating = false;
         this.update();
      });
   }

   async stop() {
      subprocess(`pkill -f "wl-paste.*cliphist"`);
      bash(`rm -f ${cacheDir}/delta-shell/cliphist/*`);
      console.log("Clipboard: service stopped");
   }

   async update() {
      if (!dependencies("cliphist")) {
         console.error("Clipboard: cliphist not found, cannot update history");
         return;
      }

      try {
         const list = await bash("cliphist list");

         if (!list.trim()) {
            this.list = [];
            return;
         }

         this.list = list.split("\n").filter((line) => line.trim());
      } catch (error) {
         console.error("Clipboard: failed to update clipboard history:", error);
         this.list = [];
      }
   }

   async load_image(id: string) {
      if (!dependencies("cliphist")) {
         console.error("Clipboard: cliphist not found, cannot load image");
         return;
      }
      const imagePath = `${cacheDir}/delta-shell/cliphist/${id}.png`;

      try {
         ensureDirectory(`${cacheDir}/delta-shell/cliphist`);
         await bash(`cliphist decode ${id} > ${imagePath}`);
         return imagePath;
      } catch (error) {
         console.error(
            `Clipboard: failed to load image preview for item ${id}:`,
            error,
         );
      }
   }

   async copy(id: string) {
      if (!dependencies("cliphist")) {
         console.error("Clipboard: cliphist not found, cannot copy item");
         return;
      }

      try {
         // Funny workaround for wl-copy acting weird with a single character being piped to it
         // Use wl-copy directly if the decoded content is only one character, otherwise
         // we may pipe to it as usual
         const cliphist_bytes = await bashRaw(`cliphist decode ${id}`);
         if (!cliphist_bytes) return;

         if (cliphist_bytes.length <= 1) {
            const char = String.fromCharCode(cliphist_bytes[0]);
            return await bash(`wl-copy ${char}`);
         }

         console.log(`Clipboard: copying item ${id}`);
         return await bashRaw(`wl-copy`, cliphist_bytes);
      } catch (error) {
         console.error(`Clipboard: failed to copy item ${id}:`, error);
      }
   }

   async clear() {
      if (!dependencies("cliphist")) {
         console.error("Cliphist: cliphist not found, cannot clear history");
         return;
      }

      try {
         await bash("cliphist wipe");
         this.startMonitoring();
         this.update();
      } catch (error) {
         console.error("Cliphist: failed to clear clipboard history:", error);
      }
   }
}
