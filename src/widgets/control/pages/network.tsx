import AstalNetwork from "gi://AstalNetwork";
import { bash } from "@/src/lib/utils";
import { icons, getAccessPointIcon } from "@/src/lib/icons";
import { Gtk } from "ags/gtk4";
import { createBinding, For } from "ags";
import { theme } from "@/options";
import { control_page_set } from "../control";
const network = AstalNetwork.get_default();

function ScanningIndicator() {
   const className = createBinding(network.wifi, "scanning").as((scanning) => {
      const classes = ["scanning"];
      if (scanning) {
         classes.push("active");
      }
      return classes;
   });

   return (
      <image iconName={icons.refresh} pixelSize={20} cssClasses={className} />
   );
}

function Header() {
   return (
      <box class={"header"} spacing={theme.spacing}>
         <button
            cssClasses={["qs-header-button", "qs-page-prev"]}
            focusOnClick={false}
            onClicked={() => control_page_set("main")}
         >
            <image iconName={icons.arrow.left} pixelSize={20} />
         </button>
         <label
            label={"Wi-Fi"}
            halign={Gtk.Align.START}
            valign={Gtk.Align.CENTER}
         />
         <box hexpand />
         <button
            cssClasses={["qs-header-button", "qs-page-refresh"]}
            focusOnClick={false}
            onClicked={() => network.wifi.scan()}
         >
            <ScanningIndicator />
         </button>
      </box>
   );
}

type ItemProps = {
   accessPoint: AstalNetwork.AccessPoint;
};

function Item({ accessPoint }: ItemProps) {
   const isConnected = createBinding(network.wifi, "ssid").as(
      (ssid) => ssid === accessPoint.ssid,
   );

   return (
      <button
         class="page-button"
         onClicked={() =>
            bash(`nmcli device wifi connect ${accessPoint.bssid}`)
         }
         focusOnClick={false}
      >
         <box spacing={theme.spacing}>
            <image iconName={getAccessPointIcon(accessPoint)} pixelSize={20} />
            <label label={accessPoint.ssid} />
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
   const list = createBinding(network.wifi, "accessPoints").as((aps) =>
      aps.filter((ap) => !!ap.ssid).sort((a, b) => b.strength - a.strength),
   );

   return (
      <scrolledwindow>
         <box
            orientation={Gtk.Orientation.VERTICAL}
            spacing={theme.spacing}
            vexpand
         >
            <For each={list}>{(ap) => <Item accessPoint={ap} />}</For>
         </box>
      </scrolledwindow>
   );
}

export function NetworkPage() {
   return (
      <box
         $type={"named"}
         name={"network"}
         heightRequest={500}
         cssClasses={["qs-menu-page", "wifi-page"]}
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
      >
         <Header />
         <List />
      </box>
   );
}
