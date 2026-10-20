#!/usr/bin/env node
"use strict";

const fs = require("fs");

// Matches Python's html.escape(str(s), quote=True): & first, then <, >, ", '.
function esc(v) {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

const DEFAULT_EXCLUSIONS = [
  "information that is or becomes publicly available through no fault of the receiving party",
  "information the receiving party already lawfully knew before disclosure",
  "information independently developed without using the disclosing party's confidential information",
  "information required to be disclosed by law or court order, with prompt notice to the other party where legally permitted",
];

const DISCLAIMER =
  "This is a general-purpose template, not legal advice. It covers the basics " +
  "of a mutual non-disclosure agreement for a straightforward freelance " +
  "discovery call or project discussion. For high-value, cross-border, or " +
  "especially sensitive engagements, have a licensed attorney in your " +
  "jurisdiction review or draft the agreement instead.";

function render(data) {
  const partyA = data.party_a;
  const partyB = data.party_b;
  const purpose = data.purpose !== undefined ? data.purpose : "discussing a potential freelance engagement";
  const termYears = data.term_years !== undefined ? data.term_years : 2;
  const mutual = data.mutual !== undefined ? data.mutual : true;
  const governingLaw = data.governing_law !== undefined ? data.governing_law : "";
  const exclusions = data.exclusions !== undefined ? data.exclusions : DEFAULT_EXCLUSIONS;

  const exclusionsItems = exclusions.map((e) => `<li>${esc(e)}</li>`).join("\n");

  let obligationText;
  let title;
  if (mutual) {
    obligationText =
      `Both ${esc(partyA)} and ${esc(partyB)} may disclose confidential ` +
      "information to each other, and both agree to the same obligations " +
      "below as both a disclosing and a receiving party.";
    title = "Mutual Non-Disclosure Agreement";
  } else {
    obligationText =
      `${esc(partyA)} ("Disclosing Party") may disclose confidential ` +
      `information to ${esc(partyB)} ("Receiving Party"), who agrees to ` +
      "the obligations below.";
    title = "Non-Disclosure Agreement";
  }

  const governingLawBlock = governingLaw
    ? "<h2>6. Governing law</h2><p>This agreement is governed by the laws of " + esc(governingLaw) + ".</p>"
    : "";

  return `<!doctype html><html><head><meta charset="utf-8">
<title>${title} — ${esc(partyA)} & ${esc(partyB)}</title>
<style>
body{font-family:-apple-system,Arial,sans-serif;max-width:680px;margin:40px auto;color:#1a1a1a;line-height:1.5}
h1{font-size:22px}
h2{font-size:16px;margin-top:28px;color:#333}
.meta{color:#666;font-size:14px}
.disclaimer{background:#fff8e6;border:1px solid #f0d58c;border-radius:6px;padding:12px 16px;font-size:13px;color:#664d03;margin-top:24px}
.sig{margin-top:40px;display:flex;gap:40px}
.sig div{flex:1;border-top:1px solid #999;padding-top:6px;font-size:13px;color:#666}
@media print{body{margin:0} .disclaimer{background:none}}
</style></head><body>
<h1>${title}</h1>
<p class="meta">Between <b>${esc(partyA)}</b> and <b>${esc(partyB)}</b><br>
Purpose: ${esc(purpose)}</p>

<h2>1. Confidential information</h2>
<p>${obligationText} "Confidential information" means any non-public business, technical, or financial information disclosed in connection with the purpose above, whether in writing, verbally, or by inspection.</p>

<h2>2. Obligations</h2>
<p>The receiving party agrees to: use confidential information only for the purpose above; not disclose it to third parties without written consent; and protect it with at least the same care used for its own confidential information, but no less than reasonable care.</p>

<h2>3. Exclusions</h2>
<p>Confidential information does not include information that:</p>
<ul>${exclusionsItems}</ul>

<h2>4. Term</h2>
<p>This agreement stays in effect for ${esc(termYears)} year(s) from the date of signing. Confidentiality obligations for information disclosed during that period survive the term's end.</p>

<h2>5. No obligation to proceed</h2>
<p>Signing this agreement does not obligate either party to enter into any further business relationship, contract, or transaction.</p>

${governingLawBlock}

<div class="sig">
<div>${esc(partyA)}<br>Date: ____________</div>
<div>${esc(partyB)}<br>Date: ____________</div>
</div>

<p class="disclaimer">${esc(DISCLAIMER)}</p>
</body></html>`;
}

function printHelp() {
  console.log(`freelance-nda-js - generate a plain-language mutual NDA (HTML) from a JSON file

Usage:
  freelance-nda <input.json> [-o output.html]

Run without installing:
  npx github:kleogeos/freelance-nda-js example.json -o nda.html
`);
}

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length || argv[0] === "--help" || argv[0] === "-h") {
    printHelp();
    process.exit(argv.length ? 0 : 1);
  }

  let input = null;
  let output = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-o" || a === "--output") output = argv[++i];
    else if (!input) input = a;
  }

  if (!input) {
    printHelp();
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(input, "utf8"));

  for (const required of ["party_a", "party_b"]) {
    if (data[required] === undefined) {
      console.error(`error: missing required field '${required}'`);
      process.exit(1);
    }
  }

  const out = render(data);
  if (output) {
    fs.writeFileSync(output, out);
    console.error(`wrote ${output}`);
  } else {
    console.log(out);
  }
}

module.exports = { render, esc };

if (require.main === module) {
  main();
}
