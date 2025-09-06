import app from "ags/gtk4/app";
import "@/src/services/styles";
import request from "./request";
import { config } from "./options";
import { windows } from "./windows";

app.start({
   icons: `${DATADIR ?? SRC}/assets/icons`,
   instanceName: "delta-shell",
   main() {
      windows();
   },
   requestHandler(argv, response) {
      request(argv, response);
   },
});
