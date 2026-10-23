import app from "ags/gtk4/app";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import "@/src/services/styles";
import request from "./request";
import { config } from "./options";
import { windows } from "./windows";

app.start({
   icons: `${DATADIR ?? SRC}/assets/icons`,
   instanceName: "delta-shell",
   main() {
      const notifd = AstalNotifd.get_default();
      notifd.freeze_notify();
      try {
         [...notifd.notifications].forEach((n) => n.dismiss());
      } finally {
         notifd.thaw_notify();
      }
      windows();
   },
   requestHandler(argv, response) {
      request(argv, response);
   },
});
