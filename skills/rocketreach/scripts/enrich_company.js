#!/usr/bin/env node
/**
 * RocketReach Company Enrichment
 * Look up company metadata by name or domain.
 *
 * Usage:
 *   export ROCKETREACH_API_KEY="your_key"
 *   node enrich_company.js "google.com"
 *   node enrich_company.js "Google"
 */

const fs = require("fs");

const API_KEY = process.env.ROCKETREACH_API_KEY;
if (!API_KEY) {
  console.error("Error: set ROCKETREACH_API_KEY environment variable");
  process.exit(1);
}

const query = process.argv[2];
if (!query) {
  console.error("Usage: node enrich_company.js <company_name_or_domain>");
  process.exit(1);
}

async function main() {
  const param = query.includes(".") && !query.includes(" ")
    ? `domain=${encodeURIComponent(query)}`
    : `name=${encodeURIComponent(query)}`;

  const res = await fetch(
    `https://api.rocketreach.co/v2/api/lookupCompany?${param}`,
    { headers: { "Api-Key": API_KEY } }
  );

  if (!res.ok) {
    const body = await res.text();
    console.error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
    process.exit(1);
  }

  const data = await res.json();

  console.log("COMPANY INFO");
  console.log("=".repeat(50));

  const fields = [
    "name", "domain", "website_url", "industry", "location",
    "employee_count", "revenue", "founded_year", "description",
    "linkedin_url", "phone", "sic_code", "naics_code",
  ];

  for (const key of fields) {
    if (data[key]) {
      console.log(`  ${key.padEnd(20)} ${data[key]}`);
    }
  }

  const outfile = `company_${query.replace(/\./g, "_").replace(/ /g, "_")}.json`;
  fs.writeFileSync(outfile, JSON.stringify(data, null, 2));
  console.log(`\nFull data saved to ${outfile}`);
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
