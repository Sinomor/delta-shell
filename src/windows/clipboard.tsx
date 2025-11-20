import { windows_names } from "@/windows";
import { BarItemPopup } from "../widgets/baritempopup";
import { ClipboardModule } from "../modules/clipboard/clipboard";
import { config, theme } from "@/options";
import { hasBarItem } from "../lib/utils";
const { width, height } = config.launcher;

export function ClipboardWindow() {
   return (
      <BarItemPopup
         name={windows_names.clipboard}
         module={hasBarItem("clipboard") ? "clipboard" : "launcher"}
         width={width}
         height={height}
      >
         <ClipboardModule />
      </BarItemPopup>
   );
}
