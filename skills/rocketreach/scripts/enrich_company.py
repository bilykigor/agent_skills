#!/usr/bin/env python3
"""
RocketReach Company Enrichment
Look up company metadata by name or domain.

Usage:
  export ROCKETREACH_API_KEY="your_key"
  python3 enrich_company.py "google.com"
  python3 enrich_company.py "Google"
"""

import json, urllib.request, ssl, os, sys

API_KEY = os.environ.get("ROCKETREACH_API_KEY")
if not API_KEY:
    print("Error: set ROCKETREACH_API_KEY environment variable")
    sys.exit(1)

if len(sys.argv) < 2:
    print("Usage: python3 enrich_company.py <company_name_or_domain>")
    sys.exit(1)

query = sys.argv[1]
ctx = ssl.create_default_context()

# Determine if input is a domain or name
if "." in query and " " not in query:
    param = f"domain={urllib.parse.quote(query)}"
else:
    param = f"name={urllib.parse.quote(query)}"

url = f"https://api.rocketreach.co/v2/api/lookupCompany?{param}"
req = urllib.request.Request(url)
req.add_header("Api-Key", API_KEY)
req.add_header("User-Agent", "curl/8.0")

try:
    import urllib.parse
    resp = urllib.request.urlopen(req, context=ctx)
    data = json.loads(resp.read())

    print("COMPANY INFO")
    print("=" * 50)
    for key in ["name", "domain", "website_url", "industry", "location",
                "employee_count", "revenue", "founded_year", "description",
                "linkedin_url", "phone", "sic_code", "naics_code"]:
        val = data.get(key)
        if val:
            print(f"  {key:<20} {val}")

    # Save full result
    outfile = f"company_{query.replace('.','_').replace(' ','_')}.json"
    with open(outfile, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"\nFull data saved to {outfile}")

except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode()[:200]}")
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
