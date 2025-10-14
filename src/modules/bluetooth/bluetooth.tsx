import { icons } from "@/src/lib/icons";
import { Gtk } from "ags/gtk4";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
import { interval, timeout } from "ags/time";
import { createBinding, createComputed, For } from "ags";
import { theme } from "@/options";
import { qs_page, qs_page_set } from "../quicksettings/quicksettings";
const bluetooth = AstalBluetooth.get_default();

function ScanningIndicator() {
   const className = createBinding(bluetooth.adapter, "discovering").as(
      (scanning) => {
         const classes = ["scanning"];
         if (scanning) {
            classes.push("active");
         }
         return classes;
      },
   );

   return (
      <image iconName={icons.refresh} pixelSize={20} cssClasses={className} />
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
               <image iconName={icons.arrow.left} pixelSize={20} />
            </button>
         )}
         <label
            label={"Bluetooth"}
            halign={Gtk.Align.START}
            valign={Gtk.Align.CENTER}
         />
         <box hexpand />
         <button
            cssClasses={["qs-header-button", "qs-page-refresh"]}
            focusOnClick={false}
            onClicked={() => {
               if (bluetooth.adapter.discovering) {
                  bluetooth.adapter.stop_discovery();
               } else {
                  bluetooth.adapter.start_discovery();
               }
            }}
         >
            <ScanningIndicator />
         </button>
         <switch
            class={"toggle"}
            valign={Gtk.Align.CENTER}
            active={createBinding(bluetooth, "isPowered")}
            onNotifyActive={() =>
               qs_page.get() === "bluetooth" && bluetooth.toggle()
            }
         />
      </box>
   );
}

type ItemProps = {
   device: AstalBluetooth.Device;
};

function Item({ device }: ItemProps) {
   const isConnected = createBinding(device, "connected").as(
      (connected) => connected,
   );
   const percentage = createBinding(device, "batteryPercentage");

   return (
      <button
         class={"page-button"}
         onClicked={() => {
            if (!bluetooth.isPowered) {
               bluetooth.toggle();
            }
            timeout(100, () => {
               device.connect_device(() => {});
            });
         }}
         focusOnClick={false}
      >
         <box spacing={theme.spacing}>
            <image
               iconName={
                  device.icon === null
                     ? icons.bluetooth
                     : device.icon + "-symbolic"
               }
            />
            <label label={device.name} />
            <label
               class={"bluetooth-device-percentage"}
               label={percentage.as((p) => `${Math.round(p * 100)}%`)}
               visible={createComputed(
                  [percentage, isConnected],
                  (percentage, isConnected) => {
                     return isConnected && percentage > 0;
                  },
               )}
            />
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
   const list = createBinding(bluetooth, "devices").as((devices) =>
      devices
         .filter((device) => device.name !== null)
         .sort((a, b) => Number(b.connected) - Number(a.connected)),
   );

   return (
      <scrolledwindow>
         <box
            orientation={Gtk.Orientation.VERTICAL}
            spacing={theme.spacing}
            vexpand
         >
            <For each={list}>{(device) => <Item device={device} />}</For>
         </box>
      </scrolledwindow>
   );
}

export function BluetoothModule({
   showArrow = false,
}: {
   showArrow?: boolean;
}) {
   return (
      <box
         class={"bluetooth"}
         heightRequest={500}
         widthRequest={410}
         orientation={Gtk.Orientation.VERTICAL}
         spacing={theme.spacing}
      >
         <Header showArrow={showArrow} />
         <List />
      </box>
   );
}
