import { monitorFile, writeFileAsync } from "ags/file";
import app from "ags/gtk4/app";
import { bash, dependencies, toCssValue } from "@/src/lib/utils";
import { Opt } from "@/src/lib/option";
import GLib from "gi://GLib?version=2.0";
import { config, theme } from "@/options";

const { spacing, radius, border, outline, window, bar } = theme;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const $ = (name: string, value: string | Opt<any>) => `$${name}: ${value};`;

const variables = () => [
   $("font-size", `${theme.font.size.get()}pt`),
   $("font-name", `${theme.font.name.get()}`),

   $("bg0", theme.colors.bg[0].get()),
   $("bg1", theme.colors.bg[1].get()),
   $("bg2", theme.colors.bg[2].get()),
   $("bg3", theme.colors.bg[3].get()),

   $("fg0", theme.colors.fg[0].get()),
   $("fg1", theme.colors.fg[1].get()),
   $("fg2", theme.colors.fg[2].get()),

   $("accent", theme.colors.accent.get()),
   $("accent-light", `lighten(${theme.colors.accent.get()}, 10%)`),
   $("blue", theme.colors.blue.get()),
   $("blue-light", `lighten(${theme.colors.blue.get()}, 10%)`),
   $("green", theme.colors.green.get()),
   $("green-light", `lighten(${theme.colors.green.get()}, 10%)`),
   $("yellow", theme.colors.yellow.get()),
   $("yellow-light", `lighten(${theme.colors.yellow.get()}, 10%)`),
   $("orange", theme.colors.orange.get()),
   $("orange-light", `lighten(${theme.colors.orange.get()}, 10%)`),
   $("red", theme.colors.red.get()),
   $("red-light", `lighten(${theme.colors.red.get()}, 10%)`),
   $("purple", theme.colors.purple.get()),
   $("purple-light", `lighten(${theme.colors.purple.get()}, 10%)`),

   $("border-color", border.color.get()),
   $("outline-color", outline.color.get()),

   $("outline-width", `${outline.width.get()}px`),
   $("border-width", `${border.width.get()}px`),

   $("widget-radius", `${radius.get()}px`),

   $("window-padding", `${window.padding.get()}px`),
   $(
      "window-radius",
      `${radius.get() === 0 ? radius.get() : radius.get() + window.padding.get()}px`,
   ),
   $("window-opacity", `${window.opacity.get()}`),
   $("window-border-width", `${window.border.width.get()}px`),
   $("window-border-color", `${window.border.color.get()}`),
   $("window-outline-width", `${window.outline.width.get()}px`),
   $("window-outline-color", `${window.outline.color.get()}`),
   $("window-shadow-offset", `${toCssValue(window.shadow.offset.get())}`),
   $("window-shadow-blur", `${window.shadow.blur.get()}px`),
   $("window-shadow-spread", `${window.shadow.spread.get()}px`),
   $("window-shadow-color", `${window.shadow.color.get()}`),
   $("window-shadow-opacity", `${window.shadow.opacity.get()}`),

   $("bar-position", config.bar.position.get()),
   $("bar-bg", `${bar.bg.get()}`),
   $("bar-opacity", `${bar.opacity.get()}`),
   $("bar-margin", `${toCssValue(bar.margin.get())}`),
   $("bar-margin-top", `${bar.margin.get()[0]}px`),
   $("bar-margin-right", `${bar.margin.get()[1]}px`),
   $("bar-margin-bottom", `${bar.margin.get()[2]}px`),
   $("bar-margin-left", `${bar.margin.get()[3]}px`),
   $("bar-border-width", `${bar.border.width.get()}px`),
   $("bar-border-color", `${bar.border.color.get()}`),
   $("bar-button-bg", `${bar.button.bg.default.get()}`),
   $("bar-button-bg-hover", `${bar.button.bg.hover.get()}`),
   $("bar-button-bg-active", `${bar.button.bg.active.get()}`),
   $("bar-button-fg", `${bar.button.fg.get()}`),
   $("bar-button-border-width", `${bar.button.border.width.get()}px`),
   $("bar-button-border-color", `${bar.button.border.color.get()}`),
   $("bar-button-opacity", `${bar.button.opacity.get()}`),
   $("bar-button-padding", `${toCssValue(bar.button.padding.get())}`),
   $("bar-shadow-offset", `${toCssValue(bar.shadow.offset.get())}`),
   $("bar-shadow-blur", `${bar.shadow.blur.get()}px`),
   $("bar-shadow-spread", `${bar.shadow.spread.get()}px`),
   $("bar-shadow-color", `${bar.shadow.color.get()}`),
   $("bar-shadow-opacity", `${bar.shadow.opacity.get()}`),

   $("transition", `${config.transition.get()}s`),
   $("shadow", `${theme.shadow.get()}`),
];

const style_path = `${DATADIR ?? SRC}/src/styles`;
const style_files = [
   `${style_path}/_extra.scss`,
   `${style_path}/bar.scss`,
   `${style_path}/calendar.scss`,
   `${style_path}/quicksettings.scss`,
   `${style_path}/launcher.scss`,
   `${style_path}/notifications.scss`,
   `${style_path}/osd.scss`,
   `${style_path}/powermenu.scss`,
   `${style_path}/weather.scss`,
   `${style_path}/volume.scss`,
   `${style_path}/network.scss`,
   `${style_path}/bluetooth.scss`,
];

export async function resetCss() {
   if (!dependencies("sass")) return;

   try {
      const vars = `${GLib.get_tmp_dir()}/delta-shell/variables.scss`;
      const scss = `${GLib.get_tmp_dir()}/delta-shell/main.scss`;
      const css = `${GLib.get_tmp_dir()}/delta-shell/main.css`;

      const imports = [vars, ...style_files].map((f) => `@import '${f}';`);

      await writeFileAsync(vars, variables().join("\n"));
      await writeFileAsync(scss, imports.join("\n"));
      await bash(`sass ${scss} ${css}`);

      app.apply_css(css, true);
   } catch (error) {
      if (error instanceof Error) {
         logError(error);
      } else {
         console.error(error);
      }
   }
}

await resetCss();
