import { monitorFile, writeFileAsync } from "ags/file";
import app from "ags/gtk4/app";
import { bash, dependencies, toCssValue } from "@/src/lib/utils";
import GLib from "gi://GLib?version=2.0";
import { config, theme } from "@/options";
import { isVertical } from "../modules/bar/bar";

const { spacing, radius, border, window, bar } = theme;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const $ = (name: string, value: string) => `$${name}: ${value};`;

const variables = () => [
   $("font-size", `${theme.font.size}pt`),
   $("font-name", `${theme.font.name}`),

   $("bg0", theme.colors.bg[0]),
   $("bg1", theme.colors.bg[1]),
   $("bg2", theme.colors.bg[2]),
   $("bg3", theme.colors.bg[3]),

   $("fg0", theme.colors.fg[0]),
   $("fg1", theme.colors.fg[1]),
   $("fg2", theme.colors.fg[2]),

   $("accent", theme.colors.accent),
   $("accent-light", `lighten(${theme.colors.accent}, 10%)`),
   $("blue", theme.colors.blue),
   $("blue-light", `lighten(${theme.colors.blue}, 10%)`),
   $("cyan", theme.colors.cyan),
   $("cyan-light", `lighten(${theme.colors.cyan}, 10%)`),
   $("green", theme.colors.green),
   $("green-light", `lighten(${theme.colors.green}, 10%)`),
   $("yellow", theme.colors.yellow),
   $("yellow-light", `lighten(${theme.colors.yellow}, 10%)`),
   $("orange", theme.colors.orange),
   $("orange-light", `lighten(${theme.colors.orange}, 10%)`),
   $("red", theme.colors.red),
   $("red-light", `lighten(${theme.colors.red}, 10%)`),
   $("purple", theme.colors.purple),
   $("purple-light", `lighten(${theme.colors.purple}, 10%)`),

   $("border-color", border.color),
   $("border-width", `${border.width}px`),

   $("widget-radius", `${radius}px`),

   $("window-padding", `${window.padding}px`),
   $("window-radius", `${radius === 0 ? radius : radius + window.padding}px`),
   $("window-opacity", `${window.opacity}`),
   $("window-border-width", `${window.border.width}px`),
   $("window-border-color", `${window.border.color}`),
   $("window-outline-width", `${window.outline.width}px`),
   $("window-outline-color", `${window.outline.color}`),
   $("window-shadow-offset", `${toCssValue(window.shadow.offset)}`),
   $("window-shadow-blur", `${window.shadow.blur}px`),
   $("window-shadow-spread", `${window.shadow.spread}px`),
   $("window-shadow-color", `${window.shadow.color}`),
   $("window-shadow-opacity", `${window.shadow.opacity}`),

   $("bar-position", config.bar.position),
   $("bar-bg", `${bar.bg}`),
   $("bar-opacity", `${bar.opacity}`),
   $("bar-margin", `${toCssValue(bar.margin)}`),
   $("bar-margin-top", `${bar.margin[0]}px`),
   $("bar-margin-right", `${bar.margin[1]}px`),
   $("bar-margin-bottom", `${bar.margin[2]}px`),
   $("bar-margin-left", `${bar.margin[3]}px`),
   $("bar-padding", `${bar.padding}px`),
   $("bar-border-width", `${bar.border.width}px`),
   $("bar-border-color", `${bar.border.color}`),
   $("bar-separator-width", `${bar.separator.width}px`),
   $("bar-separator-color", `${bar.separator.color}`),
   $("bar-button-bg", `${bar.button.bg.default}`),
   $("bar-button-bg-hover", `${bar.button.bg.hover}`),
   $("bar-button-bg-active", `${bar.button.bg.active}`),
   $("bar-button-fg", `${bar.button.fg}`),
   $("bar-button-border-width", `${bar.button.border.width}px`),
   $("bar-button-border-color", `${bar.button.border.color}`),
   $("bar-button-opacity", `${bar.button.opacity}`),
   $("bar-button-padding", `${toCssValue(bar.button.padding)}`),
   $("bar-shadow-offset", `${toCssValue(bar.shadow.offset)}`),
   $("bar-shadow-blur", `${bar.shadow.blur}px`),
   $("bar-shadow-spread", `${bar.shadow.spread}px`),
   $("bar-shadow-color", `${bar.shadow.color}`),
   $("bar-shadow-opacity", `${bar.shadow.opacity}`),
   $("bar-vertical", `${isVertical}`),
   $("bar-size", `${config.bar.size}px`),

   $("transition", `${config.transition}s`),
   $("shadow", `${theme.shadow}`),
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
   `${style_path}/power.scss`,
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
