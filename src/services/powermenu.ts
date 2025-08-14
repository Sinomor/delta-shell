import { config } from "@/options";
import { windows_names } from "@/windows";
import GObject, { getter, property, register, signal } from "ags/gobject";
import app from "ags/gtk4/app";
import GLib from "gi://GLib?version=2.0";

const commands = {
   sleep: "systemctl suspend",
   reboot: "systemctl reboot",
   logout: `pkill ${GLib.getenv("XDG_SESSION_DESKTOP")}`,
   shutdown: "shutdown now",
};

@register({ GTypeName: "Powermenu" })
export default class Powermenu extends GObject.Object {
   static instance: Powermenu;

   static get_default() {
      if (!this.instance) this.instance = new Powermenu();
      return this.instance;
   }

   #title = "";
   #cmd = "";

   @getter(String)
   get title() {
      return this.#title;
   }

   @getter(String)
   get cmd() {
      return this.#cmd;
   }

   action(action: string) {
      [this.#cmd, this.#title] = {
         Sleep: [commands.sleep, "Sleep"],
         Reboot: [commands.reboot, "Reboot"],
         Logout: [commands.logout, "Log Out"],
         Shutdown: [commands.shutdown, "Shutdown"],
      }[action]!;

      this.notify("cmd");
      this.notify("title");
      app.get_window(windows_names.powermenu)?.hide();
      app.get_window(windows_names.verification)?.show();
   }
}
