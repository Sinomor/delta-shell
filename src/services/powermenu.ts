import { config } from "@/options";
import { windows_names } from "@/windows";
import GObject, { getter, property, register, signal } from "ags/gobject";
import app from "ags/gtk4/app";
import GLib from "gi://GLib?version=2.0";
import { Timer } from "../lib/timer";
import { bash } from "../lib/utils";
import { timeout } from "ags/time";
import { t } from "@/i18n";

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
         if (this.#timer.timeLeft <= 0) {
            this.executeCommand();
         }
      });
   }

   #title = "";
   #label = "";
   #cmd = "";
   #time = 60;
   #timer = new Timer(this.#time * 1000);

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
            t("services.powermenu.sleep.title"),
            t("services.powermenu.sleep.message", { user, time: this.#time }),
         ],
         Reboot: [
            commands.reboot,
            t("services.powermenu.reboot.title"),
            t("services.powermenu.reboot.message", { user, time: this.#time }),
         ],
         Logout: [
            commands.logout,
            t("services.powermenu.logout.title"),
            t("services.powermenu.logout.message", { user, time: this.#time }),
         ],
         Shutdown: [
            commands.shutdown,
            t("services.powermenu.shutdown.title"),
            t("services.powermenu.shutdown.message", { user, time: this.#time }),
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
