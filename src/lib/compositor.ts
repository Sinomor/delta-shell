import AstalHyprland from "gi://AstalHyprland?version=0.1";
import AstalNiri from "gi://AstalNiri";
import { createBinding, Accessor } from "ags";
import { bash } from "@/src/lib/utils";
import GLib from "gi://GLib?version=2.0";
import { LayoutKeys, layoutMap, LayoutValues } from "./keyboardLayouts";
import { Gdk } from "ags/gtk4";

const compositorName = GLib.getenv("XDG_CURRENT_DESKTOP")!.toLowerCase();

const hyprland =
   compositorName === "hyprland" ? AstalHyprland.get_default() : null;

const niri = compositorName === "niri" ? AstalNiri.get_default() : null;

export const compositor = {
   name() {
      return compositorName;
   },
   isHyprland() {
      return compositorName === "hyprland";
   },
   isNiri() {
      return compositorName === "niri";
   },
   workspaces(): Accessor<any[]> {
      if (hyprland) {
         return createBinding(hyprland, "workspaces").as((ws) =>
            ws.sort((a, b) => a.id - b.id),
         );
      }
      if (niri) {
         return createBinding(niri, "workspaces").as((ws) =>
            ws.sort((a, b) => a.idx - b.idx),
         );
      }
      return { get: () => [], subscribe: () => () => {} } as any;
   },
   monitorWorkspaces(gdkmonitor: Gdk.Monitor): Accessor<any[]> {
      if (hyprland) {
         const model = gdkmonitor.model;
         return createBinding(hyprland, "workspaces").as((workspaces) =>
            workspaces
               .filter((ws) => ws.monitor?.model === model)
               .sort((a, b) => a.id - b.id),
         );
      }
      if (niri) {
         const connector = gdkmonitor.connector;
         return createBinding(niri, "workspaces").as((workspaces) =>
            workspaces
               .filter((ws) => ws.output === connector)
               .sort((a, b) => a.idx - b.idx),
         );
      }
      return { get: () => [], subscribe: () => () => {} } as any;
   },
   focusedWorkspace(): Accessor<any> {
      if (hyprland) {
         return createBinding(hyprland, "focusedWorkspace");
      }
      if (niri) {
         return createBinding(niri, "focusedWorkspace");
      }
      return { get: () => null, subscribe: () => () => {} } as any;
   },
   focusedWindow(): Accessor<any> {
      if (hyprland) {
         return createBinding(hyprland, "focusedClient");
      }
      if (niri) {
         return createBinding(niri, "focusedWindow");
      }
      return { get: () => null, subscribe: () => () => {} } as any;
   },
   workspaceId(ws: any): number {
      if (!ws) return 0;
      if (hyprland) return ws.id || 0;
      if (niri) return ws.idx || 0;
      return 0;
   },
   workspaceName(ws: any): string {
      return ws?.name || "";
   },
   workspaceWindows(ws: any): Accessor<any[]> {
      if (!ws) return { get: () => [], subscribe: () => () => {} } as any;

      if (hyprland) {
         return createBinding(ws, "clients");
      }
      if (niri) {
         return createBinding(ws, "windows");
      }
      return { get: () => [], subscribe: () => () => {} } as any;
   },
   focusWorkspace(ws: any) {
      ws?.focus();
   },
   nextWorkspace() {
      if (hyprland) {
         bash("hyprctl dispatch workspace +1");
      } else if (niri) {
         AstalNiri.msg.focus_workspace_up();
      }
   },
   previousWorkspace() {
      if (hyprland) {
         bash("hyprctl dispatch workspace -1");
      } else if (niri) {
         AstalNiri.msg.focus_workspace_down();
      }
   },
   windowId(win: any): number | string {
      if (!win) return 0;
      if (hyprland) return win.pid || 0;
      if (niri) return win.id || 0;
      return 0;
   },
   windowClass(win: any): string {
      if (!win) return "";
      if (hyprland) return win.class || "";
      if (niri) return win.appId || "";
      return "";
   },
   windowTitle(win: any): string {
      return win?.title || "";
   },
   focusWindow(win: any) {
      if (!win) return;
      if (hyprland) {
         win.focus();
      } else if (niri) {
         win.focus(win.id);
      }
   },
   closeWindow(win: any) {
      if (!win) return;
      if (hyprland) {
         win.kill();
      } else if (niri) {
         bash(`niri msg action close-window --id ${win.id}`);
      }
   },
   keyboard: {
      async getLayout(): Promise<{ full: string; short: string }> {
         if (hyprland) {
            try {
               const json = await bash(`hyprctl devices -j`);
               const devices = JSON.parse(json);
               let mainKb = devices.keyboards.find((kb: any) => kb.main);

               if (!mainKb) {
                  mainKb = devices[devices.length - 1];
               }

               if (!this.isValidLayout(mainKb.active_keymap)) {
                  return {
                     full: layoutMap["Unknown Layout"],
                     short: "?",
                  };
               }

               const layout: LayoutKeys = mainKb.active_keymap;
               const foundLayout: LayoutValues = layoutMap[layout];
               return {
                  full: layout,
                  short: foundLayout,
               };
            } catch (error) {
               console.error("Failed to get keyboard layout:", error);
            }
         } else if (niri) {
            try {
               const json = JSON.parse(
                  await bash("niri msg --json keyboard-layouts"),
               );
               const layouts = json.names;
               const layout = layouts[json.current_idx];

               if (!layout) {
                  return {
                     full: layoutMap["Unknown Layout"],
                     short: "?",
                  };
               }

               if (!this.isValidLayout(layout)) {
                  return {
                     full: layoutMap["Unknown Layout"],
                     short: "?",
                  };
               }

               const foundLayout: LayoutValues = layoutMap[layout];

               return {
                  full: layout,
                  short: foundLayout,
               };
            } catch (error) {
               console.error("Failed to get keyboard layout:", error);
            }
         }

         return { full: "Unknown", short: "?" };
      },
      onLayoutChange(callback: () => void): () => void {
         if (hyprland) {
            const id = hyprland.connect("keyboard-layout", callback);
            return () => hyprland.disconnect(id);
         } else if (niri) {
            const id = niri.connect("keyboard-layout-switched", callback);
            return () => niri.disconnect(id);
         }
         return () => {};
      },
      async switchLayout() {
         if (hyprland) {
            try {
               const json = await bash(`hyprctl devices -j`);
               const devices = JSON.parse(json);
               let mainKb = devices.keyboards.find((kb: any) => kb.main);

               if (mainKb.name) {
                  bash(`hyprctl switchxkblayout ${mainKb.name} next`);
               }
            } catch (error) {
               console.error("Failed to switch keyboard layout:", error);
            }
         } else if (niri) AstalNiri.msg.switch_layout_next();
      },
      isValidLayout(kbLayout: string): kbLayout is LayoutKeys {
         return Object.keys(layoutMap).includes(kbLayout);
      },
   },
};
