import { windows_names } from "@/windows";
import { BarItemPopup } from "../widgets/baritempopup";
import { ClipboardModule } from "../modules/clipboard/clipboard";
import { config } from "@/options";
const { width, height } = config.launcher;

export function ClipboardWindow() {
   return (
      <BarItemPopup
         name={windows_names.clipboard}
         module={"clock"}
         width={width.get()}
         height={height.get()}
      >
         <box class={"main"} widthRequest={width}>
            <ClipboardModule />
         </box>
      </BarItemPopup>
   );
}
