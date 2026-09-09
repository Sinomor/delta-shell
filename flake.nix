{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

    astal = {
      url = "github:aylur/astal";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    astal-niri = {
      url = "github:sameoldlab/astal?ref=feat/niri";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.astal.follows = "astal-niri";
    };
  };

  outputs =
    inputs:
    let
      inherit (inputs.nixpkgs) lib;
      eachSystem = lib.genAttrs lib.systems.flakeExposed;
      pkgsFor = eachSystem (
        system:
        import inputs.nixpkgs {
          localSystem.system = system;
        }
      );
    in
    {
      packages = lib.mapAttrs (
        system: pkgs:
        let
          pname = "delta-shell";

          buildInputs =
            (with pkgs; [
              gjs
              gtk4
              libsoup_3
              libadwaita
              gobject-introspection
              glib-networking
              wrapGAppsHook3

              bluez
              geoclue2
              libgtop
            ])
            ++ (with inputs.astal.packages.${system}; [
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
              inputs.astal-niri.packages.${system}.niri
              inputs.ags.packages.${system}.ags
            ];

          nativeBuildInputs = with pkgs; [
            meson
            ninja
            wrapGAppsHook3
          ];

          runtimeDependencies = with pkgs; [
            inputs.ags.packages.${system}.ags
            dart-sass
            brightnessctl
            ddcutil
            gpu-screen-recorder
            wl-clipboard
            cliphist
          ];
        in
        rec {
          default = delta-shell;

          delta-shell = pkgs.stdenv.mkDerivation {
            name = pname;
            src = ./.;

            inherit buildInputs;
            inherit nativeBuildInputs;

            postInstall = ''
              wrapProgram $out/bin/${pname} \
                --prefix PATH : ${pkgs.lib.makeBinPath runtimeDependencies}
            '';

            meta.mainProgram = pname;
          };
        }
      ) pkgsFor;

      devShells = lib.mapAttrs (system: pkgs: {
        default = pkgs.mkShell {
          inputsFrom = [
            inputs.self.packages.${system}.delta-shell
          ];
        };
      }) pkgsFor;

      nixosModules.default =
        {
          lib,
          pkgs,
          config,
          ...
        }:
        let
          inherit (pkgs.stdenv.hostPlatform) system;

          cfg = config.programs.delta-shell;
        in
        {
          options.programs.delta-shell = {
            enable = lib.mkEnableOption "Whether to enable delta-shell.";

            package = lib.mkOption {
              type = lib.types.package;
              description = "The delta-shell package to use.";
              default = inputs.self.packages.${system}.delta-shell;
            };
          };

          config = lib.mkIf cfg.enable {
            environment.systemPackages = [ cfg.package ];

            programs.gpu-screen-recorder.enable = true;
          };
        };
    };
}
