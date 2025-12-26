import { compositor, config, theme } from "@/options";
import { bash } from "@/src/lib/utils";
import BarItem from "@/src/widgets/baritem";
import { createState, onCleanup } from "ags";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { isVertical } from "../../bar";
import { icons } from "@/src/lib/icons";
const hyprland =
   compositor.peek() === "hyprland" ? AstalHyprland.get_default() : null;

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

export function KeyboardHypr() {
   if (!hyprland) {
      console.warn("Bar: keyboard module skipped: hyprland is not active");
      return <box visible={false} />;
   }
   const conf = config.bar.modules.keyboard;
   updateLayout();
   let hyprlandconnect: number;

   onCleanup(() => {
      if (hyprlandconnect) hyprland.disconnect(hyprlandconnect);
   });

   return (
      <BarItem
         onPrimaryClick={conf["on-click"]}
         onSecondaryClick={conf["on-click-right"]}
         onMiddleClick={conf["on-click-middle"]}
         $={() => {
            hyprlandconnect = hyprland.connect(
               "keyboard-layout",
               (_, kbname, kblayout) => {
                  updateLayout();
               },
            );
         }}
         data={{
            lang: <label hexpand={isVertical} label={layout_name} />,
            icon: (
               <image
                  hexpand={isVertical}
                  iconName={icons.keyboard}
                  pixelSize={theme["icon-size"].normal}
               />
            ),
         }}
         format={conf.format}
      />
   );
}
