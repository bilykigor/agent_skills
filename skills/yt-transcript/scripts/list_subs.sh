#!/usr/bin/env bash
# List available subtitles for a YouTube video
# Usage: list_subs.sh <youtube_url>

set -euo pipefail

YTDLP="${YTDLP:-$(command -v yt-dlp)}"
if [ -z "$YTDLP" ] || [ ! -x "$YTDLP" ]; then
  echo "Error: yt-dlp not found. Install it or set YTDLP env var." >&2
  exit 1
fi

URL="${1:?Usage: list_subs.sh <youtube_url>}"

"$YTDLP" --list-subs --skip-download --no-warnings "$URL" 2>/dev/null
