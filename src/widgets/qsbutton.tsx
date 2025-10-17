import Pango from "gi://Pango";
import { icons } from "@/src/lib/icons";
import { Gtk } from "ags/gtk4";
import { Accessor } from "ags";
import Adw from "gi://Adw?version=1";

type QSButtonProps = {
   icon: string | Accessor<string>;
   label: string;
   subtitle?: Accessor<string>;
   showArrow?: boolean;
   onClicked: () => void;
   onArrowClicked?: () => void;
   ButtonClasses: string[] | Accessor<string[]>;
   ArrowClasses?: string[] | Accessor<string[]>;
   maxWidthChars?: number;
};

export function QSButton(props: QSButtonProps) {
   const {
      icon,
      label,
      subtitle,
      onClicked,
      showArrow = false,
      onArrowClicked = () => {},
      ButtonClasses,
      ArrowClasses,
      maxWidthChars = 10,
   } = props;

   return (
      <Adw.Clamp class={"qs-button"} maximumSize={200}>
         <box widthRequest={200}>
            <button
               onClicked={onClicked}
               cssClasses={ButtonClasses}
               hexpand={true}
               focusOnClick={false}
            >
               <box
                  spacing={10}
                  halign={Gtk.Align.START}
                  valign={Gtk.Align.CENTER}
               >
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
               </box>
            </button>
            {showArrow && (
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
