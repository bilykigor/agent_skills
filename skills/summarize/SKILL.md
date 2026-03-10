---
name: summarize
description: Summarize any URL, YouTube video, podcast, or file using the `summarize` CLI (steipete/summarize). Use when user says "summarize this", "summarize URL", "summarize video", pastes a YouTube/web link and asks for a summary, or wants slides extracted from a video.
allowed-tools: Bash(summarize *), Bash(brew upgrade *summarize*), Read, Glob, AskUserQuestion
---

# Summarize

Summarize any URL, YouTube video, podcast, or local file using the `summarize` CLI tool (https://github.com/steipete/summarize).

## Prerequisites

- Installed via Homebrew: `brew install steipete/tap/summarize`
- Current version: check with `summarize --version`
- Requires at least one LLM API key (ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, etc.) or use `--cli claude` to use Claude CLI as backend

## Quick Reference

### Basic Usage

```bash
# Summarize a web page
summarize "https://example.com"

# Summarize a YouTube video
summarize "https://www.youtube.com/watch?v=VIDEO_ID"

# YouTube with slide extraction
summarize "https://www.youtube.com/watch?v=VIDEO_ID" --slides

# YouTube with slides + OCR
summarize "https://www.youtube.com/watch?v=VIDEO_ID" --slides --slides-ocr

# Summarize a local file (PDF, text, audio, video)
summarize "/path/to/file.pdf"

# Summarize podcast
summarize "https://feeds.example.com/podcast.xml"

# Extract content only (no LLM summary)
summarize "https://example.com" --extract

# Extract as markdown
summarize "https://example.com" --extract --format md
```

### Key Flags

| Flag | Purpose |
|------|---------|
| `--slides` | Extract video slides with scene detection (YouTube/video) |
| `--slides-ocr` | Run OCR on extracted slides (requires tesseract) |
| `--slides-max <n>` | Max slides to extract (default: 6) |
| `--extract` | Print extracted content only, no LLM summary |
| `--format md\|text` | Content format (default: text) |
| `--length short\|medium\|long\|xl\|xxl` | Summary length (default: xl) |
| `--model <provider/model>` | LLM model (e.g., `anthropic/claude-sonnet-4-5`, `openai/gpt-5-mini`) |
| `--cli claude` | Use Claude CLI as backend (free tokens) |
| `--json` | Structured JSON output with metrics |
| `--plain` | Raw text output (no ANSI rendering) |
| `--lang <language>` | Output language (default: auto-detect) |
| `--youtube auto\|web\|yt-dlp` | YouTube transcript source |
| `--timestamps` | Include timestamps in transcripts |
| `--verbose` | Detailed progress output |
| `--timeout <duration>` | Request timeout (default: 2m) |

### Length Presets

| Preset | Target chars |
|--------|-------------|
| short (s) | ~900 |
| medium (m) | ~1,800 |
| long (l) | ~4,200 |
| xl | ~9,000 |
| xxl | ~17,000 |

## Workflow

### Step 1: Determine input type

- **YouTube URL** → use `--slides` if user wants visual content, plain for transcript-based summary
- **Web URL** → basic summarize or `--extract --format md` for content extraction
- **Local file** → pass file path directly
- **Podcast/RSS** → pass feed URL

### Step 2: Choose output format

- For user reading: default (ANSI-rendered markdown in terminal)
- For piping/saving: `--plain` or `--json`
- For further processing: `--extract` (raw content, no LLM)

### Step 3: Run summarize

```bash
# Default: good for most cases
summarize "<input>" --plain

# YouTube with slides (saves to ./slides/)
summarize "<youtube-url>" --slides --plain

# Short summary
summarize "<input>" --length short --plain
```

Use `--plain` when capturing output for further use (removes ANSI escape codes).

### Step 4: Present results

- Show the summary to the user
- If slides were extracted, mention the slides directory
- If the user wants the content saved, write it to a file or add to second-brain

## Tips

1. **Use `--plain`** when you need to capture/process the output (ANSI codes break text processing)
2. **Use `--cli claude`** if no API keys are configured — uses Claude CLI as free backend
3. **Use `--slides --slides-ocr`** for presentation/talk videos to get slide content
4. **Use `--extract`** when you just need the raw content without a summary
5. **Long videos** may need `--timeout 5m` to avoid timeouts
6. **Use `--length`** to control verbosity — `short` for quick overviews, `xxl` for deep dives
7. **Config file** at `~/.summarize/config.json` for persistent settings
