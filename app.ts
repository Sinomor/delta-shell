import app from "ags/gtk4/app";
import "@/services/styles";
import windows from "./windows";
import request from "./request";
import Gio from "gi://Gio?version=2.0";
import options from "./options";
import { updateLocationData } from "./services/location";

app.start({
   icons: `${SRC}/assets/icons`,
   instanceName: "delta-shell",
   main() {
      if (options.weather.enabled.get()) updateLocationData();
      windows.map((win) => app.get_monitors().map(win));
   },
   requestHandler(req, res) {
      request(req, res);
   },
});
