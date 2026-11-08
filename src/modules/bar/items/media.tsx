import BarItem from "@/src/widgets/baritem";
import { windows_names } from "@/windows";
import { config, theme } from "@/options";
import { isVertical } from "../bar";
import { icons } from "@/src/lib/icons";
import { getAppInfo, truncateByFormat } from "@/src/lib/utils";
import AstalMpris from "gi://AstalMpris?version=0.1";
import { createState, onCleanup } from "ags";

export function Media() {
   const conf = config.bar.modules.media;
   const mpris = AstalMpris.get_default();

   const [activeMedia, setActiveMedia] = createState({
      available: false,
      playing: false,
      title: "",
      artist: "",
      album: "",
      identity: "",
      entry: "",
      icon: icons.player.icon,
      playIcon: icons.player.play,
   });

   const playerConnections = new Map<AstalMpris.Player, number[]>();

   function updateMedia() {
      const players = mpris.players;
      if (!players || players.length === 0) {
         setActiveMedia({
            available: false,
            playing: false,
            title: "",
            artist: "",
            album: "",
            identity: "",
            entry: "",
            icon: icons.player.icon,
            playIcon: icons.player.play,
         });
         return;
      }

      const player =
         players.find(
            (p) => p.playbackStatus === AstalMpris.PlaybackStatus.PLAYING,
         ) || players[0];

      const isPlaying =
         player.playbackStatus === AstalMpris.PlaybackStatus.PLAYING;
      const app = getAppInfo(player.entry);

      setActiveMedia({
         available: true,
         playing: isPlaying,
         title: player.title || "Unknown Track",
         artist: player.artist || "Unknown Artist",
         album: player.album || "",
         identity: player.identity || "",
         entry: player.entry || "",
         icon: app?.iconName || icons.player.icon,
         playIcon: isPlaying ? icons.player.pause : icons.player.play,
      });
   }

   function watchPlayer(player: AstalMpris.Player) {
      if (playerConnections.has(player)) return;

      const c1 = player.connect("notify::playback-status", updateMedia);
      const c2 = player.connect("notify::title", updateMedia);
      const c3 = player.connect("notify::artist", updateMedia);
      const c4 = player.connect("notify::album", updateMedia);

      playerConnections.set(player, [c1, c2, c3, c4]);
   }

   function unwatchPlayer(player: AstalMpris.Player) {
      const conns = playerConnections.get(player);
      if (conns) {
         conns.forEach((id) => player.disconnect(id));
         playerConnections.delete(player);
      }
   }

   mpris.players.forEach(watchPlayer);

   const addedHandler = mpris.connect("player-added", (_, player) => {
      watchPlayer(player);
      updateMedia();
   });

   const closedHandler = mpris.connect("player-closed", (_, player) => {
      unwatchPlayer(player);
      updateMedia();
   });

   updateMedia();

   onCleanup(() => {
      mpris.disconnect(addedHandler);
      mpris.disconnect(closedHandler);
      for (const [player, conns] of playerConnections) {
         conns.forEach((id) => player.disconnect(id));
      }
      playerConnections.clear();
   });

   return (
      <BarItem
         window={windows_names.media}
         onPrimaryClick={conf["on-click"]}
         onSecondaryClick={conf["on-click-right"]}
         onMiddleClick={conf["on-click-middle"]}
         onScrollUp={conf["on-scroll-up"]}
         onScrollDown={conf["on-scroll-down"]}
         visible={activeMedia((m) => (!conf["hide-empty"] ? true : m.available))}
         tooltipText={activeMedia((m) =>
            m.available
               ? `${m.title} - ${m.artist} (${m.identity})`
               : "No media",
         )}
         data={{
            icon: (
               <image
                  hexpand={isVertical}
                  iconName={activeMedia((m) => m.icon)}
                  pixelSize={theme["icon-size"].normal}
               />
            ),
            "play-icon": (
               <image
                  hexpand={isVertical}
                  iconName={activeMedia((m) => m.playIcon)}
                  pixelSize={theme["icon-size"].normal}
               />
            ),
            title: (
               <label
                  hexpand={isVertical}
                  label={activeMedia((m) =>
                     truncateByFormat(m.title, "title", conf.format),
                  )}
               />
            ),
            artist: (
               <label
                  hexpand={isVertical}
                  label={activeMedia((m) =>
                     truncateByFormat(m.artist, "artist", conf.format),
                  )}
               />
            ),
            album: (
               <label
                  hexpand={isVertical}
                  label={activeMedia((m) =>
                     truncateByFormat(m.album, "album", conf.format),
                  )}
               />
            ),
            identity: (
               <label
                  hexpand={isVertical}
                  label={activeMedia((m) =>
                     truncateByFormat(m.identity, "identity", conf.format),
                  )}
               />
            ),
            status: (
               <label
                  hexpand={isVertical}
                  label={activeMedia((m) => (m.playing ? "Playing" : "Paused"))}
               />
            ),
         }}
         format={conf.format}
      />
   );
}
