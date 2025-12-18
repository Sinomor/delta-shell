import { readFile } from "ags/file";
import GLib from "gi://GLib?version=2.0";

function ensureFile(path: string, content: string): void {
   const dir = path.split("/").slice(0, -1).join("/");
   if (!GLib.file_test(dir, GLib.FileTest.IS_DIR)) {
      GLib.mkdir_with_parents(dir, 0o755);
   }
   if (!GLib.file_test(path, GLib.FileTest.EXISTS)) {
      GLib.file_set_contents(path, content);
   }
}

function deepMerge<T>(target: T, source: Partial<T>): T {
   if (typeof target !== "object" || target === null) {
      return source as T;
   }
   if (typeof source !== "object" || source === null) {
      return target;
   }

   const result: any = Array.isArray(target) ? [...target] : { ...target };

   for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
         const sourceValue = source[key];
         const targetValue = result[key];

         if (Array.isArray(sourceValue)) {
            result[key] = [...sourceValue];
         } else if (
            typeof sourceValue === "object" &&
            sourceValue !== null &&
            !Array.isArray(sourceValue)
         ) {
            result[key] = deepMerge(targetValue || {}, sourceValue);
         } else {
            result[key] = sourceValue;
         }
      }
   }

   return result;
}

export function mkOptions<T extends Record<string, any>>(
   configFile: string,
   defaults: T,
): T {
   ensureFile(
      configFile,
      JSON.stringify(
         defaults,
         (_, value) => {
            if (value !== null) return value;
         },
         2,
      ),
   );

   if (!GLib.file_test(configFile, GLib.FileTest.EXISTS)) {
      return defaults;
   }

   try {
      const content = readFile(configFile);
      const loaded = JSON.parse(content);
      return deepMerge(defaults, loaded);
   } catch (err) {
      console.error(`Failed to load config from ${configFile}:`, err);
      return defaults;
   }
}
