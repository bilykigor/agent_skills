#!/usr/bin/env node
/**
 * RocketReach People Lookup
 * Looks up full contact details (validated emails) for person IDs from search results.
 *
 * Usage:
 *   export ROCKETREACH_API_KEY="your_key"
 *   node lookup_people.js
 *
 * Reads search_results.json (output of search_people.js) and produces:
 *   - lookup_results.json  (raw JSON)
 *   - contacts.csv         (CSV)
 *   - contacts.txt         (readable text)
 *   - contacts.md          (markdown)
 *
 * Rate limit: 15 lookups/minute. Auto-paces with 4s delay + 65s pause every 12 lookups.
 */

const fs = require("fs");

const API_KEY = process.env.ROCKETREACH_API_KEY;
if (!API_KEY) {
  console.error("Error: set ROCKETREACH_API_KEY environment variable");
  process.exit(1);
}

const BASE = "https://api.rocketreach.co/v2/api/lookupProfile";
const MAX_PER_COMPANY = 7;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let searchData;
try {
  searchData = JSON.parse(fs.readFileSync("search_results.json", "utf8"));
} catch {
  console.error("Error: search_results.json not found. Run search_people.js first.");
  process.exit(1);
}

async function lookupPerson(id, attempt = 1) {
  const res = await fetch(`${BASE}?id=${id}`, {
    headers: { "Api-Key": API_KEY },
  });

  if (res.status === 429 && attempt <= 2) {
    let wait = 60;
    try {
      const body = await res.json();
      wait = Math.ceil(parseFloat(body.wait || "60")) + 2;
    } catch {}
    console.log(`    Rate limited, waiting ${wait}s...`);
    await sleep(wait * 1000);
    return lookupPerson(id, attempt + 1);
  }

  if (!res.ok) {
    console.log(`    HTTP Error ${res.status}`);
    return null;
  }

  const data = await res.json();

  let bestEmail = "";
  let emailGrade = "";

  for (const e of data.emails || []) {
    if (e.type === "professional" && e.smtp_valid === "valid") {
      if (!bestEmail || (e.grade || "Z") < emailGrade) {
        bestEmail = e.email;
        emailGrade = e.grade || "";
      }
    }
  }

  if (!bestEmail) {
    bestEmail = data.recommended_professional_email || data.current_work_email || "";
    emailGrade = "N/A";
  }

  if (bestEmail === "None") bestEmail = "";

  return {
    first_name: data.first_name || "",
    last_name: data.last_name || "",
    title: data.current_title || "",
    employer: data.current_employer || "",
    validated_work_email: bestEmail,
    email_grade: emailGrade,
    location: data.location || "",
  };
}

async function main() {
  const results = {};
  let totalLookups = 0;

  for (const [company, data] of Object.entries(searchData)) {
    const profiles = data.profiles || [];
    const withEmail = profiles.filter((p) => (p.teaser?.professional_emails || []).length > 0);
    const withoutEmail = profiles.filter((p) => (p.teaser?.professional_emails || []).length === 0);
    const candidates = [...withEmail, ...withoutEmail].slice(0, MAX_PER_COMPANY);

    results[company] = [];
    console.log(`\n=== ${company} (${candidates.length} lookups) ===`);

    for (const p of candidates) {
      if (totalLookups > 0 && totalLookups % 12 === 0) {
        console.log("  ... pausing 65s for rate limit ...");
        await sleep(65000);
      }

      const entry = await lookupPerson(p.id);
      if (entry) {
        if (!entry.first_name) {
          const parts = (p.name || "").split(" ");
          entry.first_name = parts[0] || "";
          entry.last_name = parts.slice(1).join(" ");
        }
        results[company].push(entry);
        const email = entry.validated_work_email || "NO EMAIL";
        console.log(`  OK: ${entry.first_name} ${entry.last_name} | ${entry.title} | ${email} (${entry.email_grade})`);
      }

      totalLookups++;
      await sleep(4000);
    }
  }

  // --- Save JSON ---
  fs.writeFileSync("lookup_results.json", JSON.stringify(results, null, 2));

  // --- Collect rows ---
  const rows = [];
  for (const [company, people] of Object.entries(results)) {
    for (const p of people) {
      if (p.validated_work_email) {
        rows.push({ company, ...p });
      }
    }
  }

  // --- Save CSV ---
  const csvHeader = "Company,First Name,Last Name,Position,Validated Work Email,Email Grade,Location";
  const csvRows = rows.map((r) => {
    const esc = (s) => `"${(s || "").replace(/"/g, '""')}"`;
    return [esc(r.company), esc(r.first_name), esc(r.last_name), esc(r.title), esc(r.validated_work_email), esc(r.email_grade), esc(r.location)].join(",");
  });
  fs.writeFileSync("contacts.csv", [csvHeader, ...csvRows].join("\n") + "\n");

  // --- Save TXT ---
  let txt = "ROCKETREACH CONTACTS\n" + "=".repeat(60) + "\n\n";
  for (const [company, people] of Object.entries(results)) {
    const valid = people.filter((p) => p.validated_work_email);
    txt += `${company} (${valid.length} contacts)\n` + "-".repeat(60) + "\n";
    valid.forEach((p, i) => {
      txt += `${i + 1}. ${p.first_name} ${p.last_name.padEnd(20)} | ${p.title.padEnd(45)} | ${p.validated_work_email.padEnd(35)} | Grade: ${p.email_grade}\n`;
    });
    txt += "\n";
  }
  txt += `\nTotal: ${rows.length} contacts\n`;
  fs.writeFileSync("contacts.txt", txt);

  // --- Save MD ---
  let md = "# RocketReach Contacts\n\n";
  for (const [company, people] of Object.entries(results)) {
    const valid = people.filter((p) => p.validated_work_email);
    if (!valid.length) continue;
    md += `## ${company}\n\n`;
    md += "| First Name | Last Name | Position | Validated Work Email | Grade | Location |\n";
    md += "|---|---|---|---|---|---|\n";
    for (const p of valid) {
      md += `| ${p.first_name} | ${p.last_name} | ${p.title} | ${p.validated_work_email} | ${p.email_grade} | ${p.location} |\n`;
    }
    md += "\n";
  }
  fs.writeFileSync("contacts.md", md);

  console.log(`\nDone! ${rows.length} contacts saved to: contacts.csv, contacts.txt, contacts.md, lookup_results.json`);
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
