#!/usr/bin/env bash
set -o errexit

# Install dependencies and preload Chromium
npm install
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p "$PUPPETEER_CACHE_DIR"
npx puppeteer browsers install chrome

# Copy downloaded Chromium to project so it can be found at runtime
cp -R "$PUPPETEER_CACHE_DIR" "$(pwd)/.cache/puppeteer" || true