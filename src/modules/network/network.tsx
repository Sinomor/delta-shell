import AstalNetwork from "gi://AstalNetwork";
import { bash } from "@/src/lib/utils";
import { icons, getAccessPointIcon } from "@/src/lib/icons";
import { Gtk } from "ags/gtk4";
import { createBinding, createComputed, For } from "ags";
import { theme } from "@/options";
import { qs_page_set } from "../quicksettings/quicksettings";
import { t } from "@/i18n";
const network = AstalNetwork.get_default();

function ScanningIndicator() {
   const className = createBinding(network.wifi, "scanning").as((scanning) => {
      const classes = ["scanning"];
      if (scanning) classes.push("active");
      return classes;
   });

   return (
      <image
         iconName={icons.refresh}
         pixelSize={theme["icon-size"].normal}
         cssClasses={className}
      />
   );
}

function Header({ showArrow = false }: { showArrow?: boolean }) {
   return (
      <box class={"header"} spacing={theme.spacing}>
         {showArrow && (
            <button
               cssClasses={["qs-header-button", "qs-page-prev"]}
               focusOnClick={false}
               onClicked={() => qs_page_set("main")}
            >
               <image
                  iconName={icons.arrow.left}
                  pixelSize={theme["icon-size"].normal}
               />
            </button>
         )}
         <label
            label={t("modules.network.wifi")}
            halign={Gtk.Align.START}
            valign={Gtk.Align.CENTER}
         />
         <box hexpand />
         <button
            cssClasses={["qs-header-button", "qs-page-refresh", "refresh"]}
            focusOnClick={false}
            onClicked={() => network.wifi.scan()}
         >
            <ScanningIndicator />
         </button>
         <switch
            class={"toggle"}
            valign={Gtk.Align.CENTER}
            active={createBinding(network.wifi, "enabled")}
            onNotifyActive={({ state }) => network.wifi.set_enabled(state)}
         />
      </box>
   );
}

type ItemProps = {
   accessPoint: AstalNetwork.AccessPoint;
};

function Item({ accessPoint }: ItemProps) {
   const connected = createBinding(network.wifi, "ssid").as(
      (ssid) => ssid === accessPoint.ssid,
   );

   return (
      <button
         class={"page-button"}
         onClicked={() => {
            console.log(`Network: connecting to '${accessPoint.ssid}'`);
            bash(`nmcli device wifi connect ${accessPoint.bssid}`)
               .then(() =>
                  console.log(`Network: connected to '${accessPoint.ssid}'`),
               )
               .catch((err) =>
                  console.error(
                     `Network: failed to connect to '${accessPoint.ssid}':`,
                     err,
                  ),
               );
         }}
         focusOnClick={false}
      >
         <box spacing={theme.spacing}>
            <image
               iconName={getAccessPointIcon(accessPoint)}
               pixelSize={theme["icon-size"].normal}
            />
            <label label={accessPoint.ssid} />
            <box hexpand />
            <image
               iconName={icons.check}
               pixelSize={theme["icon-size"].normal}
               visible={connected}
            />
         </box>
      </button>
   );
}

function List() {
   const ssid = createBinding(network.wifi, "ssid");
   const accessPoints = createBinding(network.wifi, "accessPoints");
   const list = createComputed(() => {
      return accessPoints()
         .filter((ap) => !!ap.ssid)
         .sort((a, b) => b.strength - a.strength)
         .sort((a, b) => Number(ssid() === b.ssid) - Number(ssid() === a.ssid));
   });

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

export function NetworkModule({ showArrow = false }: { showArrow?: boolean }) {
   console.log("Network: initializing module");

   return (
      <box
         class={"network"}
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
