---
name: browser-tools
description: Browser automation via Chrome DevTools Protocol using Mario Zechner's browser-tools. Use when user asks to open a browser, navigate to a site, scrape a page, take a screenshot, pick DOM elements, extract page content, or search Google via browser. Also use when user needs to interact with a website using their real Chrome profile (logged-in sessions, cookies).
allowed-tools: Bash(browser-*.js *), Bash(cd ~/agent-tools/browser-tools && npm install), Read, Glob
---

# Browser Tools

## Setup

```bash
git clone https://github.com/badlogic/pi-skills ~/agent-tools/pi-skills
cd ~/agent-tools/pi-skills/browser-tools && npm install
```

## Usage

Read the full skill documentation:

```bash
cat ~/agent-tools/pi-skills/browser-tools/SKILL.md
```
