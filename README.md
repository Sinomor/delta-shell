# Delta Shell

A desktop shell based on [Ags](https://github.com/Aylur/ags). Currently supports Hyprland and Niri.
![image](https://i.imgur.com/vBy0QRd.png)

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

<details>
<summary><b>NixOS</b></summary>

If you use Nix or NixOS, you can run Delta Shell with all dependencies managed automatically:

```bash
nix run github:Sinomor/delta-shell
```

For development, enter a shell with all dependencies:

```bash
nix develop
```

No manual installation of dependencies is required when using Nix.

</details>

## Configuration

Config file located at `~/.config/delta-shell/config.json`.
Config comes with the following defaults:

> [!WARNING]
> Don't copy and paste this entire block into your `config.json`, it's just to show which configurations are available.

```
{
  "theme": {
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
    "slate": "#6f8396",
    "border": {
      "width": 1,
      "color": "#36363a"
    },
    "outline": {
      "width": 1,
      "color": "#c0c0c0"
    },
    "main-padding": 15, // main padding in widgets
    "spacing": 10, // spacing between elements
    "radius": 0 // border radius
  },
  "transition": 200, // animation transition
  "font": {
    "name": "Rubik",
    "size": 14
  },
  "bar": {
    "position": "top", // "top" | "bottom"
    "height": 52,
    // available modules: "launcher", "workspaces", "clock", "record_indicator", "tray", "keyboard", "sysbox"
    "modules": {
      "start": ["launcher", "workspaces"],
      "center": ["clock"],
      "end": ["record_indicator", "tray", "keyboard", "sysbox"]
    },
    "spacing": 6, // spacing between bar widgets
    "date": {
      "format": "%b %d  %H:%M" // https://docs.gtk.org/glib/method.DateTime.format.html
    }
  },
  "control": {
    "width": 500,
    "height": 0, // filled when 0
    "margin": 10
  },
  "launcher": {
    "width": 500,
    "height": 0, // filled when 0
    "margin": 10,
    "clipboard": {
        "max_items": 50 // maximum items in clipboard
    }
  },
  "osd": {
    "width": 300,
    "margin": 10,
    "timeout": 3000
  },
  "calendar": {
    "margin": 10
  },
  "notifications_popup": {
    "margin": 10,
    "timeout": 3000
  }
}
```

## References

- [epik-shell](https://github.com/ezerinz/epik-shell/)
- [re-shell](https://github.com/ReStranger/re-shell)
- [cafetestrest dotfiles](https://github.com/cafetestrest/nixos)
