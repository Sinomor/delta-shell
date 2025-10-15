import app from "ags/gtk4/app";
import { Gtk } from "ags/gtk4";
import { bash, dependencies, hasBarItem } from "@/src/lib/utils";
import { icons } from "@/src/lib/icons";
import { createComputed, createState, For, onCleanup } from "ags";
import { hide_all_windows, windows_names } from "@/windows";
import { config, theme } from "@/options";
import Cliphist from "@/src/services/cliphist";
import { ClipText } from "./text";
import { ClipColor } from "./color";
import { ClipImage } from "./image";
import { launcher_page } from "../launcher/launcher";
const clipboard = Cliphist.get_default();
const { width, height } = config.launcher;

const colorPatterns = {
   hex: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
   rgb: /^rgb\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*\)$/,
   rgba: /^rgba\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*([01]?\.\d+)\s*\)$/,
   hsl: /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3}%)\s*,\s*(\d{1,3}%)\s*\)$/,
   hsla: /^hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3}%)\s*,\s*(\d{1,3}%)\s*,\s*([01]?\.\d+|\d{1,3}%?)\s*\)$/,
};

const imagePattern = /\[\[ binary data (\d+) (KiB|MiB) (\w+) (\d+)x(\d+) \]\]/;

const [text, text_set] = createState("");
let scrolled: Gtk.ScrolledWindow;

const list = createComputed([clipboard.list, text], (list, text) => {
   return list.filter((entry) => {
      if (!text) return true;
      const content = entry.split("\t").slice(1).join(" ").trim();
      return content.toLowerCase().includes(text.toLowerCase());
   });
});

function ClipButton({ item }: { item: string }) {
   const [id, ...contentParts] = item.split("\t");
   const content = contentParts.join(" ").trim();
   const isImage =
      config.launcher.clipboard.image_preview.get() &&
      content.match(imagePattern);
   const isColor = Object.entries(colorPatterns).find(([_, pattern]) =>
      pattern.test(content.trim()),
   );

   return isColor ? (
      <ClipColor id={id} content={content} />
   ) : isImage ? (
      <ClipImage id={id} content={isImage} />
   ) : (
      <ClipText id={id} content={content} />
   );
}

function Entry() {
   let appconnect: number;

   onCleanup(() => {
      if (appconnect) app.disconnect(appconnect);
   });

   const onEnter = () => {
      const item = list.get()[0];
      const [id, ...contentParts] = item.split("\t");
      clipboard.copy(id);
      hide_all_windows();
   };

   return (
      <entry
         hexpand
         $={(self) => {
            appconnect = app.connect("window-toggled", async (_, win) => {
               const winName = win.name;
               const visible = win.visible;

               if (hasBarItem("clipboard")) {
                  if (winName == windows_names.clipboard && visible) {
                     scrolled.set_vadjustment(null);
                     await self.set_text("");
                     self.grab_focus();
                  }
               } else {
                  const mode = launcher_page.get() == "clipboard";
                  if (winName == windows_names.launcher && visible && mode) {
                     scrolled.set_vadjustment(null);
                     await self.set_text("");
                     self.grab_focus();
                  }
               }
            });
         }}
         placeholderText={"Search..."}
         onActivate={() => onEnter()}
         onNotifyText={(self) => {
            scrolled.set_vadjustment(null);
            text_set(self.text);
         }}
      />
   );
}

function Clear() {
   return (
      <button
         class={"clear"}
         focusable={false}
         onClicked={async () => await clipboard.clear()}
      >
         <image iconName={icons.trash} pixelSize={20} />
      </button>
   );
}

function Header() {
   return (
      <box class={"header"}>
         <Entry />
         <Clear />
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
            <For each={list}>
               {(item) => {
                  return <ClipButton item={item} />;
               }}
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
         class={"apps-not-found"}
         visible={list.as((l) => l.length === 0)}
      >
         <label label={"No matches found"} />
      </box>
   );
}

export function ClipboardModule() {
   return (
      <box
         $type={"named"}
         name={"clipboard"}
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
