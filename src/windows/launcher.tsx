import { windows_names } from "@/windows";
import { BarItemPopup } from "../widgets/baritempopup";
import { config } from "@/options";
import { LauncherModule } from "../modules/launcher/launcher";
const { width, height } = config.launcher;

export function LauncherWindow() {
   return (
      <BarItemPopup
         name={windows_names.launcher}
         module={"launcher"}
         width={width.get()}
         height={height.get()}
      >
         <LauncherModule />
      </BarItemPopup>
   );
}
