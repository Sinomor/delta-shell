import { config } from "@/options";
import { windows_names } from "@/windows";
import GObject, { getter, property, register, signal } from "ags/gobject";
import app from "ags/gtk4/app";
import GLib from "gi://GLib?version=2.0";
import { Timer } from "../lib/timer";
import { bash } from "../lib/utils";
import { timeout } from "ags/time";

const user = await GLib.getenv("USER");

const commands = {
   sleep: "systemctl suspend",
   reboot: "systemctl reboot",
   logout: `loginctl terminate-user ${user}`,
   shutdown: "shutdown now",
};

@register({ GTypeName: "PowerMenu" })
export default class PowerMenu extends GObject.Object {
   static instance: PowerMenu;

   static get_default() {
      if (!this.instance) this.instance = new PowerMenu();
      return this.instance;
   }

   constructor() {
      super();
      this.#timer.subscribe(async () => {
         const seconds = Math.max(0, Math.ceil(this.#timer.timeLeft / 1000));
         if (this.#labelFormatter && seconds !== this.#lastSeconds) {
            this.#lastSeconds = seconds;
            this.#label = this.#labelFormatter(seconds);
            this.notify("label");
         }

         if (this.#timer.timeLeft <= 0) {
            this.executeCommand();
         }
      });
   }

   #title = "";
   #label = "";
   #cmd = "";
   #timer = new Timer(60 * 1000);
   #labelFormatter: ((seconds: number) => string) | null = null;
   #lastSeconds = -1;

   @getter(String)
   get title() {
      return this.#title;
   }

   @getter(String)
   get label() {
      return this.#label;
   }

   @getter(String)
   get cmd() {
      return this.#cmd;
   }

   get timer() {
      return this.#timer;
   }

   async executeCommand() {
      this.#timer.cancel();
      this.#labelFormatter = null;
      this.#lastSeconds = -1;
      await bash(this.#cmd);
      app.get_window(windows_names.verification)?.hide();
   }

   cancelAction() {
      this.#timer.cancel();
      this.#labelFormatter = null;
      this.#lastSeconds = -1;
      app.get_window(windows_names.verification)?.hide();
   }

   async action(action: string) {
      const formatters: Record<string, [string, string, (s: number) => string]> = {
         Sleep: [
            commands.sleep,
            "Sleep",
            (s) => `${user} will sleep automatically in ${s} second${s === 1 ? "" : "s"}`,
         ],
         Reboot: [
            commands.reboot,
            "Reboot",
            (s) => `The system will restart automatically in ${s} second${s === 1 ? "" : "s"}`,
         ],
         Logout: [
            commands.logout,
            "Log Out",
            (s) => `${user} will be logged out automatically in ${s} second${s === 1 ? "" : "s"}`,
         ],
         Shutdown: [
            commands.shutdown,
            "Shutdown",
            (s) => `The system will shutdown automatically in ${s} second${s === 1 ? "" : "s"}`,
         ],
      };

      const match = formatters[action];
      if (!match) return;

      this.#cmd = match[0];
      this.#title = match[1];
      this.#labelFormatter = match[2];
      this.#lastSeconds = 60;
      this.#label = this.#labelFormatter(60);

      this.notify("cmd");
      this.notify("title");
      this.notify("label");
      app.get_window(windows_names.powermenu)?.hide();
      app.get_window(windows_names.verification)?.show();

      this.#timer.reset();
      this.#timer.start();
   }
}
