import { hide_all_windows, windows_names } from "@/windows";
import { Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { exec, execAsync } from "ags/process";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import { qs_page_set } from "../modules/quicksettings/quicksettings";
import { createComputed } from "gnim";
import { config } from "@/options";
import AstalApps from "gi://AstalApps?version=0.1";

export const cacheDir = `${GLib.get_user_cache_dir()}/delta-shell`;

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

export function toCssValue(
   value: number | number[],
   options: {
      unit?: string;
      separator?: string;
      allowEmpty?: boolean;
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

// https://github.com/JohnOberhauser/OkPanel/blob/main/ags/widget/utils/scroll.ts

type ScrollHandler = (info: {
   dx: number;
   dy: number;
   hovered: boolean;
   shift: boolean;
}) => void;

export function attachHoverScroll(box: Gtk.Box, onScroll: ScrollHandler) {
   // Track hover state
   let hovered = false;
   const motion = new Gtk.EventControllerMotion();
   motion.connect("enter", () => (hovered = true));
   motion.connect("leave", () => (hovered = false));
   box.add_controller(motion);

   // Handle mouse wheel scrolling
   // DISCRETE gives +/-1 steps for wheel; add SMOOTH if you want touchpads too
   const scrollCtrl = new Gtk.EventControllerScroll({
      flags:
         Gtk.EventControllerScrollFlags.VERTICAL |
         Gtk.EventControllerScrollFlags.DISCRETE, // add SMOOTH if desired
   });

   scrollCtrl.connect("scroll", (_ctrl, dx, dy) => {
      if (!hovered) return Gdk.EVENT_PROPAGATE;

      // Optional: check modifiers (e.g., Shift to change behavior)
      const state = _ctrl.get_current_event_state?.() ?? 0;
      const shift = (state & Gdk.ModifierType.SHIFT_MASK) !== 0;

      // Your action: dy < 0 is scroll up, dy > 0 is scroll down
      onScroll({ dx, dy, hovered, shift });

      // Stop propagation so parent scrolled windows don't consume it
      return Gdk.EVENT_STOP;
   });

   // Bubble phase usually works best so children get first crack at events
   scrollCtrl.set_propagation_phase(Gtk.PropagationPhase.BUBBLE);
   box.add_controller(scrollCtrl);
}

export function hasBarItem(module: string) {
   return createComputed(
      [
         config.bar.modules.start,
         config.bar.modules.center,
         config.bar.modules.end,
      ],
      (start: string[], center: string[], end: string[]) => {
         return (
            start.includes(module) ||
            center.includes(module) ||
            end.includes(module)
         );
      },
   ).get();
}

export function toggleQsModule(name: string) {
   if (hasBarItem(name)) {
      const windowName = windows_names[name as keyof typeof windows_names];
      if (!app.get_window(windowName)?.visible) {
         hide_all_windows();
      }
      toggleWindow(windowName);
   } else {
      if (!app.get_window(windows_names.quicksettings)?.visible) {
         hide_all_windows();
      }
      qs_page_set(name);
      toggleWindow(windows_names.quicksettings);
   }
}

const appInfoCache = new Map<string, any>();
const MAX_CACHE_SIZE = 50;

let appManager: AstalApps.Apps | null = null;
const getAppManager = () => {
   if (!appManager) {
      appManager = new AstalApps.Apps();
   }
   return appManager;
};

export function getAppInfo(appId: string) {
   if (!appId) return null;

   // Check cache first
   if (appInfoCache.has(appId)) {
      return appInfoCache.get(appId);
   }

   // Use the single app manager instance
   const appList = getAppManager().get_list();
   for (const app of appList) {
      if (
         app.entry.toLowerCase().includes(appId.toLowerCase()) ||
         app.iconName === appId ||
         app.name === appId ||
         app.wm_class === appId
      ) {
         // Limit cache size
         if (appInfoCache.size >= MAX_CACHE_SIZE) {
            const firstKey = appInfoCache.keys().next().value;
            if (firstKey) {
               appInfoCache.delete(firstKey);
            }
         }
         appInfoCache.set(appId, app);
         return app;
      }
   }

   const commonKeywords = [
      "browser",
      "web",
      "music",
      "media",
      "video",
      "audio",
      "terminal",
      "editor",
      "code",
      "chat",
      "mail",
      "photo",
      "image",
      "settings",
      "control",
   ];

   for (const keyword of commonKeywords) {
      if (appId.toLowerCase().includes(keyword)) {
         const keywordResults = getAppManager().fuzzy_query(keyword);
         if (keywordResults.length > 0) {
            // Limit cache size
            if (appInfoCache.size >= MAX_CACHE_SIZE) {
               const firstKey = appInfoCache.keys().next().value;
               if (firstKey) {
                  appInfoCache.delete(firstKey);
               }
            }
            appInfoCache.set(appId, keywordResults[0]);
            return keywordResults[0];
         }
      }
   }

   // Cache null result to avoid repeated failed lookups
   if (appInfoCache.size >= MAX_CACHE_SIZE) {
      const firstKey = appInfoCache.keys().next().value;
      if (firstKey) {
         appInfoCache.delete(firstKey);
      }
   }
   appInfoCache.set(appId, null);
   return null;
}

export function lengthStr(length: number) {
   const hours = Math.floor(length / 3600);
   const minutes = Math.floor((length % 3600) / 60);
   const seconds = Math.floor(length % 60);

   const min0 = minutes < 10 ? "0" : "";
   const sec0 = seconds < 10 ? "0" : "";

   if (hours > 0) {
      return `${hours}:${min0}${minutes}:${sec0}${seconds}`;
   }
   return `${minutes}:${sec0}${seconds}`;
}
