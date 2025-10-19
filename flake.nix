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

      pname = "delta-shell";

      pkgsass =
        with pkgs;
        [
          gjs
          gtk4
          brightnessctl
          dart-sass
          gpu-screen-recorder
          cliphist
          bluez
          libsoup_3
          libadwaita
          gobject-introspection
          geoclue2
          glib-networking
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
      packages.${system}.default = pkgs.stdenv.mkDerivation rec {
        name = "${pname}";
        src = ./.;

        nativeBuildInputs = with pkgs; [
          wrapGAppsHook
          meson
          ninja
        ];

        buildInputs = pkgsass;

        postInstall = ''
          wrapProgram $out/bin/${pname} \
            --prefix PATH : ${pkgs.lib.makeBinPath pkgsass}
        '';
      };
    };
}
