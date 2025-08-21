import { compositor } from "@/options";
import { bash } from "@/src/lib/utils";
import BarItem from "@/src/widgets/common/baritem";
import { createState, onCleanup } from "ags";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
const hyprland = AstalHyprland.get_default();

const [layout_name, layout_name_set] = createState("?");

function updateLayout() {
   bash(`hyprctl devices -j`)
      .then((json) => {
         try {
            const devices = JSON.parse(json);

            const mainKeyboard = devices.keyboards.find(
               (kb: any) => kb.main === true,
            );

            if (mainKeyboard && mainKeyboard.active_keymap) {
               const layout = mainKeyboard.active_keymap;

               if (layout.includes("English")) {
                  layout_name_set("En");
               } else if (layout.includes("Russian")) {
                  layout_name_set("Ru");
               } else {
                  layout_name_set(layout.substring(0, 2));
               }
            } else {
               layout_name_set("?");
            }
         } catch (error) {
            console.error("Failed to parse hyprctl JSON output:", error);
            layout_name_set("?");
         }
      })
      .catch((err) => {
         console.error(`Failed to get keyboard layout: ${err}`);
         layout_name_set("?");
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
            try {
               const json = await bash(`hyprctl devices -j`);
               const devices = JSON.parse(json);

               const mainKeyboard = devices.keyboards.find(
                  (kb: any) => kb.main === true,
               );

               if (mainKeyboard && mainKeyboard.name) {
                  bash(`hyprctl switchxkblayout ${mainKeyboard.name} next`);
               }
            } catch (error) {
               console.error("Failed to switch keyboard layout:", error);
            }
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
