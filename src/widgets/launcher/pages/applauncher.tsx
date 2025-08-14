import app from "ags/gtk4/app";
import Apps from "gi://AstalApps?version=0.1";
import { AppButton } from "../items/app_button";
import { Gtk } from "ags/gtk4";
import { createState, For, onCleanup } from "ags";
import { hide_all_windows, windows_names } from "@/windows";
import { config, theme } from "@/options";
import { launcher_page } from "../launcher";

const apps = new Apps.Apps();
const [text, text_set] = createState("");
let scrolled: Gtk.ScrolledWindow;
const list = text.as((text) => apps.fuzzy_query(text));

function Entry() {
   let appconnect: number;

   onCleanup(() => {
      if (appconnect) app.disconnect(appconnect);
   });

   const onEnter = () => {
      apps.fuzzy_query(text.get())?.[0].launch();
      hide_all_windows();
   };

   return (
      <entry
         hexpand
         $={(self) => {
            appconnect = app.connect("window-toggled", async (_, win) => {
               const winName = win.name;
               const visible = win.visible;
               const mode = launcher_page.get() == "apps";

               if (winName == windows_names.launcher && visible && mode) {
                  scrolled.set_vadjustment(null);
                  await text_set("");
                  self.set_text("");
                  self.grab_focus();
               }
            });
         }}
         placeholderText={"Search..."}
         onActivate={() => onEnter()}
         onNotifyText={(self) => text_set(self.text)}
      />
   );
}

function Header() {
   return (
      <box class={"header"}>
         <Entry />
      </box>
   );
}

function List() {
   return (
      <scrolledwindow class={"apps-list"} $={(self) => (scrolled = self)}>
         <box
            spacing={theme.spacing}
            vexpand
            orientation={Gtk.Orientation.VERTICAL}
         >
            <For each={list}>{(app) => <AppButton app={app} />}</For>
         </box>
      </scrolledwindow>
   );
}

function NotFound() {
   return (
      <box
         halign={Gtk.Align.CENTER}
         valign={Gtk.Align.CENTER}
         vexpand
         class={"apps-not-found"}
         visible={list.as((l) => l.length === 0)}
      >
         <label label={"No match found"} />
      </box>
   );
}

export function AppLauncher() {
   return (
      <box
         name={"apps"}
         $type="named"
         orientation={Gtk.Orientation.VERTICAL}
         vexpand
         spacing={theme.spacing}
      >
         <Header />
         <NotFound />
         <List />
      </box>
   );
}
