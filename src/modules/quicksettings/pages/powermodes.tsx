import { icons } from "@/src/lib/icons";
import { Gtk } from "ags/gtk4";
import AstalPowerProfiles from "gi://AstalPowerProfiles?version=0.1";
import { createBinding } from "ags";
import { theme } from "@/options";
import { qs_page_set } from "../quicksettings";

const power = AstalPowerProfiles.get_default();

function Header() {
   return (
      <box class={"header"} spacing={theme.spacing}>
         <button
            cssClasses={["qs-header-button", "qs-page-prev"]}
            focusOnClick={false}
            onClicked={() => qs_page_set("main")}
         >
            <image iconName={icons.arrow.left} pixelSize={20} />
         </button>
         <label
            label={"Power Modes"}
            halign={Gtk.Align.START}
            valign={Gtk.Align.CENTER}
         />
         <box hexpand />
      </box>
   );
}

export const profiles_names = {
   "power-saver": "Power Saver",
   balanced: "Balanced",
   performance: "Performance",
} as Record<string, any>;

function Item({ profile }: { profile: string }) {
   const isConnected = createBinding(power, "activeProfile").as(
      (p) => p === profile,
   );

   function setProfile(profile: string) {
      power.set_active_profile(profile);
   }

   return (
      <button
         class="page-button"
         onClicked={() => setProfile(profile)}
         focusOnClick={false}
      >
         <box spacing={theme.spacing}>
            <image iconName={icons.powerprofiles[profile]} pixelSize={24} />
            <label label={profiles_names[profile]} />
            <box hexpand />
            <image
               iconName={icons.check}
               pixelSize={20}
               visible={isConnected}
            />
         </box>
      </button>
   );
}

function List() {
   const list = power.get_profiles();

   return (
      <scrolledwindow>
         <box
            orientation={Gtk.Orientation.VERTICAL}
            spacing={theme.spacing}
            vexpand
         >
            {list.map(({ profile }) => (
               <Item profile={profile} />
            ))}
         </box>
      </scrolledwindow>
   );
}

export function PowerModesPage() {
   return (
      <box
         $type={"named"}
         name={"powermodes"}
         heightRequest={500}
         widthRequest={410}
         cssClasses={["qs-menu-page", "bluetooth-page"]}
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
      >
         <Header />
         <List />
      </box>
   );
}
