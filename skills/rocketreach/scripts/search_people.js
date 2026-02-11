#!/usr/bin/env node
/**
 * RocketReach People Search
 * Searches for people at specified companies with target job titles.
 *
 * Usage:
 *   export ROCKETREACH_API_KEY="your_key"
 *   node search_people.js
 *
 * Edit COMPANIES and TITLES below to customize your search.
 * Results saved to search_results.json in the current directory.
 */

const fs = require("fs");

const API_KEY = process.env.ROCKETREACH_API_KEY;
if (!API_KEY) {
  console.error("Error: set ROCKETREACH_API_KEY environment variable");
  process.exit(1);
}

const BASE = "https://api.rocketreach.co/v2/api/search";

// --- CUSTOMIZE THESE ---
const COMPANIES = ["Example Company"];

const TITLES = [
  "HR", "CEO", "Managing Director", "Business Development",
  "Human Resources", "Chief Executive Officer", "Director",
  "Head of HR", "VP Human Resources", "Chief Human Resources Officer",
  "HR Director", "VP Business Development", "Head of Business Development",
  "Founder", "Partner", "Manager",
];

const PAGE_SIZE = 10;
// ------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchCompany(company) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Api-Key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: {
        current_employer: [company],
        current_title: TITLES,
      },
      start: 1,
      page_size: PAGE_SIZE,
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

async function main() {
  const results = {};

  for (const company of COMPANIES) {
    console.log(`\nSearching: ${company}...`);
    try {
      const data = await searchCompany(company);
      const total = data.pagination?.total || 0;
      const profiles = data.profiles || [];

      results[company] = { total, profiles };
      console.log(`  Found ${total} total, returned ${profiles.length} profiles`);

      for (const p of profiles) {
        const pro = p.teaser?.professional_emails || [];
        console.log(`    id=${p.id} | ${p.name} | ${p.current_title || ""} | pro_emails=${JSON.stringify(pro)}`);
      }
    } catch (e) {
      console.log(`  Error: ${e.message}`);
      results[company] = { total: 0, profiles: [] };
    }
    await sleep(500);
  }

  fs.writeFileSync("search_results.json", JSON.stringify(results, null, 2));
  console.log("\nResults saved to search_results.json");
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
