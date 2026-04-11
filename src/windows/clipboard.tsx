import { windows_names } from "@/windows";
import { BarItemPopup } from "../widgets/baritempopup";
import { ClipboardModule } from "../modules/clipboard/clipboard";
import { config, theme } from "@/options";
import { hasBarItem } from "../lib/utils";
import { Popup } from "../widgets/popup";
const { width, height, centered } = config.clipboard;

export function ClipboardWindow() {
   return centered ? (
      <Popup name={windows_names.clipboard} width={width} height={height}>
         <ClipboardModule />
      </Popup>
   ) : (
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
