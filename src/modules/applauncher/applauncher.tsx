import app from "ags/gtk4/app";
import Apps from "gi://AstalApps?version=0.1";
import { Gtk } from "ags/gtk4";
import { createComputed, createState, For, onCleanup } from "ags";
import { hideWindows, windows_names } from "@/windows";
import { config, theme } from "@/options";
import { AppButton } from "./appbutton";
import { t } from "@/i18n";
const { width, columns, "sort-type": sort } = config.launcher;

const apps = new Apps.Apps();
const [text, setText] = createState("");
let scrolled: Gtk.ScrolledWindow;
const list = text((text) => {
   if (sort === "frequency") return apps.fuzzy_query(text);
   if (sort === "alphabetical")
      return apps
         .fuzzy_query(text)
         .sort((a, b) => a.name.localeCompare(b.name));
   return apps.fuzzy_query(text);
});

function Entry() {
   let appconnect: number;

   onCleanup(() => {
      if (appconnect) app.disconnect(appconnect);
   });

   const onEnter = () => {
      const firstApp = list.peek()[0];

      console.log(`AppLauncher: launching ${firstApp.name}`);
      firstApp.launch();
      hideWindows();
   };

   return (
      <entry
         hexpand
         $={(self) => {
            appconnect = app.connect("window-toggled", async (_, win) => {
               const winName = win.name;
               const visible = win.visible;

               if (winName == windows_names.applauncher && visible) {
                  scrolled.set_vadjustment(null);
                  await apps.reload();
                  setText("");
                  self.set_text("");
                  self.grab_focus();
               }
            });
         }}
         placeholderText={t("modules.applauncher.search")}
         onActivate={onEnter}
         onNotifyText={(self) => {
            scrolled.set_vadjustment(null);
            setText(self.text);
         }}
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
   const columnedList = list((apps) =>
      apps.reduce(
         (result, app, index) => {
            result[index % columns].push(app);
            return result;
         },
         Array.from({ length: columns }, () => [] as Apps.Application[]),
      ),
   );

   return (
      <scrolledwindow $={(self) => (scrolled = self)}>
         <box spacing={theme.spacing} vexpand>
            <For each={columnedList}>
               {(column) => (
                  <box
                     spacing={theme.spacing}
                     hexpand
                     orientation={Gtk.Orientation.VERTICAL}
                  >
                     {column.map((app) => (
                        <AppButton app={app} />
                     ))}
                  </box>
               )}
            </For>
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
         visible={list((l) => l.length === 0)}
      >
         <label label={t("modules.applauncher.noMatch")} />
      </box>
   );
}

export function AppLauncherModule() {
   console.log("AppLauncher: initializing module");

   return (
      <box
         widthRequest={width - theme.window.padding * 2}
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
