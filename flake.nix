{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

    astal = {
      url = "github:aylur/astal";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    astal_niri = {
      url = "github:sameoldlab/astal?ref=feat/niri";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.astal.follows = "astal";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      astal,
      astal_niri,
      ags,
    }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      shellBuildInputs =
        with pkgs;
        [
          gjs
          glib
          gtk4
          brightnessctl
          dart-sass
          gpu-screen-recorder
          cliphist
          bluez
          libsoup_3
          libadwaita
          gnutls
        ]
        ++ [
          astal.packages.${system}.io
          astal.packages.${system}.astal4
          astal.packages.${system}.apps
          astal.packages.${system}.hyprland
          astal.packages.${system}.battery
          astal.packages.${system}.bluetooth
          astal.packages.${system}.mpris
          astal.packages.${system}.network
          astal.packages.${system}.notifd
          astal.packages.${system}.powerprofiles
          astal.packages.${system}.tray
          astal.packages.${system}.wireplumber

          astal_niri.packages.${system}.niri
          ags.packages.${system}.agsFull
        ];
    in
    {
      packages.${system}.default = pkgs.stdenv.mkDerivation {
        name = "delta-shell";
        src = ./.;

        nativeBuildInputs = with pkgs; [
          wrapGAppsHook
          gobject-introspection
          meson
          ninja
        ];

        buildInputs = shellBuildInputs;
      };
    };
}
