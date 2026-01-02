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
      inputs.astal.follows = "astal_niri";
    };
    flake-parts = {
      url = "github:hercules-ci/flake-parts";
    };
  };

  outputs = inputs @ {
    flake-parts,
    astal,
    astal_niri,
    ags,
    self,
    ...
  }:
    flake-parts.lib.mkFlake {inherit inputs;} {
      imports = [];
      systems = [
        "x86_64-linux"
        "aarch64-linux"
      ];
      perSystem = {pkgs, ...}: let
        pname = "delta-shell";

        buildDependencies = with pkgs;
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
            wrapGAppsHook3
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
        nativeBuildInputs = with pkgs; [
          meson
          ninja
          wrapGAppsHook3
        ];
        devshellBuildDependencies = nativeBuildInputs ++ buildDependencies;
      in {
        packages.default = pkgs.stdenv.mkDerivation {
          name = "${pname}";
          src = ./.;

          inherit nativeBuildInputs;
          buildInputs = buildDependencies;

          postInstall = ''
            wrapProgram $out/bin/${pname} \
              --prefix PATH : ${pkgs.lib.makeBinPath buildDependencies}
          '';
        };
        devShells = {
          default = pkgs.mkShell {
            buildInputs = devshellBuildDependencies;
            shellHook = ''
              echo 'Welcome to the delta-shell nix devShell!'
              echo 'To get build instructions, please read README.'
            '';
          };
        };
      };
      flake = {
        flakeModules.default = {
          pkgs,
          lib,
          config,
          ...
        }: {
          options.programs.delta-shell = {
            enable = lib.mkEnableOption "Install delta-shell";
            package = lib.mkOption {
              type = lib.types.package;
              description = "The delta-shell package to use";
              default = self.packages.${pkgs.system}.my-package;
            };
          };
          config = lib.mkMerge [
            (lib.mkIf config.programs.delta-shell.enable {
              programs.gpu-screen-recorder.enable = true;
              environment.systemPackages = with pkgs; [
                config.programs.delta-shell.package
              ];
            })
          ];
        };
      };
    };
}
