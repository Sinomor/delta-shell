import { Gdk, Gtk } from "ags/gtk4";
import { onCleanup } from "ags";
import app from "ags/gtk4/app";
import {
   attachHoverScroll,
   bash,
   hasBarItem,
   toggleQsModule,
   toggleWindow,
} from "../lib/utils";
import { theme } from "@/options";
import { isVertical, orientation } from "../modules/bar/bar";
import { windows_names } from "@/windows";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import AstalNiri from "gi://AstalNiri?version=0.1";
import AstalWp from "gi://AstalWp?version=0.1";
import AstalMpris from "gi://AstalMpris?version=0.1";
import ScreenRecorder from "@/src/services/screenrecorder";
import { compositor } from "../lib/compositor";
import Brightness from "../services/brightness";

type FormatData = Record<string, JSX.Element>;

type BarItemProps = JSX.IntrinsicElements["box"] & {
   window?: string;
   children?: any;
   format?: string;
   data?: FormatData;
   onPrimaryClick?: string | null | Function;
   onSecondaryClick?: string | null | Function;
   onMiddleClick?: string | null | Function;
   onScrollDown?: string | null | Function;
   onScrollUp?: string | null | Function;
};

export const FunctionsList = {
   "toggle-launcher": () => toggleWindow(windows_names.applauncher),
   "toggle-qs": () => toggleWindow(windows_names.quicksettings),
   "toggle-calendar": () => toggleWindow(windows_names.calendar),
   "toggle-powermenu": () => toggleWindow(windows_names.powermenu),
   "toggle-clipboard": () => toggleWindow(windows_names.clipboard),
   "toggle-weather": () => toggleQsModule(windows_names.weather),
   "toggle-notifs": () => toggleQsModule(windows_names.notificationslist),
   "toggle-volume": () =>
      toggleQsModule(
         windows_names.volume,
         hasBarItem("volume")
            ? "volume"
            : hasBarItem("microphone")
              ? "microphone"
              : undefined,
      ),
   "toggle-network": () => toggleQsModule(windows_names.network),
   "toggle-bluetooth": () => toggleQsModule(windows_names.bluetooth),
   "toggle-power": () => toggleQsModule(windows_names.power, "battery"),
   "toggle-media": () => toggleWindow(windows_names.media),
   "workspace-up": () => compositor.nextWorkspace(),
   "workspace-down": () => compositor.previousWorkspace(),
   "volume-up": () => {
      const spk = AstalWp.get_default()?.get_default_speaker();
      if (spk) spk.set_volume(spk.volume + 0.01);
   },
   "volume-down": () => {
      const spk = AstalWp.get_default()?.get_default_speaker();
      if (spk) spk.set_volume(spk.volume - 0.01);
   },
   "volume-toggle": () => {
      const spk = AstalWp.get_default()?.get_default_speaker();
      if (spk) spk.set_mute(!spk.get_mute());
   },
   "microphone-up": () => {
      const mcph = AstalWp.get_default()?.get_default_microphone();
      if (mcph) mcph.set_volume(mcph.volume + 0.01);
   },
   "microphone-down": () => {
      const mcph = AstalWp.get_default()?.get_default_microphone();
      if (mcph) mcph.set_volume(mcph.volume - 0.01);
   },
   "microphone-toggle": () => {
      const mcph = AstalWp.get_default()?.get_default_microphone();
      if (mcph) mcph.set_mute(!mcph.get_mute());
   },
   "switch-language": () => compositor.keyboard.switchLayout(),
   "screenrecord-toggle": () => {
      const sr = ScreenRecorder.get_default();
      if (sr) {
         if (sr.recording) sr.stop();
         else sr.start();
      }
   },
   "brightness-up": () => (Brightness.get_default().screen += 0.01),
   "brightness-down": () => (Brightness.get_default().screen -= 0.01),
   "media-play-pause": () => {
      const mpris = AstalMpris.get_default();
      const player =
         mpris.players.find(
            (p) => p.playbackStatus === AstalMpris.PlaybackStatus.PLAYING,
         ) || mpris.players[0];
      if (player?.canControl) player.play_pause();
   },
   "media-next": () => {
      const mpris = AstalMpris.get_default();
      const player =
         mpris.players.find(
            (p) => p.playbackStatus === AstalMpris.PlaybackStatus.PLAYING,
         ) || mpris.players[0];
      if (player?.canGoNext) player.next();
   },
   "media-prev": () => {
      const mpris = AstalMpris.get_default();
      const player =
         mpris.players.find(
            (p) => p.playbackStatus === AstalMpris.PlaybackStatus.PLAYING,
         ) || mpris.players[0];
      if (player?.canGoPrevious) player.previous();
   },
} as Record<string, any>;

