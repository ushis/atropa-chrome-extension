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

[ $? -ne 0 ] && exit 1

printf 'Updating updates.xml\n'
cat > updates.xml <<XML
<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='cjgkmppojkdgopibnbpgaohgfajiipjk'>
    <updatecheck codebase='https://github.com/downloads/ushis/atropa-chrome-extension/atropa-${1}.crx' version='${1}'/>
  </app>
</gupdate>
XML

# vim:ts=2:sw=2:expandtab

