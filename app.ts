import app from "ags/gtk4/app";
import "@/services/styles";
import request from "./request";
import Gio from "gi://Gio?version=2.0";
import { updateLocationData } from "./services/location";
import { config } from "./options";
import { windows } from "./windows";

app.start({
   icons: `${SRC}/assets/icons`,
   instanceName: "delta-shell",
   main() {
      if (config.weather.enabled.get()) updateLocationData();
      windows();
   },
   requestHandler(req, res) {
      request(req, res);
   },
});
