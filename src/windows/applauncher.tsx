import { windows_names } from "@/windows";
import { BarItemPopup } from "../widgets/baritempopup";
import { config } from "@/options";
import { AppLauncherModule } from "../modules/applauncher/applauncher";
const { width, height } = config.launcher;

export function AppLauncherWindow() {
   return (
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
