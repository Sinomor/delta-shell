import { icons } from "@/src/lib/icons";
import { Gtk } from "ags/gtk4";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
import { timeout } from "ags/time";
import { createBinding, createComputed, For } from "ags";
import { theme } from "@/options";
import { qs_page, qs_page_set } from "../quicksettings/quicksettings";
import app from "ags/gtk4/app";
import { windows_names } from "@/windows";
const bluetooth = AstalBluetooth.get_default();

function ScanningIndicator() {
   const className = createBinding(bluetooth.adapter, "discovering").as(
      (scanning) => {
         const classes = ["scanning"];
         if (scanning) classes.push("active");
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
            onNotifyActive={({ state }) => {
               if (
                  qs_page.peek() === "bluetooth" ||
                  app.get_window(windows_names.bluetooth)?.visible
               )
                  bluetooth.adapter.set_powered(state);
            }}
         />
      </box>
   );
}

type ItemProps = {
   device: AstalBluetooth.Device;
};

function Item({ device }: ItemProps) {
   const connected = createBinding(device, "connected");
   const percentage = createBinding(device, "batteryPercentage");

   return (
      <button
         class={"page-button"}
         onClicked={() => {
            if (!bluetooth.isPowered) {
               console.log("Bluetooth: powering on adapter");
               bluetooth.toggle();
            }

            console.log(`Bluetooth: connecting to '${device.name}'`);

            timeout(100, () => {
               device.connect_device((result, error) => {
                  if (error) {
                     console.error(
                        `Bluetooth: failed to connect to '${device.name}':`,
                        error,
                     );
                  } else {
                     console.log(`Bluetooth: connected to '${device.name}'`);
                  }
               });
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
               label={percentage.as((p) => `${Math.round(p * 100)}%`)}
               visible={createComputed(() => {
                  return connected() && percentage() > 0;
               })}
            />
            <box hexpand />
            <image iconName={icons.check} pixelSize={20} visible={connected} />
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
