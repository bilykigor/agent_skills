---
name: browser-tools
description: Browser automation via Chrome DevTools Protocol using Mario Zechner's browser-tools. Use when user asks to open a browser, navigate to a site, scrape a page, take a screenshot, pick DOM elements, extract page content, or search Google via browser. Also use when user needs to interact with a website using their real Chrome profile (logged-in sessions, cookies).
allowed-tools: Bash(browser-*.js *), Bash(cd ~/agent-tools/browser-tools && npm install), Bash(cd ~/agent-tools/browser-tools && git pull), Read, Glob
---

# Browser Tools

Chrome DevTools Protocol tools for browser automation, scraping, and web interaction. Uses your real Chrome browser (not headless), so logged-in sessions and cookies work.

Source: https://github.com/badlogic/browser-tools

## Setup

If not already installed:

```bash
git clone https://github.com/badlogic/browser-tools ~/agent-tools/browser-tools
cd ~/agent-tools/browser-tools && npm install
```

To update:

```bash
cd ~/agent-tools/browser-tools && git pull && npm install
```

## Prerequisites

- Google Chrome installed
- Node.js available
- Scripts are in `~/agent-tools/browser-tools/` and must be invoked with full path using `$HOME`

## How to Invoke

All scripts are in `~/agent-tools/browser-tools/`. Invoke via Bash with `$HOME`:

```bash
$HOME/agent-tools/browser-tools/browser-start.js
$HOME/agent-tools/browser-tools/browser-nav.js https://example.com
```

## Tools

### Start Chrome

```bash
$HOME/agent-tools/browser-tools/browser-start.js              # Fresh profile
$HOME/agent-tools/browser-tools/browser-start.js --profile    # With user's profile (cookies, logins)
```

Launches Chrome with remote debugging on `:9222`. **WARNING**: `--profile` kills any running Chrome first and rsyncs the user's profile. Ask the user before using `--profile`.

### Navigate

```bash
$HOME/agent-tools/browser-tools/browser-nav.js https://example.com        # Current tab
$HOME/agent-tools/browser-tools/browser-nav.js https://example.com --new   # New tab
```

### Evaluate JavaScript

```bash
$HOME/agent-tools/browser-tools/browser-eval.js 'document.title'
$HOME/agent-tools/browser-tools/browser-eval.js 'document.querySelectorAll("a").length'
```

Runs JS in the active tab's page context (async). Use for DOM inspection, data extraction, clicking elements, filling forms.

### Screenshot

```bash
$HOME/agent-tools/browser-tools/browser-screenshot.js
```

Captures viewport screenshot, returns temp file path. Read the file to see it.

### Pick Elements (Interactive)

```bash
$HOME/agent-tools/browser-tools/browser-pick.js "Click the submit button"
```

Launches an interactive overlay in the browser. The user clicks elements to select them (Cmd/Ctrl+Click for multi-select, Enter to finish). Returns CSS selectors and element info. Use when the user wants to point at something on the page.

### Cookies

```bash
$HOME/agent-tools/browser-tools/browser-cookies.js
```

Shows all cookies for the current tab (including httpOnly).

### Search Google

```bash
$HOME/agent-tools/browser-tools/browser-search.js "query"
$HOME/agent-tools/browser-tools/browser-search.js "query" -n 10
$HOME/agent-tools/browser-tools/browser-search.js "query" -n 3 --content
```

Search Google and return results. `-n` for count, `--content` to also extract page content from each result.

### Extract Page Content

```bash
$HOME/agent-tools/browser-tools/browser-content.js https://example.com
```

Navigates to URL and extracts readable content as markdown (uses Readability + Turndown).

## Workflow Tips

1. Always start Chrome first with `browser-start.js` (use `--profile` if the user needs to be logged in)
2. Use `browser-eval.js` for most interactions — the model knows DOM APIs well
3. Use `browser-pick.js` when the user wants to visually select elements
4. Use `browser-screenshot.js` to verify page state visually
5. Chain commands: search Google, review results, then extract content from specific URLs
6. Results are composable — pipe output to files, chain with other tools
