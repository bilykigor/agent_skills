---
name: browser-tools
description: Browser automation via Chrome DevTools Protocol using Mario Zechner's browser-tools. Use when user asks to open a browser, navigate to a site, scrape a page, take a screenshot, pick DOM elements, extract page content, or search Google via browser. Also use when user needs to interact with a website using their real Chrome profile (logged-in sessions, cookies).
allowed-tools: Bash(browser-*.js *), Bash(cd ~/agent-tools/browser-tools && npm install), Read, Glob
---

# Browser Tools

## Setup

```bash
git clone https://github.com/badlogic/pi-skills /tmp/pi-skills
cp -r /tmp/pi-skills/browser-tools ~/agent-tools/browser-tools
cd ~/agent-tools/browser-tools && npm install
rm -rf /tmp/pi-skills
```

## Usage

Read the full skill documentation:

```bash
cat ~/agent-tools/browser-tools/SKILL.md
```
