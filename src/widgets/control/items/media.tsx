import AstalMpris from "gi://AstalMpris?version=0.1";
import { icons } from "@/src/lib/icons";
import Pango from "gi://Pango?version=1.0";
import { Gtk } from "ags/gtk4";
import Gio from "gi://Gio?version=2.0";
import { createBinding, For } from "ags";
import Adw from "gi://Adw?version=1";
import { config, theme } from "@/options";
const mpris = AstalMpris.get_default();
let carousel: Adw.Carousel;

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

   const PlayerTitle = () => (
      <label
         label={title}
         class={"title"}
         hexpand
         ellipsize={Pango.EllipsizeMode.END}
         halign={Gtk.Align.START}
         maxWidthChars={30}
      />
   );

   const PlayerIcon = () => (
      <image iconName={icons.player.icon} pixelSize={22} />
   );

   const PlayerArtist = () => (
      <label
         label={artist}
         halign={Gtk.Align.START}
         valign={Gtk.Align.CENTER}
         ellipsize={Pango.EllipsizeMode.END}
         maxWidthChars={35}
      />
   );

   const ButtonPrev = () => (
      <button
         onClicked={() => player.previous()}
         focusOnClick={false}
         visible={createBinding(player, "canGoPrevious")}
         iconName={icons.player.prev}
      >
         <image iconName={icons.player.prev} pixelSize={22} />
      </button>
   );

   const ButtonPlay = () => (
      <button
         onClicked={() => player.play_pause()}
         focusOnClick={false}
         visible={createBinding(player, "canControl")}
      >
         <image iconName={playIcon} pixelSize={22} />
      </button>
   );

   const ButtonNext = () => (
      <button
         onClicked={() => player.next()}
         focusOnClick={false}
         visible={createBinding(player, "canGoNext")}
      >
         <image iconName={icons.player.next} pixelSize={22} />
      </button>
   );

   const Buttons = () => (
      <box spacing={theme.spacing} vexpand valign={Gtk.Align.END}>
         <ButtonPrev />
         <ButtonPlay />
         <ButtonNext />
      </box>
   );

   const Content = () => (
      <box
         $type="overlay"
         orientation={Gtk.Orientation.VERTICAL}
         class={"mediaplayer"}
         spacing={theme.spacing}
      >
         <box class={"title"}>
            <PlayerTitle />
            <PlayerIcon />
         </box>
         <PlayerArtist />
         <box class={"actions"}>
            <box hexpand />
            <Buttons />
         </box>
      </box>
   );

   const PlayerArt = () => (
      <Gtk.ScrolledWindow canFocus={false} opacity={0.5}>
         <Gtk.Picture
            file={coverArt}
            class={"mediaplayer-art"}
            contentFit={Gtk.ContentFit.COVER}
         />
      </Gtk.ScrolledWindow>
   );

   return (
      <overlay hexpand class={"mediaplayer-lower"}>
         <PlayerArt />
         <Content />
      </overlay>
   );
}

function CustomIndicator({ carousel }: { carousel: Adw.Carousel }) {
   const position = createBinding(carousel, "position");
   const nPages = createBinding(carousel, "n_pages");

   return (
      <box
         class="indicator"
         spacing={theme.spacing}
         visible={nPages.as((p) => p > 1)}
         halign={Gtk.Align.START}
         valign={Gtk.Align.END}
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
         heightRequest={130}
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
         <CustomIndicator carousel={carousel} $type={"overlay"} />
      </overlay>
   );
}
