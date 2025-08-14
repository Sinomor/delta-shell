import { readFile, writeFile, monitorFile, readFileAsync } from "ags/file";
import { cacheDir, ensureDirectory, ensureFileWithDefaults } from "./utils";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import { Accessor } from "ags";

type GenericObject = Record<string, any>;

export class Opt<T = unknown> extends Accessor<T> {
   #subscribers = new Set<() => void>();
   #value: T;
   initial: T;
   id = "";

   constructor(initial: T) {
      super(
         () => this.#value,
         (callback) => {
            this.#subscribers.add(callback);
            return () => this.#subscribers.delete(callback);
         },
      );

      this.#value = initial;
      this.initial = initial;
   }

   set(value: T) {
      if (this.#value !== value) {
         this.#value = value;
         this.#subscribers.forEach((cb) => cb());
      }
   }
}

export const opt = <T>(initial: T): Opt<T> => new Opt(initial);

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
      return initial ? obj.initial : obj.get();
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
   save: () => void;
} {
   const defaultConfig = transformObject(object, true);

   ensureFileWithDefaults(configFile, JSON.stringify(defaultConfig, null, 2));

   let currentConfig = defaultConfig;
   if (GLib.file_test(configFile, GLib.FileTest.EXISTS)) {
      try {
         currentConfig = JSON.parse(readFile(configFile));
      } catch (e) {
         console.error("Error parsing config:", e);
      }
   }

   for (const opt of getOptions(object)) {
      const value = getNestedValue(currentConfig, opt.id);
      if (value !== undefined) {
         opt.set(value);
      } else {
         opt.set(opt.initial);
      }
   }

   const save = () => {
      const currentState = transformObject(object);
      writeFile(configFile, JSON.stringify(currentState, null, 2));
   };

   for (const opt of getOptions(object)) {
      opt.subscribe(() => save());
   }

   return Object.assign(object, {
      configFile,
      save,
      handler(deps: string[], callback: () => void) {
         for (const opt of getOptions(object)) {
            if (deps.some((i) => opt.id.startsWith(i))) opt.subscribe(callback);
         }
      },
   });
}
