#!/bin/bash
# Wrapper for launchd to invoke the sync watcher with the right Node version.
# Sources nvm so the launchd-spawned process can find node, then execs the CLI.

set -e

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

cd "$(dirname "$0")/.."
exec node ./src/cli.js
