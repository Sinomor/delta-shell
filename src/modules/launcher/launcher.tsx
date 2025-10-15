import Gtk from "gi://Gtk";
import { hide_all_windows, windows_names } from "@/windows";
import Adw from "gi://Adw?version=1";
import { createState, onCleanup } from "ags";
import { config } from "@/options";
import { AppLauncherModule } from "./applauncher";
import { ClipboardModule } from "../clipboard/clipboard";
import { hasBarItem } from "@/src/lib/utils";
const { width, height } = config.launcher;
export const [launcher_page, launcher_page_set] = createState("apps");

export function LauncherModule() {
   return (
      <stack
         class={"main"}
         widthRequest={width.get()}
         transitionDuration={config.transition.get()}
         transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
         $={(self) => {
            const unsub = launcher_page.subscribe(() =>
               self.set_visible_child_name(launcher_page.get()),
            );
            onCleanup(() => unsub());
         }}
      >
         <AppLauncherModule />
         {!hasBarItem("clipboard") && <ClipboardModule />}
      </stack>
   );
}
