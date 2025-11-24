# Delta Shell

A desktop shell based on [Ags](https://github.com/Aylur/ags). Currently supports Hyprland and Niri.
![image](https://i.imgur.com/dagf7FE.png)
![image](https://i.imgur.com/0Ud0i7G.png)

## Documentation

More information about Delta Shell you can find at [docs website](https://sinomor.github.io/delta-shell-docs/)

## Dependencies

### Required

- `aylurs-gtk-shell`
- `libastal-hyprland`
- `libastal-niri`
- `libastal-apps`
- `libastal-battery`
- `libastal-bluetooth`
- `libastal-mpris`
- `libastal-network`
- `libastal-notifd`
- `libastal-powerprofiles`
- `libastal-tray`
- `libastal-wireplumber`
- `dart-sass`

**NOTE: Delta Shell will not run without the required dependencies.**

### Optional

- `cliphist` and `wl-clipboard` for clipboard
- `gpu-screen-recorder` to record screen from control center
- `geoclue` to autoload the location for weather
- `tuned-ppd` or `power-profiles-daemon` to switch between power profiles
- `brightnessctl` for control screen brightness
- `bluez` for connect to bluetooth devices
- `libgtop` for cpu usage

## Installation

<details>
<summary><b>Arch Linux</b></summary>

1. Installation dependencies and delta-shell

```bash
yay -S delta-shell-git libastal-niri-git aylurs-gtk-shell-git libastal-meta brightnessctl dart-sass fd bluez tuned-ppd cliphist gpu-screen-recorder wl-clipboard
```

2. Run and usage with command

```bash
delta-shell
```

</details>

<details>
<summary><b>From Source</b></summary>

1. Build the delta-shell

```bash
git clone https://github.com/Sinomor/delta-shell.git
cd delta-shell
meson setup build
meson install -C build
```

2. Run and usage with command

```bash
delta-shell
```

</details>

<details>
<summary><b>Without Building</b></summary>

1. Clone and run

```bash
git clone https://github.com/Sinomor/delta-shell.git
cd delta-shell
./run-dev.sh
```

2. Usage with command

```bash
astal -i delta-shell *command*
```

</details>

## References

- [epik-shell](https://github.com/ezerinz/epik-shell/)
- [re-shell](https://github.com/ReStranger/re-shell)
- [cafetestrest dotfiles](https://github.com/cafetestrest/nixos)
- [desktop-shell](https://github.com/Mabi19/desktop-shell)
- [Okpanel](https://github.com/JohnOberhauser/OkPanel)
