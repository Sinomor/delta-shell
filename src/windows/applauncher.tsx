import { windows_names } from "@/windows";
import { BarItemPopup } from "../widgets/baritempopup";
import { config } from "@/options";
import { AppLauncherModule } from "../modules/applauncher/applauncher";
import { Popup } from "../widgets/popup";
const { width, height, centered } = config.launcher;

export function AppLauncherWindow() {
   return centered ? (
      <Popup name={windows_names.applauncher} width={width} height={height}>
         <AppLauncherModule />
      </Popup>
   ) : (
      <BarItemPopup
         name={windows_names.applauncher}
         module={"launcher"}
         width={width}
         height={height}
      >
         <AppLauncherModule />
      </BarItemPopup>
   );
}
