---
name: rocketreach
description: Search and look up professional contacts via the RocketReach API. Use when the user wants to find people at companies, look up emails, enrich company data, or build contact lists. Requires ROCKETREACH_API_KEY environment variable.
argument-hint: "[search|lookup|account|enrich] [query...]"
allowed-tools: Bash(python3 *), Read, Glob, Grep
---

# RocketReach Skill

Search for professional contacts, look up validated emails, enrich company data, and check account status using the RocketReach API.

## Prerequisites

The environment variable `ROCKETREACH_API_KEY` must be set. If not set, ask the user for their key and export it.

## Commands

### `/rocketreach search <companies and criteria>`

Search for people at specified companies. Pass criteria naturally:
- "search for HR and CEO at Google and Microsoft"
- "search for engineers with Python skills at startups in NYC"

Run the search script:
```bash
python3 ~/.claude/skills/rocketreach/scripts/search_people.py
```

Before running, edit the `COMPANIES` and `TITLES` lists in the script to match the user's request. After running, results are saved to `search_results.json` in the current directory.

### `/rocketreach lookup`

Look up full contact details (validated emails) for people found in a prior search. Reads `search_results.json` and produces:
- `contacts.csv`
- `contacts.txt`
- `contacts.md`
- `lookup_results.json`

```bash
python3 ~/.claude/skills/rocketreach/scripts/lookup_people.py
```

### `/rocketreach account`

Check account info, credit usage, and rate limits:
```bash
python3 ~/.claude/skills/rocketreach/scripts/check_account.py
```

### `/rocketreach enrich <company>`

Enrich a company by domain or name:
```bash
python3 ~/.claude/skills/rocketreach/scripts/enrich_company.py "<company_or_domain>"
```

## Workflow for Contact Lists

When the user asks for contacts at multiple companies:

1. Edit `search_people.py` — set COMPANIES and TITLES to match request
2. Run `search_people.py` — produces `search_results.json`
3. Run `lookup_people.py` — reads search results, does lookups with rate-limit handling (15/min), outputs all formats
4. Review results with the user, note any companies not found

## API Reference

See [references/api.md](references/api.md) for endpoint details, authentication, and rate limits.

## Rate Limits

- Search: 15/min, 50/hr, 500/day
- Lookup: 15/min, 100/hr, 500/day
- Scripts auto-pace at 4s between lookups with 65s pauses every 12 lookups

## Important Notes

- Base URL: `https://api.rocketreach.co` (NOT `rocketreach.co`)
- Search endpoint: `POST /v2/api/search`
- Lookup endpoint: `GET /v2/api/lookupProfile?id=<id>`
- Account endpoint: `GET /api/v2/account`
- Auth header: `Api-Key: <key>`
- Always include `User-Agent: curl/8.0` header in urllib requests
- Search returns teaser emails (domains only) — must do lookup for full validated emails
- Email grades: A = best, A- = good, B = fair. Only use smtp_valid="valid" emails.
