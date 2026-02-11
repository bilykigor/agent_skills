#!/usr/bin/env python3
"""
RocketReach People Lookup
Looks up full contact details (validated emails) for person IDs from search results.

Usage:
  export ROCKETREACH_API_KEY="your_key"
  python3 lookup_people.py

Reads search_results.json (output of search_people.py) and produces:
  - lookup_results.json  (raw JSON)
  - contacts.csv         (CSV)
  - contacts.txt         (readable text)
  - contacts.md          (markdown)

Rate limit: 15 lookups/minute. Auto-paces with 4s delay + 65s pause every 12 lookups.
"""

import json, urllib.request, ssl, os, sys, time, csv

API_KEY = os.environ.get("ROCKETREACH_API_KEY")
if not API_KEY:
    print("Error: set ROCKETREACH_API_KEY environment variable")
    sys.exit(1)

BASE = "https://api.rocketreach.co/v2/api/lookupProfile"
ctx = ssl.create_default_context()

try:
    with open("search_results.json") as f:
        search_data = json.load(f)
except FileNotFoundError:
    print("Error: search_results.json not found. Run search_people.py first.")
    sys.exit(1)

MAX_PER_COMPANY = 7


def lookup_person(person_id, attempt=1):
    """Lookup a single person by ID. Returns dict or None."""
    url = f"{BASE}?id={person_id}"
    req = urllib.request.Request(url)
    req.add_header("Api-Key", API_KEY)
    req.add_header("User-Agent", "curl/8.0")
    req.add_header("Accept", "*/*")

    try:
        resp = urllib.request.urlopen(req, context=ctx)
        data = json.loads(resp.read())

        best_email = ""
        email_grade = ""
        for e in data.get("emails", []):
            if e.get("type") == "professional" and e.get("smtp_valid") == "valid":
                if not best_email or e.get("grade", "Z") < email_grade:
                    best_email = e["email"]
                    email_grade = e.get("grade", "")

        if not best_email:
            best_email = data.get("recommended_professional_email",
                                  data.get("current_work_email", ""))
            email_grade = "N/A"

        return {
            "first_name": data.get("first_name", ""),
            "last_name": data.get("last_name", ""),
            "title": data.get("current_title", ""),
            "employer": data.get("current_employer", ""),
            "validated_work_email": best_email if best_email and best_email != "None" else "",
            "email_grade": email_grade,
            "location": data.get("location", ""),
        }
    except urllib.error.HTTPError as e:
        if e.code == 429 and attempt <= 2:
            wait = 60
            try:
                body = json.loads(e.read().decode())
                wait = int(float(body.get("wait", 60))) + 2
            except Exception:
                pass
            print(f"    Rate limited, waiting {wait}s...")
            time.sleep(wait)
            return lookup_person(person_id, attempt + 1)
        print(f"    HTTP Error {e.code}")
        return None
    except Exception as e:
        print(f"    Error: {e}")
        return None


results = {}
total_lookups = 0

for company, data in search_data.items():
    profiles = data.get("profiles", [])
    with_email = [p for p in profiles if p.get("teaser", {}).get("professional_emails")]
    without_email = [p for p in profiles if not p.get("teaser", {}).get("professional_emails")]
    candidates = (with_email + without_email)[:MAX_PER_COMPANY]

    results[company] = []
    print(f"\n=== {company} ({len(candidates)} lookups) ===")

    for p in candidates:
        if total_lookups > 0 and total_lookups % 12 == 0:
            print("  ... pausing 65s for rate limit ...")
            time.sleep(65)

        entry = lookup_person(p["id"])
        if entry:
            if not entry["first_name"]:
                name_parts = p.get("name", "").split(" ", 1)
                entry["first_name"] = name_parts[0] if name_parts else ""
                entry["last_name"] = name_parts[1] if len(name_parts) > 1 else ""
            results[company].append(entry)
            email = entry["validated_work_email"] or "NO EMAIL"
            print(f"  OK: {entry['first_name']} {entry['last_name']} | {entry['title']} | {email} ({entry['email_grade']})")

        total_lookups += 1
        time.sleep(4)

# --- Save JSON ---
with open("lookup_results.json", "w") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

# --- Save CSV ---
rows = []
for company, people in results.items():
    for p in people:
        if p.get("validated_work_email"):
            rows.append({
                "Company": company,
                "First Name": p["first_name"],
                "Last Name": p["last_name"],
                "Position": p["title"],
                "Validated Work Email": p["validated_work_email"],
                "Email Grade": p["email_grade"],
                "Location": p["location"],
            })

with open("contacts.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["Company", "First Name", "Last Name", "Position",
                                       "Validated Work Email", "Email Grade", "Location"])
    w.writeheader()
    w.writerows(rows)

# --- Save TXT ---
with open("contacts.txt", "w") as f:
    f.write("ROCKETREACH CONTACTS\n")
    f.write("=" * 60 + "\n\n")
    for company, people in results.items():
        valid = [p for p in people if p.get("validated_work_email")]
        f.write(f"{company} ({len(valid)} contacts)\n")
        f.write("-" * 60 + "\n")
        for i, p in enumerate(valid, 1):
            f.write(f"{i}. {p['first_name']} {p['last_name']:<20} | {p['title']:<45} | {p['validated_work_email']:<35} | Grade: {p['email_grade']}\n")
        f.write("\n")
    f.write(f"\nTotal: {len(rows)} contacts\n")

# --- Save MD ---
with open("contacts.md", "w") as f:
    f.write("# RocketReach Contacts\n\n")
    for company, people in results.items():
        valid = [p for p in people if p.get("validated_work_email")]
        if not valid:
            continue
        f.write(f"## {company}\n\n")
        f.write("| First Name | Last Name | Position | Validated Work Email | Grade | Location |\n")
        f.write("|---|---|---|---|---|---|\n")
        for p in valid:
            f.write(f"| {p['first_name']} | {p['last_name']} | {p['title']} | {p['validated_work_email']} | {p['email_grade']} | {p['location']} |\n")
        f.write("\n")

print(f"\nDone! {len(rows)} contacts saved to: contacts.csv, contacts.txt, contacts.md, lookup_results.json")
