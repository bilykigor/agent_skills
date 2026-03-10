---
name: browser-tools
description: Browser automation via Chrome DevTools Protocol using Mario Zechner's browser-tools. Use when user asks to open a browser, navigate to a site, scrape a page, take a screenshot, pick DOM elements, extract page content, or search Google via browser. Also use when user needs to interact with a website using their real Chrome profile (logged-in sessions, cookies).
allowed-tools: Bash(browser-*.js *), Bash(cd ~/agent-tools/browser-tools && npm install), Bash(cd ~/agent-tools/browser-tools && git pull), Read, Glob
---

# Browser Tools

Chrome DevTools Protocol tools for browser automation, scraping, and web interaction. Launches a separate Chrome instance with its own profile at `~/.cache/browser-tools`, so it won't interfere with the user's main Chrome.

Source: https://github.com/badlogic/pi-skills/tree/main/browser-tools

## Setup

If not already installed:

```bash
git clone https://github.com/badlogic/pi-skills /tmp/pi-skills
cp -r /tmp/pi-skills/browser-tools ~/agent-tools/browser-tools
cd ~/agent-tools/browser-tools && npm install
rm -rf /tmp/pi-skills
```

To update:

```bash
git clone https://github.com/badlogic/pi-skills /tmp/pi-skills
cp -r /tmp/pi-skills/browser-tools/* ~/agent-tools/browser-tools/
cd ~/agent-tools/browser-tools && npm install
rm -rf /tmp/pi-skills
```

## Prerequisites

- Google Chrome installed
- Node.js available
- Scripts are in `~/agent-tools/browser-tools/` — invoke with full path using `$HOME`

## Tools

### Start Chrome

```bash
$HOME/agent-tools/browser-tools/browser-start.js              # Fresh isolated profile
$HOME/agent-tools/browser-tools/browser-start.js --profile    # Rsync user's Chrome profile (cookies, logins)
```

Launches a **separate** Chrome instance with remote debugging on `:9222`, using an isolated data dir at `~/.cache/browser-tools`. If Chrome is already running on :9222, it reuses it. The `--profile` flag rsyncs the user's main Chrome profile into the isolated dir (ask user before using).

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

Runs JS in the active tab's page context (async). Code is wrapped in `return (...)`, so use IIFEs for multi-statement code (see Efficiency Guide below).

### Screenshot

```bash
$HOME/agent-tools/browser-tools/browser-screenshot.js
```

Captures viewport screenshot, returns temp file path. Read the file to see it.

### Pick Elements (Interactive)

```bash
$HOME/agent-tools/browser-tools/browser-pick.js "Click the submit button"
```

Launches an interactive overlay. User clicks elements to select (Cmd/Ctrl+Click for multi-select, Enter to finish). Returns element info. Use when the user wants to visually select something.

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

## Efficiency Guide

### DOM Inspection Over Screenshots

**Don't** take screenshots to see page state. **Do** parse the DOM directly:

```javascript
Array.from(document.querySelectorAll('button, input, [role="button"]')).map(e => ({
  id: e.id, text: e.textContent.trim(), class: e.className
}))
```

### Complex Scripts — Use IIFEs

Code is wrapped in `return (...)`. For multi-statement code, always use an IIFE:

```javascript
(function() {
  const data = document.querySelector('#target').textContent;
  document.querySelector('button').click();
  return JSON.stringify({ data });
})()
```

### Batch Interactions

**Don't** make separate calls for each click. **Do** batch them:

```javascript
(function() {
  ["btn1", "btn2", "btn3"].forEach(id => document.getElementById(id).click());
  return "Done";
})()
```

### Shell Quoting Issues

For complex JS with quotes, write to a temp file:

```bash
# Write JS to temp file, then eval it
$HOME/agent-tools/browser-tools/browser-eval.js "$(cat /tmp/eval.js)"
```

### Investigate Before Interacting

Always start by understanding the page structure:

```javascript
(function() {
  return JSON.stringify({
    title: document.title,
    forms: document.forms.length,
    buttons: document.querySelectorAll('button').length,
    inputs: document.querySelectorAll('input').length,
    mainContent: document.body.innerHTML.slice(0, 3000)
  }, null, 2);
})()
```

### Waiting for Updates

If DOM updates after actions, add a small delay:

```bash
sleep 0.5 && $HOME/agent-tools/browser-tools/browser-eval.js '...'
```

## Workflow Tips

1. Always start Chrome first with `browser-start.js`
2. Use `browser-eval.js` for most interactions — the model knows DOM APIs well
3. Use `browser-pick.js` when the user wants to visually select elements
4. Use `browser-screenshot.js` only when visual verification is needed
5. Results are composable — pipe output to files, chain with other tools
