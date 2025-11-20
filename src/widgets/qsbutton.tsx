import Pango from "gi://Pango";
import { icons } from "@/src/lib/icons";
import { Gtk } from "ags/gtk4";
import { Accessor } from "ags";
import Adw from "gi://Adw?version=1";
import { attachHoverScroll } from "../lib/utils";

type QSButtonProps = {
   icon: string | Accessor<string>;
   label: string;
   subtitle?: Accessor<string>;
   arrow?: "none" | "separate" | "inside";
   onClicked: () => void;
   onArrowClicked?: () => void;
   onScrollDown?: () => void;
   onScrollUp?: () => void;
   ButtonClasses: string[] | Accessor<string[]>;
   ArrowClasses?: string[] | Accessor<string[]>;
   maxWidthChars?: number;
};

export function QSButton({
   icon,
   label,
   subtitle,
   onClicked,
   arrow = "none",
   onArrowClicked = () => {},
   onScrollUp = () => {},
   onScrollDown = () => {},
   ButtonClasses,
   ArrowClasses,
   maxWidthChars = 10,
}: QSButtonProps) {
   return (
      <Adw.Clamp class={"qs-button"} maximumSize={200}>
         <box
            widthRequest={200}
            $={(self) => {
               attachHoverScroll(self, ({ dy }) => {
                  if (dy < 0) onScrollUp();
                  if (dy > 0) onScrollDown();
               });
            }}
         >
            <button
               onClicked={onClicked}
               cssClasses={ButtonClasses}
               hexpand
               focusOnClick={false}
            >
               <box spacing={10} hexpand valign={Gtk.Align.CENTER}>
                  <image pixelSize={22} iconName={icon} />
                  <box orientation={Gtk.Orientation.VERTICAL}>
                     <label
                        class={"qs-button-label"}
                        label={label}
                        ellipsize={Pango.EllipsizeMode.END}
                        halign={Gtk.Align.START}
                        valign={Gtk.Align.CENTER}
                     />
                     {subtitle && (
                        <label
                           class={"qs-button-subtitle"}
                           label={subtitle}
                           halign={Gtk.Align.START}
                           valign={Gtk.Align.CENTER}
                           visible={subtitle.as((s) => s !== "None")}
                           maxWidthChars={maxWidthChars}
                           ellipsize={Pango.EllipsizeMode.END}
                        />
                     )}
                  </box>
                  {arrow === "inside" && (
                     <image
                        iconName={icons.arrow.right}
                        class={"arrow-label"}
                        pixelSize={22}
                        hexpand
                        valign={Gtk.Align.CENTER}
                        halign={Gtk.Align.END}
                     />
                  )}
               </box>
            </button>
            {arrow === "separate" && (
               <button
                  onClicked={onArrowClicked}
                  cssClasses={ArrowClasses}
                  focusOnClick={false}
               >
                  <image iconName={icons.arrow.right} pixelSize={22} />
               </button>
            )}
         </box>
      </Adw.Clamp>
   );
}
