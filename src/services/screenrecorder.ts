import GObject, { register, getter } from "ags/gobject";
import { bash, dependencies, ensureDirectory, now } from "@/src/lib/utils";
import GLib from "gi://GLib?version=2.0";
import { interval, Timer } from "ags/time";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import { icons } from "../lib/icons";
import { t } from "@/i18n";

const HOME = GLib.get_home_dir();

@register({ GTypeName: "ScreenRecorder" })
export default class ScreenRecorder extends GObject.Object {
   static instance: ScreenRecorder;

   static get_default() {
      if (!this.instance) this.instance = new ScreenRecorder();
      return this.instance;
   }

   #pid = 0;
   #recordings = `${HOME}/Videos/Screencasting`;
   #file = "";
   #interval?: Timer;
   #recording = false;
   #timer = 0;

   @getter(Boolean)
   get recording() {
      return this.#recording;
   }

   @getter(Number)
   get timer() {
      return this.#timer;
   }

   async start() {
      if (!dependencies("gpu-screen-recorder")) {
         console.error("ScreenRecorder: gpu-screen-recorder not found");
         return;
      }
      if (this.#recording) {
         console.warn(
            "ScreenRecorder: already recording, ignoring start request",
         );
         return;
      }

      try {
         ensureDirectory(this.#recordings);
         this.#file = `${this.#recordings}/${now()}.mp4`;

         this.#pid = parseInt(
            (
               await bash(
                  `gpu-screen-recorder -w screen -f 60 -a default_output -o "${this.#file}" </dev/null >/dev/null 2>&1 & echo $!`
               )
            ).trim(),
            10
         );

         console.log(`ScreenRecorder: started recording to ${this.#file}`);
         this.#recording = true;
         this.notify("recording");

         this.#timer = 0;
         this.#interval = interval(1000, () => {
            this.notify("timer");
            this.#timer++;
         });
      } catch (error) {
         console.error("ScreenRecorder: failed to start recording:", error);
         this.#recording = false;
      }
   }

   async stop() {
      if (!this.#recording) {
         console.warn("ScreenRecorder: not recording, ignoring stop request");
         return;
      }

      try {
         if (this.#pid) await bash(`kill -INT ${this.#pid} 2>/dev/null || true`);
         this.#pid = 0;
         console.log(`ScreenRecorder: stopped, saved to ${this.#file}`);
         this.#recording = false;
         this.notify("recording");
         this.#interval?.cancel();

         const notification = new AstalNotifd.Notification({
            appName: t("services.screencapture.record.notification.app"),
            appIcon: icons.video,
            summary: t("services.screencapture.record.notification.summary"),
            body: t("services.screencapture.record.notification.body", { file: this.#file }),
         });

         notification.add_action(
            new AstalNotifd.Action({ id: "show", label: "Show in Files" }),
         );
         notification.add_action(
            new AstalNotifd.Action({ id: "view", label: "View" }),
         );

         notification.connect("invoked", (_, action) => {
            if (action === "show") bash(`xdg-open ${this.#recordings}`);
            if (action === "view") bash(`xdg-open ${this.#file}`);
         });

         try {
            AstalNotifd.send_notification(notification, null);
         } catch (error) {
            console.error(
               "ScreenRecorder: failed to send notification:",
               error,
            );
         }
      } catch (error) {
         console.error("ScreenRecorder: failed to stop recording:", error);
      }
   }
}
