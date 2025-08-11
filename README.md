# Delta Shell

A desktop shell based on [Ags](https://github.com/Aylur/ags). Currently supports Hyprland and Niri.
![image](https://i.imgur.com/NqS4eqJ.png)
![image](https://i.imgur.com/Hdhg0KW.jpeg)

## Dependencies

### Required

- `aylurs-gtk-shell-git`
- `libastal-meta`
- `libastal-niri-git`
- `brightnessctl`
- `dart-sass`
- `fd`
- `bluez`
- `tuned-ppd` or `power-profiles-daemon`

**NOTE: Delta Shell will not run without the required dependencies.**

### Optional

- `cliphist` and `wl-clipboard` for clipboard
- `gpu-screen-recorder` to record screen from control center
- `geoclue` to autoload the location for weather

## Installation

<details>
<summary><b>Arch Linux</b></summary>

1. Installation libastal-niri-git

```bash
mkdir -p libastal-niri-git
cd libastal-niri-git
wget https://raw.githubusercontent.com/Sinomor/PKGBUILDS/refs/heads/main/libastal-niri-git/PKGBUILD
makepkg -si
```

2. Installation other dependencies

```bash
yay -S aylurs-gtk-shell-git libastal-meta brightnessctl dart-sass fd bluez tuned-ppd cliphist gpu-screen-recorder wl-clipboard
```

3. Clone repo and run

```bash
git clone https://github.com/Sinomor/delta-shell.git ~/.config/ags
```

And then you can run it with

```bash
ags run
```

</details>

## Configuration

Config separated to 2 files: `~/.config/delta-shell/theme.json` and `~/.config/delta-shell/config.json` (created automaticaly).
Config comes with the following defaults:

> [!WARNING]
> Don't copy and paste this entire block into your `config.json` and `theme.json`, it's just to show which configurations are available.

config.json

```
{
   "transition": 0.3, // animation transition (in seconds)
   "bar": {
      // available modules: "launcher", "workspaces", "clock",
      // "record_indicator", "tray", "keyboard", "sysbox", "weather"
      // "notifications"
      "modules": {
         "start": ["launcher", "workspaces"],
         "center": ["clock", "weather"],
         "end": ["record_indicator", "tray", "keyboard", "notifications", "sysbox"]
      },
      "height": 52,
      "position": "top", // "top" | "bottom"
      "workspaces": {
         "taskbar": true,
         // to use custom icons for apps you need to add
         // window_class: iconname
         // where iconname is a file name of icon that should be
         // located at ~/.config/ags/assets/icons/hicolor/scalable/apps/
         // or a name of icon from your system icon theme
         "taskbar_icons": {}
      },
      "date": {
         "format": "%b %d  %H:%M" // https://docs.gtk.org/glib/method.DateTime.format.html
      }
   },
   "control": {
      "default_coverArt": "/home/sinomor/.config/ags/assets/defsong.jpg",
   },
   "launcher": {
      "clipboard": {
         "max_items": 50, // maximum items in clipboard
         "image_preview": false, // it may works bad
      }
      "width": 500,
      "height": 0 // filled when 0
   },
   "osd": {
      "width": 300,
      "position": "bottom", // "top" | "top_left" | "top_right" | "bottom" | "bottom_left"| "bottom_right"
      "timeout": 3 // in seconds
   },
   "notifications": {
      "position": "top", // "top" | "top_left" | "top_right" | "bottom" | "bottom_left"| "bottom_right"
      "enabled": true,
      "timeout": 3, // in seconds
      "width": 400,
      "list": {
         "height": 500 // filled when 0
      }
   },
   "weather": {
      "enabled": true,
      // when set auto to true it uses geoclue
      // for coords set {"latitude": "...", "longitude": "..."}
      // options priority: auto > coords > city
      "location": {
         "auto": false,
         "coords": null,
         "city": "Minsk"
      }
   }
}
```

theme.json

```
{
   "font": {
      "size": 14,
      "name": "Rubik"
   },
   "colors": {
      "bg": {
         "0": "#1d1d20",
         "1": "#28282c",
         "2": "#36363a",
         "3": "#48484b"
      },
      "fg": {
         "0": "#ffffff",
         "1": "#c0c0c0",
         "2": "#808080"
      },
      "accent": "#c88800",
      "blue": "#3584e4",
      "teel": "#2190a4",
      "green": "#3a944a",
      "yellow": "#c88800",
      "orange": "#ed5b00",
      "red": "#e62d42",
      "purple": "#9141ac",
      "slate": "#6f8396"
   },
   "border": {
      "width": 1,
      "color": "$bg2" // css color values (name -> red, rgb -> rgb(50, 50, 50), etc), or use theme color with "$" prefix ($bg, $accent, etc)
   },
   "outline": {
      "width": 1,
      "color": "$fg1" // css color values
   },
   "spacing": 10, // main spacing between elements
   "shadow": true,
   "radius": 0, // border radius
   "window": {
      "padding": 15,
      "opacity": 1,
      "margin": 10, // only number
      "border": {
         "width": 1,
         "color": "$bg2" // css color values
      },
      "outline": {
         "width": 1,
         "color": "$fg1" // css color values
      },
      "shadow": {
         "offset": [0, 0], // in px, [horizontal, vertical]
         "blur": 10,
         "spread": 0,
         "color": "black", // css color values
         "opacity": 0.4
      }
   },
   "bar": {
      "bg": "$bg0",
      "opacity": 1,
      "margin": [0, 0, 0, 0], // in px, [top, right, bottom, left]
      "spacing": 6, // spacing between modules in bar
      "border": {
         "width": 1,
         "color": "$bg2" // css color values
      },
      "shadow": {
         "offset": [0, 0], // in px, [horizontal, vertical]
         "blur": 10,
         "spread": 0,
         "color": "black", // css color values
         "opacity": 0.4
      },
      "button": {
         "fg": "$fg0",
         "padding": [0, 10], // in px, support css style (top, right, bottom, left -> [10, 15, 20, 10]
         "bg": {
            "default": "$bg0", // css color values
            "hover": "$bg1", // css color values
            "active": "$bg2" // css color values
         },
         "opacity": 1,
         "border": {
            "width": 0,
            "color": "$bg2" // css color values
         }
      }
   }
}
```

## References

- [epik-shell](https://github.com/ezerinz/epik-shell/)
- [re-shell](https://github.com/ReStranger/re-shell)
- [cafetestrest dotfiles](https://github.com/cafetestrest/nixos)
- [desktop-shell](https://github.com/Mabi19/desktop-shell)
