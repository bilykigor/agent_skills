#!/usr/bin/env python3
"""
RocketReach People Search
Searches for people at specified companies with target job titles.

Usage:
  export ROCKETREACH_API_KEY="your_key"
  python3 search_people.py

Edit COMPANIES and TITLES below to customize your search.
Results saved to search_results.json in the current directory.
"""

import json, urllib.request, ssl, os, sys, time

API_KEY = os.environ.get("ROCKETREACH_API_KEY")
if not API_KEY:
    print("Error: set ROCKETREACH_API_KEY environment variable")
    sys.exit(1)

BASE = "https://api.rocketreach.co/v2/api/search"
ctx = ssl.create_default_context()

# --- CUSTOMIZE THESE ---
COMPANIES = [
    "Example Company",
]

TITLES = [
    "HR", "CEO", "Managing Director", "Business Development",
    "Human Resources", "Chief Executive Officer", "Director",
    "Head of HR", "VP Human Resources", "Chief Human Resources Officer",
    "HR Director", "VP Business Development", "Head of Business Development",
    "Founder", "Partner", "Manager",
]

PAGE_SIZE = 10
# ------------------------

results = {}

for company in COMPANIES:
    print(f"\nSearching: {company}...")
    payload = json.dumps({
        "query": {
            "current_employer": [company],
            "current_title": TITLES,
        },
        "start": 1,
        "page_size": PAGE_SIZE,
    }).encode()

    req = urllib.request.Request(BASE, data=payload)
    req.add_header("Api-Key", API_KEY)
    req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", "curl/8.0")

    try:
        resp = urllib.request.urlopen(req, context=ctx)
        data = json.loads(resp.read())
        total = data.get("pagination", {}).get("total", 0)
        profiles = data.get("profiles", [])
        results[company] = {
            "total": total,
            "profiles": profiles,
        }
        print(f"  Found {total} total, returned {len(profiles)} profiles")
        for p in profiles:
            pro = p.get("teaser", {}).get("professional_emails", [])
            print(f"    id={p['id']} | {p['name']} | {p.get('current_title','')} | pro_emails={pro}")
    except Exception as e:
        print(f"  Error: {e}")
        results[company] = {"total": 0, "profiles": []}

    time.sleep(0.5)

outfile = "search_results.json"
with open(outfile, "w") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\nResults saved to {outfile}")
