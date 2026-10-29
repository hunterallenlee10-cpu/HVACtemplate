#!/usr/bin/env bash
# Turns the Higgsfield transition clips into scroll-scrub WebP sequences.
#
#   1. Drop the chosen clips into assets/raw/clips/ named V01.mp4 … V08.mp4
#   2. bash scripts/extract-frames.sh            (all chapters)
#      bash scripts/extract-frames.sh ch03       (one chapter)
#
# Chapter → clip mapping, fps, sizes and the mobile crop focal points live in
# content/sequence.manifest.json. Output:
#   public/seq/desktop/chXX/0001.webp …   (1600px wide, 16:9)
#   public/seq/mobile/chXX/0001.webp …    (3:4 portrait crop, every 2nd frame)
#   content/frames.json                   (frame counts the StoryCanvas reads)
set -euo pipefail
cd "$(dirname "$0")/.."
command -v ffmpeg >/dev/null || { echo "ffmpeg is required (apt install ffmpeg / brew install ffmpeg)"; exit 1; }
node scripts/extract-frames.mjs "$@"
