#!/usr/bin/env node
/**
 * RocketReach Account Check
 * Shows account info, credit usage, and rate limits.
 *
 * Usage:
 *   export ROCKETREACH_API_KEY="your_key"
 *   node check_account.js
 */

const API_KEY = process.env.ROCKETREACH_API_KEY;
if (!API_KEY) {
  console.error("Error: set ROCKETREACH_API_KEY environment variable");
  process.exit(1);
}

async function main() {
  const res = await fetch("https://api.rocketreach.co/api/v2/account", {
    headers: { "Api-Key": API_KEY },
  });

  if (!res.ok) {
    console.error(`HTTP ${res.status}: ${await res.text()}`);
    process.exit(1);
  }

  const data = await res.json();

  console.log("ACCOUNT INFO");
  console.log("=".repeat(50));
  console.log(`  Name:   ${data.first_name || ""} ${data.last_name || ""}`);
  console.log(`  Email:  ${data.email || ""}`);
  console.log(`  Status: ${data.state || ""}`);

  console.log("\nCREDIT USAGE");
  console.log("-".repeat(50));
  for (const c of data.credit_usage || []) {
    console.log(
      `  ${c.credit_type.padEnd(25)} used: ${String(c.used).padEnd(8)} remaining: ${c.remaining}`
    );
  }

  console.log("\nRATE LIMITS");
  console.log("-".repeat(50));
  for (const r of data.rate_limits || []) {
    console.log(
      `  ${r.action.padEnd(20)} (${r.duration.padEnd(12)}) limit: ${String(r.limit).padEnd(6)} used: ${String(r.used).padEnd(4)} remaining: ${r.remaining}`
    );
  }
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
