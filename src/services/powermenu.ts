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

@register({ GTypeName: "Powermenu" })
export default class Powermenu extends GObject.Object {
   static instance: Powermenu;

   static get_default() {
      if (!this.instance) this.instance = new Powermenu();
      return this.instance;
   }

   constructor() {
      super();
      this.#timer.subscribe(async () => {
         if (this.#timer.timeLeft <= 0) {
            this.executeCommand();
         }
      });
   }

   #title = "";
   #label = "";
   #cmd = "";
   #timer = new Timer(60 * 1000);

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
      await bash(this.#cmd);
      app.get_window(windows_names.verification)?.hide();
   }

   cancelAction() {
      this.#timer.cancel();
      app.get_window(windows_names.verification)?.hide();
   }

   async action(action: string) {
      [this.#cmd, this.#title, this.#label] = {
         Sleep: [
            commands.sleep,
            "Sleep",
            `${user} will be sleep automatically in 60 seconds`,
         ],
         Reboot: [
            commands.reboot,
            "Reboot",
            "The system will restart automatically in 60 seconds",
         ],
         Logout: [
            commands.logout,
            "Log Out",
            `${user} will be logged out automatically in 60 seconds`,
         ],
         Shutdown: [
            commands.shutdown,
            "Shutdown",
            "The system will shutdown automatically in 60 seconds",
         ],
      }[action]!;

      this.notify("cmd");
      this.notify("title");
      this.notify("label");
      app.get_window(windows_names.powermenu)?.hide();
      app.get_window(windows_names.verification)?.show();

      this.#timer.reset();
      this.#timer.start();
   }
}
