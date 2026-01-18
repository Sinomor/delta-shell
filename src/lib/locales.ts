import GLib from "gi://GLib?version=2.0";
import locales from "../locales";

const envLang = await GLib.getenv('LANG');

function resolveLang(lang: string | null): string {
   if (!lang) return "en";
   return lang.split("_")[0];
}

function get(obj: unknown, path: string): unknown {
   return path.split(".").reduce<any>((o, k) => o?.[k], obj);
}

function interpolate(
   str: string,
   params: Record<string, string | number> = {}
): string {
   return str.replace(/\{(\w+)\}/g, (_, k) =>
      params[k] !== undefined ? String(params[k]) : `{${k}}`
   );
}

function resolveValue(
   dict: unknown,
   value: string,
   params?: Record<string, string | number>,
   depth = 0
): string {
   if (depth > 5) return value;

   const refMatch = value.match(/^\{([\w.]+)\}$/);
   if (refMatch) {
      const refKey = refMatch[1];
      const refValue = get(dict, refKey);

      if (typeof refValue === "string") {
         return resolveValue(dict, refValue, params, depth + 1);
      }
   }

   return interpolate(value, params);
}

export function initLocale(lang: string | undefined): (
   key: string,
   params?: Record<string, string | number>
) => string {
   if (!lang) lang = resolveLang(envLang);
   const dict = (locales as Record<string, unknown>)[lang] ?? locales.en;

   return function t(
      key: string,
      params?: Record<string, string | number>
   ): string {
      const value = get(dict, key);

      if (typeof value === "string") {
         return resolveValue(dict, value, params);
      }

      return key;
   };
}
