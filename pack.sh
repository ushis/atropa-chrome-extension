#!/bin/bash

if [ $# -ne 1 ]; then
  printf 'usage: %s <version>\n' "$0"
  exit 1
fi

printf 'Packing extension\n'
google-chrome --pack-extension=./src --pack-extension-key=../atropa.pem

[ $? -ne 0 ] && exit 1

printf 'Moving extension to ./atropa-%s.crx\n' "$1"
mv ./src.crx "./atropa-${1}.crx"

# vim:ts=2:sw=2:expandtab

