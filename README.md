# Agent Skills

A collection of skills for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — Anthropic's CLI for Claude.

## Available Skills

| Skill | Description |
|-------|-------------|
| [rocketreach](skills/rocketreach/) | Search for professional contacts, look up validated emails, enrich company data via the RocketReach API |

---

## Getting Started

### Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed (`npm install -g @anthropic-ai/claude-code`)
- A RocketReach API key (get one at [rocketreach.co](https://rocketreach.co/signup))

### Installation

#### Option 1: Install a single skill (recommended)

Copy the skill folder into your personal Claude skills directory:

```bash
# Create the skills directory if it doesn't exist
mkdir -p ~/.claude/skills

# Clone the repo and copy the skill you want
git clone https://github.com/bilykigor/agent_skills.git /tmp/agent_skills
cp -r /tmp/agent_skills/skills/rocketreach ~/.claude/skills/rocketreach
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

### Set your API key

Export your RocketReach API key before starting Claude Code:

```bash
export ROCKETREACH_API_KEY="your_key_here"
claude
```

Or add it to your shell profile (`~/.bashrc`, `~/.zshrc`) for persistence:

```bash
echo 'export ROCKETREACH_API_KEY="your_key_here"' >> ~/.zshrc
source ~/.zshrc
```

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

### Example workflow

```
You:    Find me 6-7 contacts (HR, CEO, Business Development) at Acme Corp and Globex Inc
Claude: [runs search for each company, then lookups for each person]
Claude: Here are your results — saved to contacts.csv, contacts.md, and contacts.txt

You:    /rocketreach enrich acme.com
Claude: [returns company metadata: industry, size, revenue, location, etc.]
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
skills/rocketreach/
├── SKILL.md                  # Skill definition, curl examples, instructions
├── references/
│   └── api.md                # Full RocketReach API reference
└── scripts/
    ├── check_account.js      # Account info and credits
    ├── search_people.js      # Search people by company + titles
    ├── lookup_people.js      # Batch lookup with rate limiting → CSV/MD/TXT/JSON
    └── enrich_company.js     # Company enrichment by name or domain
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
