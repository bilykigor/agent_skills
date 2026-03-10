---
name: yt-transcript
description: Fetch transcripts, subtitles, and metadata from YouTube videos using yt-dlp. Use when the user wants to get a transcript, subtitles, captions, or summary of a YouTube video. Also use when the user pastes a YouTube URL and asks to summarize or transcribe it.
argument-hint: "<youtube_url> [language] [format]"
allowed-tools: Bash(*), Read, Glob, Grep
---

# YouTube Transcript Skill

Fetch transcripts, subtitles, and metadata from YouTube videos using `yt-dlp`.

## Setup

Requires `yt-dlp` installed and available in PATH (or set `YTDLP` env var to its location):

```bash
# Install via brew
brew install yt-dlp

# Or pip
pip install yt-dlp

# Or set custom path
export YTDLP="/path/to/yt-dlp"
```

## Commands

### `/yt-transcript <url>` — Get full transcript

Fetches metadata + transcript as clean plain text (default English).

```bash
bash <skill-dir>/scripts/get_transcript.sh "<url>"
```

### `/yt-transcript <url> <language>` — Get transcript in a specific language

Use a language code (e.g., `es`, `fr`, `de`, `ja`, `zh-Hans`).

```bash
bash <skill-dir>/scripts/get_transcript.sh "<url>" "es"
```

### `/yt-transcript <url> <language> srt` — Get raw SRT subtitles

Returns timestamped SRT format instead of plain text.

```bash
bash <skill-dir>/scripts/get_transcript.sh "<url>" "en" "srt"
```

### List available subtitle languages

```bash
bash <skill-dir>/scripts/list_subs.sh "<url>"
```

## Direct yt-dlp usage

For cases where the scripts don't cover what's needed:

```bash
# Get video metadata
yt-dlp --skip-download --print title --print channel --print duration_string --print description "<url>"

# Download auto-generated subtitles as SRT
yt-dlp --write-auto-subs --sub-langs "en" --sub-format srt --skip-download -o "/tmp/yt_sub" "<url>"

# List available subtitles
yt-dlp --list-subs --skip-download "<url>"
```

## Workflow

When the user provides a YouTube URL and asks for a transcript or summary:

1. Run `get_transcript.sh` with the URL to fetch metadata and transcript
2. Present the metadata (title, channel, duration) to the user
3. If asked to summarize: read the transcript output and provide a summary
4. If the user wants a specific language, re-run with the language code
5. If no subtitles are available for a language, show available languages

## Output Formats

| Format | Description |
|--------|-------------|
| `txt`  | Clean plain text, deduplicated lines (default) |
| `srt`  | Timestamped SubRip format |
| `vtt`  | WebVTT format |

## Notes

- Auto-generated subtitles are available for most YouTube videos
- Manual (human-created) subtitles are preferred when available
- The `--no-warnings` flag suppresses yt-dlp warnings about JS runtimes
