import app from "ags/gtk4/app";
import Apps from "gi://AstalApps?version=0.1";
import { AppButton } from "../items/app_button";
import { Gtk } from "ags/gtk4";
import { createState, For, onCleanup } from "ags";
import options from "@/options";
const { name, page } = options.launcher;

const apps = new Apps.Apps();
const [text, text_set] = createState("");
let scrolled: Gtk.ScrolledWindow;
const list = text.as((text) => apps.fuzzy_query(text));

function Entry() {
   let appconnect: number;

   onCleanup(() => {
      if (appconnect) app.disconnect(appconnect);
   });

   return (
      <entry
         hexpand
         $={(self) => {
            appconnect = app.connect("window-toggled", async (_, win) => {
               const winName = win.name;
               const visible = win.visible;
               const mode = page.get() == "apps";

               if (winName == name && visible && mode) {
                  scrolled.set_vadjustment(null);
                  await text_set("");
                  self.set_text("");
                  self.grab_focus();
               }
            });
         }}
         placeholderText={"Search..."}
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
            spacing={options.theme.spacing}
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
         spacing={options.theme.spacing}
      >
         <Header />
         <NotFound />
         <List />
      </box>
   );
}
