import { compositor } from "@/options";
import { bash } from "@/src/lib/utils";
import BarItem from "@/src/widgets/common/baritem";
import { createState, onCleanup } from "ags";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
const hyprland = AstalHyprland.get_default();

const [layout_name, layout_name_set] = createState("?");

function updateLayout() {
   bash(
      `hyprctl devices -j | jq -r '.keyboards[] | select(.main == true) | .active_keymap'`,
   )
      .then((layout) => {
         if (layout.includes("English")) {
            layout_name_set("En");
         } else if (layout.includes("Russian")) {
            layout_name_set("Ru");
         } else {
            layout_name_set("?");
         }
      })
      .catch((err) => {
         console.error(`Failed to get keyboard layout: ${err}`);
      });
}
if (compositor.get() === "hyprland") updateLayout();

export function Keyboard_Hypr() {
   let hyprlandconnect: number;

   onCleanup(() => {
      if (hyprlandconnect) hyprland.disconnect(hyprlandconnect);
   });

   return (
      <BarItem
         onPrimaryClick={async () => {
            const device = await bash(
               `hyprctl devices -j | jq -r '.keyboards[] | select(.main == true) | .name'`,
            );
            bash(`hyprctl switchxkblayout ${device} next`);
         }}
         $={() => {
            hyprlandconnect = hyprland.connect(
               "keyboard-layout",
               (_, kbname, kblayout) => {
                  updateLayout();
               },
            );
         }}
      >
         <label label={layout_name} />
      </BarItem>
   );
}
