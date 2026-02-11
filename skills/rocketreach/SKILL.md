---
name: rocketreach
description: Search and look up professional contacts via the RocketReach API. Use when the user wants to find people at companies, look up emails, enrich company data, or build contact lists. Requires ROCKETREACH_API_KEY environment variable.
argument-hint: "[search|lookup|account|enrich] [query...]"
allowed-tools: Bash(curl *), Bash(node *), Read, Glob, Grep
---

# RocketReach Skill

Search for professional contacts, look up validated emails, enrich company data, and check account status using the RocketReach API.

## Prerequisites

The environment variable `ROCKETREACH_API_KEY` must be set. If not set, ask the user for their key and export it.

## API Quick Reference

- **Base URL**: `https://api.rocketreach.co` (NOT `rocketreach.co`)
- **Auth header**: `Api-Key: $ROCKETREACH_API_KEY`
- Search: `POST /v2/api/search`
- Lookup: `GET /v2/api/lookupProfile?id=<id>`
- Account: `GET /api/v2/account`
- Company: `GET /v2/api/lookupCompany?domain=<domain>`
- Search returns teaser emails (domains only) — must do lookup per person for full validated emails
- Email grades: A = best, A- = good. Only use `smtp_valid="valid"` emails.

See [references/api.md](references/api.md) for full endpoint details.

## Commands

### `/rocketreach account`

Check account info, credits, and rate limits.

**Via curl (zero dependencies):**
```bash
curl -s "https://api.rocketreach.co/api/v2/account" -H "Api-Key: $ROCKETREACH_API_KEY"
```

**Via script:** `node <skill-dir>/scripts/check_account.js`

### `/rocketreach search <companies and criteria>`

Search for people at specified companies. Parse the user's request into companies and titles.

**Via curl (zero dependencies):**
```bash
curl -s "https://api.rocketreach.co/v2/api/search" \
  -H "Api-Key: $ROCKETREACH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "current_employer": ["Company Name"],
      "current_title": ["CEO", "HR Director", "Managing Director"]
    },
    "start": 1,
    "page_size": 10
  }'
```

Run one search per company. Save all results for the lookup step.

**Via script:** Edit COMPANIES and TITLES in `search_people.js`, then run:
`node <skill-dir>/scripts/search_people.js`

### `/rocketreach lookup`

Look up full contact details for people found in a prior search. For each person, extract their `id` from search results and call:

**Via curl (zero dependencies):**
```bash
curl -s "https://api.rocketreach.co/v2/api/lookupProfile?id=<person_id>" \
  -H "Api-Key: $ROCKETREACH_API_KEY"
```

From the response, extract the best validated professional email:
- Filter `emails[]` for `type="professional"` and `smtp_valid="valid"`
- Pick the one with the best `grade` (A > A- > B+ > ...)
- Fallback to `recommended_professional_email` or `current_work_email`

**Rate limiting**: Max 15 lookups/minute. Wait 4s between calls. If you get HTTP 429, wait the number of seconds in the `wait` field, then retry.

**Via script:** `node <skill-dir>/scripts/lookup_people.js`
Reads `search_results.json`, outputs `contacts.csv`, `contacts.txt`, `contacts.md`, `lookup_results.json`.

### `/rocketreach enrich <company>`

Look up company metadata by domain or name.

**Via curl (zero dependencies):**
```bash
# By domain:
curl -s "https://api.rocketreach.co/v2/api/lookupCompany?domain=google.com" \
  -H "Api-Key: $ROCKETREACH_API_KEY"

# By name:
curl -s "https://api.rocketreach.co/v2/api/lookupCompany?name=Google" \
  -H "Api-Key: $ROCKETREACH_API_KEY"
```

**Via script:** `node <skill-dir>/scripts/enrich_company.js "google.com"`

## Workflow for Contact Lists

When the user asks for contacts at multiple companies:

1. **Search** each company (via curl or `search_people.js`) — note person IDs and teaser data
2. **Lookup** each person (via curl or `lookup_people.js`) — get validated emails, respecting rate limits
3. **Compile** results into user's preferred format (CSV, markdown, text)
4. **Report** any companies not found in the database

## Rate Limits

| Action | Per Minute | Per Hour | Per Day |
|--------|-----------|----------|---------|
| Search | 15 | 50 | 500 |
| Lookup | 15 | 100 | 500 |

Scripts auto-pace at 4s between lookups with 65s pauses every 12 lookups.
When rate limited (HTTP 429), the response includes a `wait` field with seconds to wait.
