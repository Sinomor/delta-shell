import app from "ags/gtk4/app";
import "@/src/services/styles";
import request from "./request";
import { config } from "./options";
import { windows } from "./windows";
import { updateLocationData } from "./src/services/location";

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
