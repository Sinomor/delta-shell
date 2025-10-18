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
      nixpkgs,
      astal,
      astal_niri,
      ags,
    }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      packages.${system}.default = pkgs.stdenvNoCC.mkDerivation {
        name = "delta-shell";
        src = ./.;

        nativeBuildInputs = with pkgs; [
          wrapGAppsHook
          gobject-introspection
          esbuild
        ];

        buildInputs =
          (with pkgs; [
            gjs
            glib
            gtk4
            brightnessctl
            dart-sass
            gpu-screen-recorder
            cliphist
            bluez
          ])
          ++ (with astal.packages.${system}; [
            io
            astal4
          ])
          ++ [
            astal_niri.packages.${system}.niri
            ags.packages.${system}.agsFull
          ];

        installPhase = ''
          mkdir -p $out/bin

          esbuild \
            --bundle src/app.js \
            --outfile=$out/bin/my-shell \
            --format=esm \
            --sourcemap=inline \
            --external:gi://\*
        '';
      };
    };
}
