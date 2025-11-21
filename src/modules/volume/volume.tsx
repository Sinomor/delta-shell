import { icons, VolumeIcon } from "@/src/lib/icons";
import { Gdk, Gtk } from "ags/gtk4";
import { createBinding, For } from "ags";
import AstalWp from "gi://AstalWp?version=0.1";
import Pango from "gi://Pango?version=1.0";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import app from "ags/gtk4/app";
import { timeout } from "ags/time";
import { theme } from "@/options";
import { qs_page_set } from "../quicksettings/quicksettings";
import { getAppInfo } from "@/src/lib/utils";
import Adw from "gi://Adw?version=1";
const wp = AstalWp.get_default()!;

function Header({ showArrow = false }: { showArrow?: boolean }) {
   return (
      <box class={"header"} spacing={theme.spacing}>
         {showArrow && (
            <button
               cssClasses={["qs-header-button", "qs-page-prev"]}
               focusOnClick={false}
               onClicked={() => qs_page_set("main")}
            >
               <image iconName={icons.arrow.left} pixelSize={20} />
            </button>
         )}
         <label
            label={"Volume"}
            halign={Gtk.Align.START}
            valign={Gtk.Align.CENTER}
         />
         <box hexpand />
      </box>
   );
}

function StreamsList() {
   const audio = wp.audio!;
   const streams = createBinding(audio, "streams");

   return (
      <box
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
         visible={streams.as((l) => l.length > 0)}
      >
         <label label={"Applications"} halign={Gtk.Align.START} />
         <For each={streams}>
            {(stream) => {
               const name = createBinding(stream, "name");
               const app = getAppInfo(stream.description);

               return (
                  <box
                     spacing={theme.spacing}
                     cssClasses={["slider-box", "volume-box"]}
                  >
                     <image
                        iconName={
                           app?.icon_name ||
                           stream.icon ||
                           "audio-volume-high-symbolic"
                        }
                        pixel_size={24}
                     />
                     <box
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={theme.spacing / 2}
                     >
                        <label
                           label={name.as(
                              (name) =>
                                 `${app?.name || stream.description}: ${name}`,
                           )}
                           halign={Gtk.Align.START}
                           ellipsize={Pango.EllipsizeMode.END}
                           maxWidthChars={25}
                        />
                        <slider
                           onChangeValue={({ value }) => {
                              stream.volume = value;
                           }}
                           hexpand
                           value={createBinding(stream, "volume")}
                        />
                     </box>
                  </box>
               );
            }}
         </For>
      </box>
   );
}

function createFactory(maxWidth?: number, wrap = false) {
   const factory = new Gtk.SignalListItemFactory();

   factory.connect("setup", (_, listItem: Gtk.ListItem) => {
      const label = new Gtk.Label({
         xalign: 0,
         hexpand: true,
         ...(maxWidth && {
            ellipsize: Pango.EllipsizeMode.END,
            maxWidthChars: maxWidth,
         }),
         ...(wrap && {
            wrap: true,
            wrapMode: Pango.WrapMode.WORD_CHAR,
         }),
      });
      listItem.set_child(label);
   });

   factory.connect("bind", (_, listItem: Gtk.ListItem) => {
      const label = listItem.get_child() as Gtk.Label;
      const stringObject = listItem.get_item() as Gtk.StringObject;
      label.set_label(stringObject.get_string());
   });

   return factory;
}

function DefaultOutput() {
   const audio = wp.audio!;
   const defaultOutput = audio.defaultSpeaker;
   const level = createBinding(defaultOutput, "volume");
   let dropdownbox: Gtk.Box;

   return (
      <box orientation={Gtk.Orientation.VERTICAL} spacing={theme.spacing}>
         <label label={"Output"} halign={Gtk.Align.START} />
         <Adw.Clamp maximumSize={410 - theme.window.padding * 2}>
            <Gtk.DropDown
               model={createBinding(
                  audio,
                  "speakers",
               )((speakers) => {
                  const list = new Gtk.StringList();
                  speakers.map((speaker) => list.append(speaker.description));
                  return list;
               })}
               selected={createBinding(
                  audio,
                  "speakers",
               )((speakers) => {
                  return speakers.findIndex((speaker) => speaker.isDefault);
               })}
               factory={createFactory(20)}
               listFactory={createFactory()}
               onNotifySelected={({ selected }) =>
                  audio.speakers[selected].set_is_default(true)
               }
            />
         </Adw.Clamp>
         <box
            cssClasses={["slider-box", "volume-box"]}
            spacing={theme.spacing}
            valign={Gtk.Align.CENTER}
         >
            <image
               iconName={VolumeIcon}
               pixelSize={20}
               valign={Gtk.Align.CENTER}
               halign={Gtk.Align.START}
            />
            <slider
               onChangeValue={({ value }) => defaultOutput.set_volume(value)}
               hexpand
               value={level}
            />
         </box>
      </box>
   );
}

function DefaultMicrophone() {
   const audio = wp.audio!;
   const defaultMicrophone = audio.defaultMicrophone;
   const level = createBinding(defaultMicrophone, "volume");

   let dropdownbox: Gtk.Box;

   return (
      <box orientation={Gtk.Orientation.VERTICAL} spacing={theme.spacing}>
         <label label={"Microphone"} halign={Gtk.Align.START} />
         <Adw.Clamp maximumSize={410 - theme.window.padding * 2}>
            <Gtk.DropDown
               model={createBinding(
                  audio,
                  "microphones",
               )((microphones) => {
                  const list = new Gtk.StringList();
                  microphones.map((microphone) =>
                     list.append(microphone.description),
                  );
                  return list;
               })}
               selected={createBinding(
                  audio,
                  "microphones",
               )((microphones) => {
                  return microphones.findIndex(
                     (microphone) => microphone.isDefault,
                  );
               })}
               factory={createFactory(20)}
               listFactory={createFactory()}
               onNotifySelected={({ selected }) =>
                  audio.microphones[selected].set_is_default(true)
               }
            />
         </Adw.Clamp>
         <box
            cssClasses={["slider-box", "volume-box"]}
            spacing={theme.spacing}
            valign={Gtk.Align.CENTER}
         >
            <image
               iconName={icons.microphone.default}
               pixelSize={20}
               valign={Gtk.Align.CENTER}
               halign={Gtk.Align.START}
            />
            <slider
               onChangeValue={({ value }) =>
                  defaultMicrophone.set_volume(value)
               }
               hexpand
               value={level}
            />
         </box>
      </box>
   );
}

function List() {
   return (
      <Gtk.ScrolledWindow>
         <box
            orientation={Gtk.Orientation.VERTICAL}
            spacing={theme.spacing * 2}
            vexpand
         >
            <StreamsList />
            <DefaultOutput />
            <DefaultMicrophone />
         </box>
      </Gtk.ScrolledWindow>
   );
}

export function VolumeModule({ showArrow = false }: { showArrow?: boolean }) {
   return (
      <box
         class={"volume"}
         heightRequest={500 - theme.window.padding * 2}
         widthRequest={410 - theme.window.padding * 2}
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
      >
         <Header showArrow={showArrow} />
         <List />
      </box>
   );
}
