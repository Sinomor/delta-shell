import { hideWindows, windows_names } from "@/windows";
import { Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { exec, execAsync } from "ags/process";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import { qs_page_set } from "../modules/quicksettings/quicksettings";
import { createComputed } from "gnim";
import { config } from "@/options";
import AstalApps from "gi://AstalApps?version=0.1";

/**
 * @returns true if all of the `bins` are found
 */
export function dependencies(...bins: string[]): boolean {
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

export function ensureDirectory(path: string): void {
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
): Promise<string> {
   const cmd =
      typeof strings === "string"
         ? strings
         : strings.flatMap((str, i) => str + `${values[i] ?? ""}`).join("");

   return execAsync(["bash", "-c", cmd]).catch((err) => {
      console.error(cmd, err);
      return "";
   });
}

/**
 * Directly uses Gio.Subprocess to invoke bash and return the output in bytes.
 */
export async function bashRaw(
   strings: TemplateStringsArray | string,
   stdin_buffer?: Uint8Array,
   ...values: unknown[]
): Promise<Uint8Array | undefined> {
   const cmd =
      typeof strings === "string"
         ? strings
         : strings.flatMap((str, i) => str + `${values[i] ?? ""}`).join("");

   const flags =
      Gio.SubprocessFlags.STDOUT_PIPE |
      Gio.SubprocessFlags.STDERR_PIPE |
      (stdin_buffer ? Gio.SubprocessFlags.STDIN_PIPE : 0);

   const proc = Gio.Subprocess.new(["bash", "-c", cmd], flags);

   return new Promise<Uint8Array>((resolve, reject) => {
      proc.communicate_async(stdin_buffer ?? null, null, (_: unknown, res: Gio.AsyncResult) => {
         try {
            const [, out, err] = proc.communicate_finish(res)
            if (proc.get_successful()) {
               return resolve(out?.get_data() ?? new Uint8Array());
            } else {
               reject(err?.get_data() ?? new Uint8Array());
            }
         } catch (error) {
            reject(error)
         }
      })
   });
}

type NotifUrgency = "low" | "normal" | "critical";

export const now = (): string =>
   GLib.DateTime.new_now_local().format("%Y-%m-%d_%H-%M-%S")!;

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".svg"] as const;

export function isImage(filename: string): boolean {
   if (!GLib.file_test(filename, GLib.FileTest.EXISTS)) {
      return false;
   }

   const filenameLower = filename.toLowerCase();
   return IMAGE_EXTENSIONS.some((ext) => filenameLower.endsWith(ext));
}

let iconThemeCache: Gtk.IconTheme | null = null;

function getIconTheme(): Gtk.IconTheme {
   if (!iconThemeCache) {
      iconThemeCache = Gtk.IconTheme.get_for_display(
         Gdk.Display.get_default()!,
      );
   }
   return iconThemeCache;
}

export function isIcon(icon?: string | null): boolean {
   return !!icon && getIconTheme().has_icon(icon);
}

export function fileExists(path: string): boolean {
   return GLib.file_test(path, GLib.FileTest.EXISTS);
}

export function toggleWindow(name: string): void {
   const win = app.get_window(name);
   if (!win) {
      console.warn(`Window "${name}" not found`);
      return;
   }

   if (win.visible) {
      win.hide();
   } else {
      hideWindows();
      win.show();
   }
}

interface CssValueOptions {
   unit?: string;
   separator?: string;
   allowEmpty?: boolean;
}

export function toCssValue(
   value: number | number[],
   options: CssValueOptions = {},
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
      return value.map(format).filter(Boolean).join(separator);
   }

   throw new Error("Invalid value type. Expected number or number[]");
}

interface ScrollInfo {
   dx: number;
   dy: number;
   hovered: boolean;
   shift: boolean;
}

type ScrollHandler = (info: ScrollInfo) => void;

export function attachHoverScroll(box: Gtk.Box, onScroll: ScrollHandler): void {
   let hovered = false;

   const motion = new Gtk.EventControllerMotion();
   motion.connect("enter", () => (hovered = true));
   motion.connect("leave", () => (hovered = false));
   box.add_controller(motion);

   const scrollCtrl = new Gtk.EventControllerScroll({
      flags:
         Gtk.EventControllerScrollFlags.VERTICAL |
         Gtk.EventControllerScrollFlags.DISCRETE,
   });

   scrollCtrl.connect("scroll", (_ctrl, dx, dy) => {
      if (!hovered) return Gdk.EVENT_PROPAGATE;

      const state = _ctrl.get_current_event_state?.() ?? 0;
      const shift = (state & Gdk.ModifierType.SHIFT_MASK) !== 0;

      onScroll({ dx, dy, hovered, shift });

      return Gdk.EVENT_STOP;
   });

   scrollCtrl.set_propagation_phase(Gtk.PropagationPhase.BUBBLE);
   box.add_controller(scrollCtrl);
}

export function hasBarItem(module: string): boolean {
   return (
      config.bar.modules.start.includes(module) ||
      config.bar.modules.center.includes(module) ||
      config.bar.modules.end.includes(module)
   );
}

export function toggleQsModule(name: string, module?: string): void {
   const targetModule = module ?? name;

   if (hasBarItem(targetModule)) {
      const windowName = windows_names[name as keyof typeof windows_names];
      if (windowName) {
         toggleWindow(windowName);
      }
   } else {
      toggleWindow(windows_names.quicksettings);
      qs_page_set(name);
   }
}

const appInfoCache = new Map<string, AstalApps.Application | null>();
const MAX_CACHE_SIZE = 50;

let appManager: AstalApps.Apps | null = null;

function getAppManager(): AstalApps.Apps {
   if (!appManager) {
      appManager = new AstalApps.Apps();
   }
   return appManager;
}

function addToCache(key: string, value: AstalApps.Application | null): void {
   if (appInfoCache.size >= MAX_CACHE_SIZE) {
      const firstKey = appInfoCache.keys().next().value;
      if (firstKey) appInfoCache.delete(firstKey);
   }
   appInfoCache.set(key, value);
}

function findAppInList(
   appId: string,
   appList: AstalApps.Application[],
): AstalApps.Application | null {
   const searchTerm = appId.toLowerCase();

   for (const app of appList) {
      if (
         app.entry?.toLowerCase() === searchTerm ||
         app.iconName === appId ||
         app.name === appId ||
         app.wm_class === appId
      ) {
         return app;
      }
   }

   for (const app of appList) {
      if (app.entry?.toLowerCase().includes(searchTerm)) {
         return app;
      }
   }

   return null;
}

export function getAppInfo(appId: string): AstalApps.Application | null {
   if (!appId) return null;

   if (appInfoCache.has(appId)) {
      return appInfoCache.get(appId)!;
   }

   const manager = getAppManager();
   const appList = manager.get_list();

   const match = findAppInList(appId, appList);

   addToCache(appId, match);
   return match;
}

export function lengthStr(length: number): string {
   const hours = Math.floor(length / 3600);
   const minutes = Math.floor((length % 3600) / 60);
   const seconds = Math.floor(length % 60);

   const formatTime = (value: number): string =>
      value < 10 ? `0${value}` : `${value}`;

   if (hours > 0) {
      return `${hours}:${formatTime(minutes)}:${formatTime(seconds)}`;
   }

   return `${minutes}:${formatTime(seconds)}`;
}
