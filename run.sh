#!/bin/sh

if [ "$#" -eq 0 ]; then
    exec "@DATADIR@/delta-shell-app"
else
    exec astal -i delta-shell "$*"
fi
