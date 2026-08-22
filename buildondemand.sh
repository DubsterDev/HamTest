#!/usr/bin/env bash

i=0
inotifywait -m ./app -r -e create -e moved_to -e delete -e modify --exclude '/\.' |
    while read -r directory action file; do
        i=$((i + 1))
        if (( i % 2 == 0 )); then
            node build.mjs
        fi
    done
   