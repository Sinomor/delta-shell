import app from "ags/gtk4/app";
import { Gtk } from "ags/gtk4";
import { bash, hasBarItem } from "@/src/lib/utils";
import { icons } from "@/src/lib/icons";
import { createComputed, createState, For, onCleanup } from "ags";
import { hideWindows, windows_names } from "@/windows";
import { config, theme } from "@/options";
import Clipboard from "@/src/services/clipboard";
import { ClipText } from "./text";
import { ClipColor } from "./color";
import { ClipImage } from "./image";
const clipboard = Clipboard.get_default();
const { width } = config.clipboard;

const colorPatterns = {
   hex: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
   rgb: /^rgb\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*\)$/,
   rgba: /^rgba\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*([01]?\.\d+)\s*\)$/,
   hsl: /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3}%)\s*,\s*(\d{1,3}%)\s*\)$/,
   hsla: /^hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3}%)\s*,\s*(\d{1,3}%)\s*,\s*([01]?\.\d+|\d{1,3}%?)\s*\)$/,
};

const imagePattern = /\[\[ binary data \d+ ([KMGT]i)?B \w+ \d+x\d+ \]\]/;

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
      config.clipboard["image-preview"] && content.match(imagePattern);
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
      hideWindows();
   };

   return (
      <entry
         hexpand
         $={(self) => {
            appconnect = app.connect("window-toggled", async (_, win) => {
               const winName = win.name;
               const visible = win.visible;

               if (winName == windows_names.clipboard && visible) {
                  scrolled.set_vadjustment(null);
                  await self.set_text("");
                  self.grab_focus();
               }
            });
         }}
         placeholderText={"Search..."}
         onActivate={onEnter}
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
         <image iconName={icons.trash} pixelSize={theme["icon-size"].normal} />
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
         visible={list((l) => l.length === 0)}
      >
         <label label={"No match found"} />
      </box>
   );
}

export function ClipboardModule() {
   console.log("Clipboard: initializing module");

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
