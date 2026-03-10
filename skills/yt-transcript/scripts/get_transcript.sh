#!/usr/bin/env bash
# Fetch YouTube transcript and metadata using yt-dlp
# Usage: get_transcript.sh <youtube_url> [language] [format]
#   language: subtitle language code (default: en)
#   format: output format - srt, vtt, or txt (default: txt)

set -euo pipefail

YTDLP="${YTDLP:-$(command -v yt-dlp)}"
if [ -z "$YTDLP" ] || [ ! -x "$YTDLP" ]; then
  echo "Error: yt-dlp not found. Install it or set YTDLP env var." >&2
  exit 1
fi

URL="${1:?Usage: get_transcript.sh <youtube_url> [language] [format]}"
LANG="${2:-en}"
FORMAT="${3:-txt}"
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

# Fetch metadata
echo "=== VIDEO METADATA ==="
"$YTDLP" --skip-download --no-warnings \
  --print "Title: %(title)s" \
  --print "Channel: %(channel)s" \
  --print "Duration: %(duration_string)s" \
  --print "Upload date: %(upload_date>%Y-%m-%d)s" \
  --print "Views: %(view_count)s" \
  --print "URL: %(webpage_url)s" \
  "$URL" 2>/dev/null
echo ""

# Fetch description
echo "=== DESCRIPTION ==="
"$YTDLP" --skip-download --no-warnings --print description "$URL" 2>/dev/null
echo ""

# Download subtitles (try manual subs first, fall back to auto-generated)
echo "=== TRANSCRIPT ($LANG) ==="
SUB_FILE=""
# Try manual subtitles first
if "$YTDLP" --write-subs --sub-langs "$LANG" --sub-format srt --skip-download \
  --no-warnings --quiet -o "$TMPDIR/sub" "$URL" 2>/dev/null; then
  SUB_FILE=$(find "$TMPDIR" -name "sub.${LANG}.srt" 2>/dev/null | head -1)
fi

# Fall back to auto-generated subtitles
if [ -z "$SUB_FILE" ] || [ ! -s "$SUB_FILE" ]; then
  rm -f "$TMPDIR"/sub.*
  if "$YTDLP" --write-auto-subs --sub-langs "$LANG" --sub-format srt --skip-download \
    --no-warnings --quiet -o "$TMPDIR/sub" "$URL" 2>/dev/null; then
    SUB_FILE=$(find "$TMPDIR" -name "sub.${LANG}.srt" 2>/dev/null | head -1)
  fi
fi

if [ -z "$SUB_FILE" ] || [ ! -s "$SUB_FILE" ]; then
  echo "No subtitles available for language: $LANG"
  echo ""
  echo "Available subtitles:"
  "$YTDLP" --list-subs --skip-download --no-warnings "$URL" 2>/dev/null | tail -20
  exit 1
fi

if [ "$FORMAT" = "srt" ]; then
  cat "$SUB_FILE"
elif [ "$FORMAT" = "vtt" ]; then
  # Convert SRT to VTT
  echo "WEBVTT"
  echo ""
  sed 's/,/./g' "$SUB_FILE"
else
  # Convert SRT to clean plain text (deduplicated)
  sed -n '/^[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/,/^$/{ /^[0-9]*$/d; /^[0-9][0-9]:[0-9][0-9]/d; /^$/d; p; }' "$SUB_FILE" \
    | awk '!seen[$0]++' \
    | tr '\n' ' ' \
    | sed 's/  */ /g; s/^ //; s/ $//' \
    | fold -s -w 80
  echo ""
fi
