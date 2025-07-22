import app from "ags/gtk4/app";
import { Gtk } from "ags/gtk4";
import { bash, dependencies } from "../../../utils/utils";
import { icons } from "../../../utils/icons";
import { ClipImage } from "../items/clip_image";
import { ClipText } from "../items/clip_text";
import { ClipColor } from "../items/clip_color";
import { createComputed, createState, For, onCleanup } from "ags";
import options from "@/options";
const { name, page } = options.launcher;

const colorPatterns = {
   hex: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
   rgb: /^rgb\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*\)$/,
   rgba: /^rgba\(\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*(\d{1,3}%?)\s*,\s*([01]?\.\d+)\s*\)$/,
   hsl: /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3}%)\s*,\s*(\d{1,3}%)\s*\)$/,
   hsla: /^hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3}%)\s*,\s*(\d{1,3}%)\s*,\s*([01]?\.\d+|\d{1,3}%?)\s*\)$/,
};

const imagePattern = /\[\[ binary data (\d+) (KiB|MiB) (\w+) (\d+)x(\d+) \]\]/;

const [text, text_set] = createState("");
const [cachedList, cachedList_set] = createState<string[]>([]);
let scrolled: Gtk.ScrolledWindow;

const list = createComputed([cachedList, text], (cachedList, text) => {
   return cachedList.filter((entry) => {
      if (!text) return true;
      const content = entry.split("\t").slice(1).join(" ").trim();
      return content.toLowerCase().includes(text.toLowerCase());
   });
});

async function loadInitialList() {
   if (!dependencies("cliphist")) return;

   try {
      const list = await bash("cliphist list");
      cachedList_set(list.split("\n").filter((line) => line.trim()));
      text_set("init");
      text_set("");
   } catch (error) {
      console.error("Failed to load clipboard history:", error);
   }
}
bash(
   `killall -INT wl-paste;
   wl-paste --watch cliphist -max-items ${options.launcher.clipboard.max_items.get()} store`,
);

function ClipButton({ item }: { item: string }) {
   const [id, ...contentParts] = item.split("\t");
   const content = contentParts.join(" ").trim();
   const isImage = content.match(imagePattern);
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

   return (
      <entry
         hexpand
         $={(self) => {
            appconnect = app.connect("window-toggled", async (_, win) => {
               const winName = win.name;
               const visible = win.visible;
               const mode = page.get() == "clipboard";

               if (winName == name && visible && mode) {
                  scrolled.set_vadjustment(null);
                  await loadInitialList();
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

function Clear() {
   return (
      <button
         class={"clear"}
         focusOnClick={false}
         onClicked={async () => {
            bash("cliphist wipe");
            await loadInitialList();
         }}
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
            spacing={options.theme.spacing}
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

export function Clipboard() {
   return (
      <box
         name={"clipboard"}
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
