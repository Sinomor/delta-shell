import Pango from "gi://Pango";
import { icons } from "@/src/lib/icons";
import { Gtk } from "ags/gtk4";
import { Accessor } from "ags";

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
      maxWidthChars = 8,
   } = props;

   return (
      <box class={"qs-button"}>
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
               <image pixelSize={24} iconName={icon} />
               <box orientation={Gtk.Orientation.VERTICAL}>
                  <label
                     class={"qs-button-label"}
                     label={label}
                     halign={Gtk.Align.START}
                     valign={Gtk.Align.CENTER}
                  />
                  {subtitle && (
                     <label
                        class={"qs-button-label"}
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
               <image iconName={icons.arrow.right} pixelSize={24} />
            </button>
         )}
      </box>
   );
}
