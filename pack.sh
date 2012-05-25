#!/bin/bash

v="$(grep '"version"' ./src/manifest.json | cut -d'"' -f4)"

printf 'Packing extension version %s\n' "$v"
google-chrome --pack-extension=./src --pack-extension-key=../atropa.pem

[ $? -ne 0 ] && exit 1

printf 'Moving extension to ./atropa-%s.crx\n' "$v"
mv ./src.crx "./atropa-${v}.crx"

[ $? -ne 0 ] && exit 1

printf 'Updating updates.xml\n'
cat > updates.xml <<XML
<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='cjgkmppojkdgopibnbpgaohgfajiipjk'>
    <updatecheck codebase='https://github.com/downloads/ushis/atropa-chrome-extension/atropa-${v}.crx' version='${v}'/>
  </app>
</gupdate>
XML

# vim:ts=2:sw=2:expandtab

