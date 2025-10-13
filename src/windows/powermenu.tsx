import { windows_names } from "@/windows";
import { PowerMenuModule } from "../modules/powermenu/powermenu";
import app from "ags/gtk4/app";
import Powermenu from "../services/powermenu";
import { VerificationModule } from "../modules/powermenu/verification";
import { Popup } from "../widgets/popup";
const powermenu = Powermenu.get_default();

export function PowerMenuWindow() {
   return (
      <Popup name={windows_names.powermenu}>
         <PowerMenuModule />
      </Popup>
   );
}

export function VerificationWindow() {
   const appconnect = app.connect("window-toggled", (_, win) => {
      const winName = win.name;
      const visible = win.visible;

      if (winName == windows_names.verification && !visible) {
         powermenu.cancelAction();
      }
   });

   return (
      <Popup name={windows_names.verification}>
         <VerificationModule />
      </Popup>
   );
}