function parseFormat(format: string, data: FormatData): JSX.Element[] {
   const regex = /\{([^:}]+):?([^}]*)\}|([^{}]+)/g;

   return format
      .split(" ")
      .filter((group) => group.trim() !== "")
      .map((group) => {
         const matches = Array.from(group.matchAll(regex));

         const elements = matches.map((match) => {
            const [_, key, size, text] = match;

            if (key) {
               const trimmedKey = key.trim();
               if (data && trimmedKey in data) {
                  return data[trimmedKey];
               }
               return <label label={`{${trimmedKey}}`} hexpand={isVertical} />;
            }

            return <label label={text} hexpand={isVertical} />;
         });

         if (elements.length === 1) {
            return elements[0];
         }

         return <box>{elements}</box>;
      });
}

function handleClick(
   button: number,
   onPrimary?: string | null | Function,
   onSecondary?: string | null | Function,
   onMiddle?: string | null | Function,
) {
   let handler: string | Function | null | undefined;

   if (button === Gdk.BUTTON_PRIMARY) handler = onPrimary;
   if (button === Gdk.BUTTON_SECONDARY) handler = onSecondary;
   if (button === Gdk.BUTTON_MIDDLE) handler = onMiddle;

   if (!handler || handler === "default") return;

   if (typeof handler === "function") {
      handler();
   } else {
      const func = FunctionsList[handler as keyof typeof FunctionsList];
      if (func) func();
   }
}

function handleScroll(
   dy: number,
   onUp?: string | null | Function,
   onDown?: string | null | Function,
) {
   const handler = dy < 0 ? onUp : dy > 0 ? onDown : null;

   if (!handler || handler === "default") return;

   if (typeof handler === "function") {
      handler();
   } else {
      const func = FunctionsList[handler as keyof typeof FunctionsList];
      if (func) func();
   }
}

export const barItemWidgets = new Map<string, Set<Gtk.Widget>>();
export let lastClickedBarItem: Gtk.Widget | null = null;

export function getBarItemForWindow(windowName: string): Gtk.Widget | null {
   const set = barItemWidgets.get(windowName);
   if (!set || set.size === 0) return null;

   if (
      lastClickedBarItem &&
      set.has(lastClickedBarItem) &&
      lastClickedBarItem.get_root()
   ) {
      return lastClickedBarItem;
   }

   for (const widget of set) {
      if (widget.get_root()) return widget;
   }
   return null;
}

export default function BarItem({
   window = "",
   children,
   format,
   data = {},
   onPrimaryClick = "default",
   onSecondaryClick = "default",
   onMiddleClick = "default",
   onScrollUp = "default",
   onScrollDown = "default",
   ...rest
}: BarItemProps) {
   const content = format ? parseFormat(format, data) : children;
   let rootBox: Gtk.Box;

   return (
      <box
         class={"bar-item"}
         $={(self) => {
            rootBox = self;
            if (window) {
               let set = barItemWidgets.get(window);
               if (!set) {
                  set = new Set();
                  barItemWidgets.set(window, set);
               }
               set.add(self);

               const appconnect = app.connect("window-toggled", (_, win) => {
                  if (win.name === window) {
                     self[win.visible ? "add_css_class" : "remove_css_class"](
                        "active",
                     );
                  }
               });
               onCleanup(() => {
                  app.disconnect(appconnect);
                  const s = barItemWidgets.get(window);
                  if (s) {
                     s.delete(self);
                     if (s.size === 0) barItemWidgets.delete(window);
                  }
               });

               attachHoverScroll(self, ({ dy }) => {
                  handleScroll(dy, onScrollUp, onScrollDown);
               });
            }
         }}
         {...rest}
      >
         <Gtk.GestureClick
            onPressed={(ctrl) => {
               lastClickedBarItem = rootBox || (ctrl.get_widget() as Gtk.Widget);
               handleClick(
                  ctrl.get_current_button(),
                  onPrimaryClick,
                  onSecondaryClick,
                  onMiddleClick,
               );
            }}
            button={0}
         />
         <box
            class={"content"}
            orientation={orientation}
            spacing={theme.bar.spacing}
            hexpand={isVertical}
         >
            {content}
         </box>
      </box>
   );
}
