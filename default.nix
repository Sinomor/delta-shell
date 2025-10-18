{ system
, pkgs
, astal
, astal_niri
, ags
, lib
}:

let
  runtimeDeps = with pkgs; [
    brightnessctl
    dart-sass
    gpu-screen-recorder
    cliphist
    bluez
    libsoup_3
    libadwaita
    ags.packages.${system}.agsFull
  ];
in

pkgs.stdenv.mkDerivation {
  name = "delta-shell";
  src = ./.;

  nativeBuildInputs = with pkgs; [
    wrapGAppsHook
    gobject-introspection
    meson
    ninja
  ];

  buildInputs =
    with pkgs;
    [
      gjs
      glib
      gtk4
    ]
    ++ (with astal.packages.${system}; [
      io
      astal4
      apps
      hyprland
      battery
      # и так далее...
      bluetooth
      mpris
      network
      notifd
      powerprofiles
      tray
      wireplumber
    ])
    ++ [
      astal_niri.packages.${system}.niri
      ags.packages.${system}.agsFull
    ];

  propagatedBuildInputs = runtimeDeps;
}
