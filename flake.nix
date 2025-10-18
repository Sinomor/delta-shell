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
      runtimeDeps =
        with pkgs;
        [
          brightnessctl
          dart-sass
          gpu-screen-recorder
          cliphist
          bluez
          libsoup_3
          libadwaita
          gobject-introspection
        ]
        ++ (with astal.packages.${system}; [
          io
          astal4
          apps
          hyprland
          battery
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

        buildInputs =
          with pkgs;
          [
            gjs
            glib
            gtk4
          ]
          ++ [
            astal_niri.packages.${system}.niri
            ags.packages.${system}.agsFull
          ];
      };

      devShells.${system}.default = pkgs.mkShell {
        buildInputs = runtimeDeps;

        packages = [ self.packages.${system}.default ];
      };
    };
}
