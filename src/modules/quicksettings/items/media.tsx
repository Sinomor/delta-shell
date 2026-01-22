import AstalMpris from "gi://AstalMpris?version=0.1";
import { icons } from "@/src/lib/icons";
import Pango from "gi://Pango?version=1.0";
import { Gtk } from "ags/gtk4";
import Gio from "gi://Gio?version=2.0";
import { createBinding, For } from "ags";
import Adw from "gi://Adw?version=1";
import { config, theme } from "@/options";
import AstalApps from "gi://AstalApps?version=0.1";
import { getAppInfo, lengthStr } from "@/src/lib/utils";
import { t } from "@/i18n";
const mpris = AstalMpris.get_default();
let carousel: Adw.Carousel;

function MediaPlayer({ player }: { player: AstalMpris.Player }) {
   const title = createBinding(player, "title").as(
      (t) => t || t("modules.quicksettings.media.unknown.track")
   );
   const artist = createBinding(player, "artist").as(
      (a) => a || t("modules.quicksettings.media.unknown.artist"),
   );
   const coverArt = createBinding(player, "coverArt").as((c) =>
      Gio.file_new_for_path(c || `${DATADIR ?? SRC}/assets/defsong.jpg`),
   );
   const playIcon = createBinding(player, "playbackStatus").as((s) =>
      s === AstalMpris.PlaybackStatus.PLAYING
         ? icons.player.pause
         : icons.player.play,
   );
   const app = getAppInfo(player.entry);

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
               <image
                  iconName={app?.iconName || icons.player.icon}
                  pixelSize={theme["icon-size"].normal}
               />
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
                     <image
                        iconName={icons.player.prev}
                        pixelSize={theme["icon-size"].normal}
                     />
                  </button>
                  <button
                     onClicked={() => player.play_pause()}
                     focusOnClick={false}
                     visible={createBinding(player, "canControl")}
                  >
                     <image
                        iconName={playIcon}
                        pixelSize={theme["icon-size"].normal}
                     />
                  </button>
                  <button
                     onClicked={() => player.next()}
                     focusOnClick={false}
                     visible={createBinding(player, "canGoNext")}
                  >
                     <image
                        iconName={icons.player.next}
                        pixelSize={theme["icon-size"].normal}
                     />
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
         visible={nPages((p) => p > 1)}
         halign={Gtk.Align.START}
         valign={Gtk.Align.START}
      >
         <For each={nPages((n) => Array.from({ length: n }, (_, i) => i))}>
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
         visible={list((players) => players.length !== 0)}
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
