import GObject, { register, getter } from "ags/gobject";
import {
   bash,
   dependencies,
   ensureDirectory,
   notifySend,
   now,
} from "@/src/lib/utils";
import GLib from "gi://GLib?version=2.0";
import { interval, Timer } from "ags/time";

const HOME = GLib.get_home_dir();

@register({ GTypeName: "Screenrecord" })
export default class ScreenRecord extends GObject.Object {
   static instance: ScreenRecord;

   static get_default() {
      if (!this.instance) this.instance = new ScreenRecord();
      return this.instance;
   }

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
      if (!dependencies("gpu-screen-recorder")) return;
      if (this.#recording) return;

      ensureDirectory(this.#recordings);
      this.#file = `${this.#recordings}/${now()}.mp4`;

      bash(
         `gpu-screen-recorder -w screen -f 60 -a default_output -o ${this.#file}`,
      );

      this.#recording = true;
      this.notify("recording");

      this.#timer = 0;
      this.#interval = interval(1000, () => {
         this.notify("timer");
         this.#timer++;
      });
   }

   async stop() {
      if (!this.#recording) return;

      await bash("killall -INT gpu-screen-recorder");
      this.#recording = false;
      this.notify("recording");
      this.#interval?.cancel();

      notifySend({
         icon: "folder-videos-symbolic",
         appName: "Screen Recorder",
         summary: "Screen recording saved",
         body: `File saved at ${this.#file}`,
         actions: {
            "Show in Files": () => bash(`xdg-open ${this.#recordings}`),
            View: () => bash(`xdg-open ${this.#file}`),
         },
      });
   }
}
