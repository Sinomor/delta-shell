#!/bin/bash

WIDGETS=("applauncher" "clipboard" "control" "powermenu" "calendar" "weather" "notificationslist", "volume", "network", "bluetooth", "power")

print_help() {
    cat <<EOF
Usage: $(basename "$0") <command> [options]

Available Commands:
   run            Run an app
   quit           Quit an app
   restart        Restart an app
   toggle         Toggle visibility of a widget
   help           Show this help message

Available widgets for toggle:
$(printf "   %s\n" "${WIDGETS[@]}")

Flags:
   -h, --help     help for delta-shell
EOF
}

main() {
    if [ $# -lt 1 ]; then
        print_help
        exit 0
    fi

    case $1 in
        run)
            exec "@DATADIR@/delta-shell-app"
            ;;
        quit)
            exec ags -i delta-shell quit
            ;;
        restart)
            ags -i delta-shell quit
            exec "@DATADIR@/delta-shell-app"
            ;;
        toggle)
            if [ "$#" -lt 2 ]; then
                echo "Available widgets for toggle:"
                printf "  - %s\n" "${WIDGETS[@]}"
                exit 0
            fi
            exec ags request -i delta-shell toggle "$2"
            ;;
        help|-h|--help) print_help ;;
        *)
            exec ags -i delta-shell request "$*"
            ;;
    esac
}

main "$@"
