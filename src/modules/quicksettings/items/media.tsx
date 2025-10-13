import AstalMpris from "gi://AstalMpris?version=0.1";
import { icons } from "@/src/lib/icons";
import Pango from "gi://Pango?version=1.0";
import { Gtk } from "ags/gtk4";
import Gio from "gi://Gio?version=2.0";
import { createBinding, For } from "ags";
import Adw from "gi://Adw?version=1";
import { config, theme } from "@/options";
import AstalApps from "gi://AstalApps?version=0.1";
const mpris = AstalMpris.get_default();
let carousel: Adw.Carousel;

const application = new AstalApps.Apps();

function lengthStr(length: number) {
   const hours = Math.floor(length / 3600);
   const minutes = Math.floor((length % 3600) / 60);
   const seconds = Math.floor(length % 60);

   const min0 = minutes < 10 ? "0" : "";
   const sec0 = seconds < 10 ? "0" : "";

   if (hours > 0) {
      return `${hours}:${min0}${minutes}:${sec0}${seconds}`;
   }
   return `${minutes}:${sec0}${seconds}`;
}

function playerIcon(entry: string) {
   for (const app of application.list) {
      if (
         entry &&
         app.entry.split(".desktop")[0].toLowerCase().match(entry.toLowerCase())
      ) {
         return app.iconName;
      }
   }
   return icons.player.play;
}

function MediaPlayer({ player }: { player: AstalMpris.Player }) {
   const title = createBinding(player, "title").as((t) => t || "Unknown Track");
   const artist = createBinding(player, "artist").as(
      (a) => a || "Unknown Artist",
   );
   const coverArt = createBinding(player, "coverArt").as((c) =>
      Gio.file_new_for_path(c || `${DATADIR ?? SRC}/assets/defsong.jpg`),
   );
   const playIcon = createBinding(player, "playbackStatus").as((s) =>
      s === AstalMpris.PlaybackStatus.PLAYING
         ? icons.player.pause
         : icons.player.play,
   );

   function Content() {
      return (
         <box
            $type={"overlay"}
            class={"content"}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={theme.spacing}
         >
            <box spacing={theme.spacing}>
               <box hexpand />
               <image iconName={playerIcon(player.entry)} pixelSize={22} />
               <label label={player.identity} />
            </box>
            <box orientation={Gtk.Orientation.VERTICAL} spacing={5}>
               <label
                  class={"title"}
                  label={title}
                  hexpand
                  valign={Gtk.Align.START}
                  ellipsize={Pango.EllipsizeMode.END}
                  halign={Gtk.Align.START}
                  maxWidthChars={30}
               />
               <label
                  label={artist}
                  halign={Gtk.Align.START}
                  valign={Gtk.Align.END}
                  ellipsize={Pango.EllipsizeMode.END}
                  maxWidthChars={35}
               />
            </box>
            <box>
               <box
                  valign={Gtk.Align.END}
                  visible={createBinding(player, "length").as((l) => l > 0)}
               >
                  <label
                     cssClasses={["position"]}
                     label={createBinding(player, "position").as(lengthStr)}
                  />
                  <label label={" / "} />
                  <label
                     cssClasses={["length"]}
                     label={createBinding(player, "length").as((l) =>
                        l > 0 ? lengthStr(l) : "0:00",
                     )}
                  />
               </box>
               <box hexpand />
               <box
                  class={"buttons"}
                  spacing={theme.spacing}
                  vexpand
                  valign={Gtk.Align.END}
               >
                  <button
                     onClicked={() => player.previous()}
                     focusOnClick={false}
                     visible={createBinding(player, "canGoPrevious")}
                  >
                     <image iconName={icons.player.prev} pixelSize={22} />
                  </button>
                  <button
                     onClicked={() => player.play_pause()}
                     focusOnClick={false}
                     visible={createBinding(player, "canControl")}
                  >
                     <image iconName={playIcon} pixelSize={22} />
                  </button>
                  <button
                     onClicked={() => player.next()}
                     focusOnClick={false}
                     visible={createBinding(player, "canGoNext")}
                  >
                     <image iconName={icons.player.next} pixelSize={22} />
                  </button>
               </box>
            </box>
         </box>
      );
   }

   function Art() {
      return (
         <Adw.Clamp $type={"overlay"} opacity={0.5}>
            <Gtk.Picture
               file={coverArt}
               class={"art"}
               contentFit={Gtk.ContentFit.COVER}
            />
         </Adw.Clamp>
      );
   }

   return (
      <overlay hexpand class={"mediaplayer"}>
         <Art />
         <Content />
      </overlay>
   );
}

function CustomIndicator({ carousel }: { carousel: Adw.Carousel }) {
   const position = createBinding(carousel, "position");
   const nPages = createBinding(carousel, "n_pages");

   return (
      <box
         $type={"overlay"}
         class={"indicator"}
         spacing={theme.spacing}
         visible={nPages.as((p) => p > 1)}
         halign={Gtk.Align.START}
         valign={Gtk.Align.START}
      >
         <For each={nPages.as((n) => Array.from({ length: n }, (_, i) => i))}>
            {(index) => (
               <box
                  class={position.as((pos) =>
                     pos === index ? "active-dot" : "inactive-dot",
                  )}
               />
            )}
         </For>
      </box>
   );
}

export function MprisPlayers() {
   const list = createBinding(mpris, "players");

   return (
      <overlay
         heightRequest={160}
         visible={list.as((players) => players.length !== 0)}
      >
         <Adw.Carousel
            spacing={theme.spacing}
            $={(self) => (carousel = self)}
            $type={"overlay"}
         >
            <For each={list}>
               {(player: AstalMpris.Player) => <MediaPlayer player={player} />}
            </For>
         </Adw.Carousel>
         <CustomIndicator carousel={carousel} />
      </overlay>
   );
}
