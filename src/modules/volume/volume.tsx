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

function DefaultOutput() {
   const audio = wp.audio!;
   const defaultOutput = audio.defaultSpeaker;
   const level = createBinding(defaultOutput, "volume");
   let dropdownbox: Gtk.Box;

   return (
      <box orientation={Gtk.Orientation.VERTICAL} spacing={theme.spacing}>
         <label label={"Output"} halign={Gtk.Align.START} />
         <button
            focusOnClick={false}
            onClicked={(self) => {
               const menu = new Gio.Menu();
               const Popover = Gtk.PopoverMenu.new_from_model(menu);

               const action = new Gio.SimpleAction({
                  name: "select-speaker",
                  parameter_type: new GLib.VariantType("i"),
               });

               action.connect("activate", (_, parameter) => {
                  if (parameter === null) return;
                  const speakerIndex = parameter.get_int32();

                  if (audio.speakers[speakerIndex]) {
                     audio.speakers[speakerIndex].set_is_default(true);
                  }
               });
               app.add_action(action);

               audio.speakers.forEach((speaker, index) => {
                  menu.append(
                     speaker.description,
                     `app.select-speaker(${index})`,
                  );
               });

               Popover.set_parent(dropdownbox);
               Popover.popup();
            }}
            class={"dropdown"}
         >
            <box hexpand $={(self) => (dropdownbox = self)}>
               <label
                  label={createBinding(defaultOutput, "description").as(
                     (desc) => `${desc}`,
                  )}
                  hexpand
                  halign={Gtk.Align.START}
                  ellipsize={Pango.EllipsizeMode.END}
                  maxWidthChars={25}
               />
               <image iconName={icons.arrow.down} pixelSize={20} />
            </box>
         </button>
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
         <button
            onClicked={(self) => {
               const menu = new Gio.Menu();
               const Popover = Gtk.PopoverMenu.new_from_model(menu);

               const action = new Gio.SimpleAction({
                  name: "select-speaker",
                  parameter_type: new GLib.VariantType("i"),
               });

               action.connect("activate", (_, parameter) => {
                  if (parameter === null) return;
                  const microphoneIndex = parameter.get_int32();

                  if (audio.microphones[microphoneIndex]) {
                     audio.microphones[microphoneIndex].set_is_default(true);
                  }
               });
               app.add_action(action);

               audio.microphones.forEach((speaker, index) => {
                  menu.append(
                     speaker.description,
                     `app.select-speaker(${index})`,
                  );
               });

               Popover.set_parent(dropdownbox);
               Popover.popup();
            }}
            class={"dropdown"}
         >
            <box hexpand $={(self) => (dropdownbox = self)}>
               <label
                  label={createBinding(defaultMicrophone, "description").as(
                     (desc) => `${desc}`,
                  )}
                  hexpand
                  halign={Gtk.Align.START}
                  ellipsize={Pango.EllipsizeMode.END}
                  maxWidthChars={25}
               />
               <image iconName={icons.arrow.down} pixelSize={20} />
            </box>
         </button>
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
