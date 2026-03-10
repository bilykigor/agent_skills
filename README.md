# Agent Skills

A collection of skills for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — Anthropic's CLI for Claude.

## Available Skills

| Skill | Description |
|-------|-------------|
| [rocketreach](skills/rocketreach/) | Search for professional contacts, look up validated emails, enrich company data via the RocketReach API |
| [summarize](skills/summarize/) | Summarize any URL, YouTube video, podcast, or file using the [summarize](https://github.com/steipete/summarize) CLI — supports slides extraction, multiple LLM backends, and many output formats |
| [browser-tools](skills/browser-tools/) | Browser automation via Chrome DevTools Protocol using [browser-tools](https://github.com/badlogic/browser-tools) — navigate, eval JS, screenshot, pick elements, scrape content, search Google with your real Chrome profile |
| [yt-transcript](skills/yt-transcript/) | Fetch transcripts, subtitles, and metadata from YouTube videos using yt-dlp — supports multiple languages, SRT/VTT/plain text output |

---

## Getting Started

### Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed (`npm install -g @anthropic-ai/claude-code`)
- **rocketreach**: A RocketReach API key (get one at [rocketreach.co](https://rocketreach.co/signup))
- **summarize**: The `summarize` CLI (`brew install steipete/tap/summarize` or `npm i -g @steipete/summarize`) + at least one LLM API key (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.)

### Installation

#### Option 1: Install a single skill (recommended)

Copy the skill folder into your personal Claude skills directory:

```bash
# Create the skills directory if it doesn't exist
mkdir -p ~/.claude/skills

# Clone the repo and copy the skill you want
git clone https://github.com/bilykigor/agent_skills.git /tmp/agent_skills
cp -r /tmp/agent_skills/skills/<skill-name> ~/.claude/skills/<skill-name>

# Examples:
cp -r /tmp/agent_skills/skills/rocketreach ~/.claude/skills/rocketreach
cp -r /tmp/agent_skills/skills/summarize ~/.claude/skills/summarize
```

The skill is now available in **all your Claude Code sessions**.

#### Option 2: Install for a specific project only

Copy the skill into your project's `.claude/skills/` directory:

```bash
cd your-project
mkdir -p .claude/skills
git clone https://github.com/bilykigor/agent_skills.git /tmp/agent_skills
cp -r /tmp/agent_skills/skills/rocketreach .claude/skills/rocketreach
```

The skill will only be available when working in that project.

#### Option 3: Use the whole repo as a project

```bash
git clone https://github.com/bilykigor/agent_skills.git
cd agent_skills
claude  # start Claude Code here
```

### Set your API keys

Export the required API keys before starting Claude Code:

```bash
# RocketReach
export ROCKETREACH_API_KEY="your_key_here"

# Summarize (at least one LLM key)
export OPENAI_API_KEY="your_key_here"
# or: ANTHROPIC_API_KEY, GEMINI_API_KEY, XAI_API_KEY

claude
```

Or add them to your shell profile (`~/.bashrc`, `~/.zshrc`) for persistence.

---

## Usage

Once installed, the skill is available via slash commands or natural language:

### Slash commands

```
/rocketreach account                          # check credits and rate limits
/rocketreach search HR and CEO at Google      # search for people
/rocketreach lookup                           # get validated emails from search results
/rocketreach enrich google.com                # enrich company data
```

### Natural language (auto-triggers)

Just ask Claude naturally — the skill auto-activates when relevant:

```
"Find me HR directors and CEOs at Microsoft and Apple"
"Look up the email for John Smith at Tesla"
"What can you tell me about rocketreach.co as a company?"
"Check my RocketReach account credits"
```

### Example workflows

**RocketReach:**
```
You:    Find me 6-7 contacts (HR, CEO, Business Development) at Acme Corp and Globex Inc
Claude: [runs search for each company, then lookups for each person]
Claude: Here are your results — saved to contacts.csv, contacts.md, and contacts.txt
```

**Summarize:**
```
You:    Summarize https://www.youtube.com/watch?v=VIDEO_ID
Claude: [fetches transcript, runs LLM summary, returns key points]

You:    /summarize https://example.com/long-article
Claude: [extracts content, generates concise summary]

You:    Summarize this video with slides: https://youtu.be/VIDEO_ID
Claude: [extracts slides + transcript, returns summary with slide screenshots]
```

### Output formats

The lookup command produces results in multiple formats:

| File | Format |
|------|--------|
| `contacts.csv` | Spreadsheet-ready CSV |
| `contacts.md` | Markdown tables |
| `contacts.txt` | Plain text, easy to read |
| `lookup_results.json` | Raw JSON with all fields |

---

## How it works

The skill provides Claude with two methods to call the RocketReach API:

1. **curl commands** (zero dependencies) — Claude executes curl directly for simple lookups
2. **Node.js scripts** (included) — for batch operations with automatic rate limiting and multi-format output

Node.js is guaranteed to be available since Claude Code requires it.

### Skill structure

```
skills/
├── rocketreach/
│   ├── SKILL.md                  # Skill definition, curl examples, instructions
│   ├── references/
│   │   └── api.md                # Full RocketReach API reference
│   └── scripts/
│       ├── check_account.js      # Account info and credits
│       ├── search_people.js      # Search people by company + titles
│       ├── lookup_people.js      # Batch lookup with rate limiting → CSV/MD/TXT/JSON
│       └── enrich_company.js     # Company enrichment by name or domain
└── summarize/
    ├── SKILL.md                  # Skill definition, CLI flags, workflow
    └── test.sh                   # Test suite (8 tests)
```

---

## Rate Limits

The RocketReach API has rate limits that the skill respects automatically:

| Action | Per Minute | Per Hour | Per Day |
|--------|-----------|----------|---------|
| Search | 15 | 50 | 500 |
| Lookup | 15 | 100 | 500 |

Scripts auto-pace at 4s between lookups with 65s pauses every 12 lookups.

---

## License

MIT
