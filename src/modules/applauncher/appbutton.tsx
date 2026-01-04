import { Gdk, Gtk } from "ags/gtk4";
import AstalApps from "gi://AstalApps?version=0.1";
import Pango from "gi://Pango?version=1.0";
import { hideWindows } from "@/windows";
import { theme } from "@/options";
import GioUnix from "gi://GioUnix?version=2.0";
import { pinnedEntries, togglePin } from "../bar/items/taskbar/niri";

export function AppButton({ app }: { app: AstalApps.Application }) {
   let box: Gtk.Box;
   let popover: Gtk.Popover;
   const DesktopAppInfo = GioUnix.DesktopAppInfo.new(app.entry);
   const ListActions = DesktopAppInfo.list_actions();

   return (
      <button
         class={"appbutton"}
         onClicked={() => {
            app.launch();
            console.log(`AppLauncher: launching ${app.name}`);
            hideWindows();
         }}
         focusOnClick={false}
      >
         <box spacing={16} $={(self) => (box = self)}>
            <Gtk.GestureClick
               button={0}
               onPressed={(ctrl) => {
                  const button = ctrl.get_current_button();
                  if (button === Gdk.BUTTON_SECONDARY) popover.popup();
               }}
            />
            <image
               iconName={app.iconName}
               pixelSize={theme["icon-size"].large}
            />
            <label
               class={"name"}
               ellipsize={Pango.EllipsizeMode.END}
               label={app.name}
            />
            <popover hasArrow={false} $={(self) => (popover = self)}>
               <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                  {ListActions.length > 0 && (
                     <>
                        {ListActions.map((action) => (
                           <button
                              class="context-item"
                              onClicked={() => {
                                 DesktopAppInfo.launch_action(action, null);
                                 popover.popdown();
                              }}
                           >
                              <label
                                 halign={Gtk.Align.START}
                                 label={DesktopAppInfo.get_action_name(action)}
                                 hexpand
                              />
                           </button>
                        ))}
                        <Gtk.Separator />
                     </>
                  )}

                  <button
                     onClicked={() => {
                        togglePin(app.entry);
                        popover.popdown();
                     }}
                  >
                     <label
                        halign={Gtk.Align.START}
                        label={pinnedEntries.as((entries) =>
                           entries.includes(app.entry) ? "Unpin" : "Pin",
                        )}
                     />
                  </button>
                  <button
                     onClicked={() => {
                        app.launch();
                        console.log(`AppLauncher: launching ${app.name}`);
                        hideWindows();
                     }}
                  >
                     <label label={"Launch"} halign={Gtk.Align.START} />
                  </button>
               </box>
            </popover>
         </box>
      </button>
   );
}
