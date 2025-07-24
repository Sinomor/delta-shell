import { Variable } from "@/utils/variable";
import { readFile, writeFile, monitorFile, readFileAsync } from "ags/file";
import { cacheDir, ensureDirectory } from "./utils";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import { resetCss } from "@/services/styles";

type GenericObject = Record<string, any>;

function getNestedValue(obj: GenericObject, keyPath: string): any {
   const keys = keyPath.split(".");
   let current: GenericObject = obj;

   for (const key of keys) {
      if (current && Object.prototype.hasOwnProperty.call(current, key)) {
         current = current[key];
      } else {
         return undefined;
      }
   }

   return current;
}

function setNestedValue<T>(
   obj: GenericObject,
   keyPath: string,
   value: T,
): void {
   const keys = keyPath.split(".");
   let current: GenericObject = obj;

   for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];

      if (!current[key]) {
         current[key] = {};
      }

      current = current[key];
   }

   current[keys[keys.length - 1]] = value;
}

export class Opt<T = unknown> extends Variable<T> {
   constructor(initial: T, { cached = false }: { cached?: boolean } = {}) {
      super(initial);
      this.initial = initial;
      this.cached = cached;
   }

   initial: T;
   id = "";
   cached = false;

   init(configFile: string): void {
      const dir = this.cached
         ? `${GLib.get_user_cache_dir()}/delta-shell/options.json`
         : configFile;

      if (GLib.file_test(dir, GLib.FileTest.EXISTS)) {
         let config: GenericObject;
         try {
            config = JSON.parse(readFile(dir));
         } catch {
            config = {};
         }
         const configV = this.cached
            ? config[this.id]
            : getNestedValue(config, this.id);
         if (configV !== undefined) {
            this.set(configV);
         }
      }

      if (this.cached) {
         this.subscribe(() => {
            const value = this.get();
            readFileAsync(`${cacheDir}/options.json`)
               .then((content) => {
                  const cache = JSON.parse(content || "{}") as GenericObject;
                  cache[this.id] = value;
                  writeFile(
                     `${cacheDir}/options.json`,
                     JSON.stringify(cache, null, 2),
                  );
               })
               .catch(() => {});
         });
      }
   }
}

export const opt = <T>(initial: T, opts = {}): Opt<T> => new Opt(initial, opts);

function getOptions(object: GenericObject, path = ""): Opt[] {
   return Object.keys(object).flatMap((key) => {
      const obj = object[key];
      const id = path ? path + "." + key : key;

      if (obj instanceof Opt) {
         obj.id = id;
         return obj;
      }

      if (typeof obj === "object" && obj !== null) {
         return getOptions(obj, id);
      }

      return [];
   });
}

function transformObject(obj: any, initial?: boolean): any {
   if (obj instanceof Opt) {
      if (obj.cached) {
         return undefined;
      } else {
         return initial ? obj.initial : obj.get();
      }
   }

   if (typeof obj !== "object" || obj === null) return obj;

   const newObj: GenericObject = {};

   Object.keys(obj).forEach((key) => {
      const transformed = transformObject(obj[key], initial);
      if (transformed !== undefined) {
         newObj[key] = transformed;
      }
   });

   const length = Object.keys(newObj).length;
   return length > 0 ? newObj : undefined;
}

export function mkOptions<T extends GenericObject>(
   configFile: string,
   object: T,
): T & {
   configFile: string;
   handler: (deps: string[], callback: () => void) => void;
} {
   for (const opt of getOptions(object)) {
      opt.init(configFile);
   }

   ensureDirectory(configFile.split("/").slice(0, -1).join("/"));
   const defaultConfig = transformObject(object, true);
   const configVar = new Variable<GenericObject>(transformObject(object));

   if (GLib.file_test(configFile, GLib.FileTest.EXISTS)) {
      let configData: GenericObject;
      try {
         configData = JSON.parse(readFile(configFile) || "{}");
      } catch {
         configData = {};
      }
   }

   return Object.assign(object, {
      configFile,
      handler(deps: string[], callback: () => void) {
         for (const opt of getOptions(object)) {
            if (deps.some((i) => opt.id.startsWith(i))) opt.subscribe(callback);
         }
      },
   });
}
