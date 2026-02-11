#!/usr/bin/env python3
"""
RocketReach Account Check
Shows account info, credit usage, and rate limits.

Usage:
  export ROCKETREACH_API_KEY="your_key"
  python3 check_account.py
"""

import json, urllib.request, ssl, os, sys

API_KEY = os.environ.get("ROCKETREACH_API_KEY")
if not API_KEY:
    print("Error: set ROCKETREACH_API_KEY environment variable")
    sys.exit(1)

url = "https://api.rocketreach.co/api/v2/account"
ctx = ssl.create_default_context()
req = urllib.request.Request(url)
req.add_header("Api-Key", API_KEY)
req.add_header("User-Agent", "curl/8.0")

try:
    resp = urllib.request.urlopen(req, context=ctx)
    data = json.loads(resp.read())

    print("ACCOUNT INFO")
    print("=" * 50)
    print(f"  Name:   {data.get('first_name','')} {data.get('last_name','')}")
    print(f"  Email:  {data.get('email','')}")
    print(f"  Status: {data.get('state','')}")

    print("\nCREDIT USAGE")
    print("-" * 50)
    for c in data.get("credit_usage", []):
        print(f"  {c['credit_type']:<25} used: {str(c['used']):<8} remaining: {c['remaining']}")

    print("\nRATE LIMITS")
    print("-" * 50)
    for r in data.get("rate_limits", []):
        print(f"  {r['action']:<20} ({r['duration']:<12}) limit: {str(r['limit']):<6} used: {str(r['used']):<4} remaining: {r['remaining']}")

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
