const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { render, esc } = require("./index.js");

// esc() cross-checked against Python's html.escape(str(s), quote=True)
assert.strictEqual(esc("<script>alert(1)</script>"), "&lt;script&gt;alert(1)&lt;/script&gt;");
assert.strictEqual(esc("O'Brien & \"Co\" <test>"), "O&#x27;Brien &amp; &quot;Co&quot; &lt;test&gt;");

// Mutual NDA, defaults, byte-checked against a live run of nda.py example.json
const html = render({
  party_a: "Jane Doe, Freelance Developer",
  party_b: "Acme Corp",
  purpose: "discussing a potential website redesign project, including Acme Corp's internal analytics data and unreleased branding",
  term_years: 2,
  mutual: true,
  governing_law: "the State of California",
});
assert.ok(html.includes("Mutual Non-Disclosure Agreement"));
assert.ok(html.includes("Acme Corp&#x27;s internal analytics data"));
assert.ok(html.includes("Governing law"));
assert.ok(html.includes("the State of California"));

// Defaults: no purpose/term_years/mutual/governing_law/exclusions supplied
const html2 = render({ party_a: "Solo Dev", party_b: "Client & Co <test>" });
assert.ok(html2.includes("discussing a potential freelance engagement"));
assert.ok(html2.includes("Client &amp; Co &lt;test&gt;"));
assert.ok(!html2.includes("Governing law")); // omitted when absent
assert.ok(html2.includes("information that is or becomes publicly available")); // default exclusions

// One-way NDA with custom exclusions
const html3 = render({
  party_a: "A",
  party_b: "B",
  mutual: false,
  exclusions: ["custom one", 'custom two "quoted"'],
});
assert.ok(html3.includes("Non-Disclosure Agreement"));
assert.ok(!html3.includes("Mutual Non-Disclosure Agreement"));
assert.ok(html3.includes('("Disclosing Party")'));
assert.ok(html3.includes("custom one"));
assert.ok(html3.includes("custom two &quot;quoted&quot;"));
assert.ok(!html3.includes("information that is or becomes publicly available")); // defaults overridden

// output-file round trip via the CLI entrypoint
const tmpIn = path.join(os.tmpdir(), `nda-test-${process.pid}.json`);
const tmpOut = path.join(os.tmpdir(), `nda-test-${process.pid}.html`);
fs.writeFileSync(tmpIn, JSON.stringify({ party_a: "A", party_b: "B" }));
try {
  const { execFileSync } = require("child_process");
  execFileSync(process.execPath, [path.join(__dirname, "index.js"), tmpIn, "-o", tmpOut]);
  const written = fs.readFileSync(tmpOut, "utf8");
  assert.ok(written.includes("Non-Disclosure Agreement"));
} finally {
  fs.unlinkSync(tmpIn);
  if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
}

// missing required field -> exit 1 (matches nda.py's explicit check)
{
  const { execFileSync } = require("child_process");
  const tmpIn2 = path.join(os.tmpdir(), `nda-test-missing-${process.pid}.json`);
  fs.writeFileSync(tmpIn2, JSON.stringify({ party_b: "B" }));
  try {
    execFileSync(process.execPath, [path.join(__dirname, "index.js"), tmpIn2]);
    assert.fail("expected non-zero exit for missing party_a");
  } catch (e) {
    assert.strictEqual(e.status, 1);
    assert.ok(e.stderr.toString().includes("missing required field 'party_a'"));
  } finally {
    fs.unlinkSync(tmpIn2);
  }
}

console.log("All tests passed.");
