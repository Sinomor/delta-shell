import { Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { exec, execAsync } from "ags/process";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";

export const cacheDir = `${GLib.get_user_cache_dir()}/epik-shell`;

/**
 * @returns true if all of the `bins` are found
 */
export function dependencies(...bins: string[]) {
   const missing = bins.filter((bin) => {
      try {
         exec(["which", bin]);
         return false;
      } catch {
         return true;
      }
   });

   if (missing.length > 0) {
      console.warn(`Missing dependencies: ${missing.join(", ")}`);
   }

   return missing.length === 0;
}

export function range(max: number) {
   return Array.from({ length: max + 1 }, (_, i) => i);
}

export function ensureDirectory(path: string) {
   if (!GLib.file_test(path, GLib.FileTest.IS_DIR)) {
      GLib.mkdir_with_parents(path, 0o755);
   }
}

/**
 * @returns execAsync(["bash", "-c", cmd])
 */
export async function bash(
   strings: TemplateStringsArray | string,
   ...values: unknown[]
) {
   const cmd =
      typeof strings === "string"
         ? strings
         : strings.flatMap((str, i) => str + `${values[i] ?? ""}`).join("");

   return execAsync(["bash", "-c", cmd]).catch((err) => {
      console.error(cmd, err);
      return "";
   });
}

type NotifUrgency = "low" | "normal" | "critical";

export function notifySend({
   appName,
   appIcon,
   urgency = "normal",
   image,
   icon,
   summary,
   body,
   actions,
}: {
   appName?: string;
   appIcon?: string;
   urgency?: NotifUrgency;
   image?: string;
   icon?: string;
   summary: string;
   body: string;
   actions?: {
      [label: string]: () => void;
   };
}) {
   const actionsArray = Object.entries(actions || {}).map(
      ([label, callback], i) => ({
         id: `${i}`,
         label,
         callback,
      }),
   );
   bash(
      [
         "notify-send",
         `-u ${urgency}`,
         appIcon && `-i ${appIcon}`,
         `-h "string:image-path:${!!icon ? icon : image}"`,
         `"${summary ?? ""}"`,
         `"${body ?? ""}"`,
         `-a "${appName ?? ""}"`,
         ...actionsArray.map((v) => `--action=\"${v.id}=${v.label}\"`),
      ].join(" "),
   )
      .then((out) => {
         if (!isNaN(Number(out.trim())) && out.trim() !== "") {
            actionsArray[parseInt(out)].callback();
         }
      })
      .catch(console.error);
}

export const now = () =>
   GLib.DateTime.new_now_local().format("%Y-%m-%d_%H-%M-%S");

export const isImage = (filename: string): boolean => {
   if (GLib.file_test(filename, GLib.FileTest.EXISTS)) {
      const imgExt = [".png", ".jpg", ".jpeg", ".svg"];
      const filenameLower = filename.toLowerCase();
      for (const ext of imgExt) {
         if (filenameLower.endsWith(ext)) {
            return true;
         }
      }
   }
   return false;
};

export function isIcon(icon?: string | null) {
   const iconTheme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default()!);
   return icon && iconTheme.has_icon(icon);
}

export const convertHexToRGBA = (hexCode: string, opacity = 1) => {
   let hex = hexCode.replace("#", "");

   if (hex.length === 3) {
      hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
   }

   const r = parseInt(hex.substring(0, 2), 16);
   const g = parseInt(hex.substring(2, 4), 16);
   const b = parseInt(hex.substring(4, 6), 16);

   if (opacity > 1 && opacity <= 100) {
      opacity = opacity / 100;
   }

   return `rgba(${r},${g},${b},${opacity})`;
};

export function fileExists(path: string) {
   return GLib.file_test(path, GLib.FileTest.EXISTS);
}

export function toggleWindow(name: string) {
   const win = app.get_window(name)!;
   if (win.visible) {
      win.hide();
   } else {
      win.show();
   }
}

/**
 * Раскрывает значения для CSS-свойств по направлениям
 * @param value Число или массив чисел
 * @returns Объект с направлениями {top, right, bottom, left}
 */
function expandDirectionValues(value: number | number[]): {
   top: number;
   right: number;
   bottom: number;
   left: number;
} {
   // Преобразуем в массив если нужно
   const values = Array.isArray(value) ? value : [value];

   // Обработка всех вариантов длины массива
   switch (values.length) {
      case 1: // Все стороны одинаковые: [10] → 10,10,10,10
         return {
            top: values[0],
            right: values[0],
            bottom: values[0],
            left: values[0],
         };
      case 2: // Вертикальные/горизонтальные: [10,20] → 10,20,10,20
         return {
            top: values[0],
            right: values[1],
            bottom: values[0],
            left: values[1],
         };
      case 3: // Верх/Горизонтальные/Низ: [10,20,30] → 10,20,30,20
         return {
            top: values[0],
            right: values[1],
            bottom: values[2],
            left: values[1],
         };
      default: // Все стороны разные: [10,20,30,40] → 10,20,30,40
         return {
            top: values[0],
            right: values[1],
            bottom: values[2],
            left: values[3],
         };
   }
}

export function toCssValue(
   value: number | number[],
   options: {
      unit?: string; // Единица измерения (по умолчанию 'px')
      separator?: string; // Разделитель (по умолчанию ' ')
      allowEmpty?: boolean; // Разрешить пустую строку при нулевых значениях
   } = {},
): string {
   const { unit = "px", separator = " ", allowEmpty = false } = options;

   const format = (num: number): string => {
      if (num === 0 && allowEmpty) return "";
      return `${num}${unit}`;
   };

   if (typeof value === "number") {
      return format(value);
   }

   if (Array.isArray(value)) {
      const values = value.map(format).filter((v) => v !== "");
      return values.join(separator);
   }

   throw new Error("Invalid value type. Expected number or number[]");
}

export function ensureFileWithDefaults(
   filePath: string,
   defaultContent: string,
) {
   ensureDirectory(filePath.split("/").slice(0, -1).join("/"));

   if (!GLib.file_test(filePath, GLib.FileTest.EXISTS)) {
      const success = GLib.file_set_contents(filePath, defaultContent);
      return success;
   }
   return true;
}
