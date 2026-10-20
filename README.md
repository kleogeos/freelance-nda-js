# freelance-nda-js

![test](https://github.com/kleogeos/freelance-nda-js/actions/workflows/test.yml/badge.svg)

Generate a plain-language, print-ready mutual NDA (HTML) from a JSON file. Zero dependencies, no sign-up, no SaaS account. Node.js port of [freelance-nda-cli](https://github.com/kleogeos/freelance-nda-cli).

```bash
npx github:kleogeos/freelance-nda-js example.json -o nda.html
```

Produces a one-page agreement: confidentiality obligations, standard exclusions (public info, prior knowledge, independent development, legal disclosure), term length, and a signature block — ready to open in a browser, review together, and print to PDF or sign.

### Why this exists

A new client conversation often stalls on "can you sign an NDA before we talk details?" — and a one-off NDA from a lawyer costs more than the discovery call is worth. This gives you something reasonable to send in two minutes instead of either skipping confidentiality or going silent on the ask.

### Install (optional)

```bash
npm install -g github:kleogeos/freelance-nda-js
freelance-nda example.json -o nda.html
```

### JSON format

```json
{
  "party_a": "Your name",
  "party_b": "Client name",
  "purpose": "discussing a potential project, including client's internal data",
  "term_years": 2,
  "mutual": true,
  "governing_law": "the State of California",
  "exclusions": ["optional custom list — otherwise uses standard exclusions"]
}
```

Only `party_a` and `party_b` are required; everything else is optional and has a sensible default.

`mutual` (default `true`) generates a mutual NDA where both sides have the same obligations — the usual case for a freelance discovery call where both parties might share sensitive information. Set it to `false` for a one-way NDA where only `party_a` is the disclosing party.

### Is this legal advice?

No. This is a general-purpose template covering the basics of a straightforward mutual NDA. For high-value, cross-border, or especially sensitive engagements, have a licensed attorney in your jurisdiction review or draft the agreement instead. The generated document says so too, right above the signature block.

### Where this fits

Send this before the first detailed call → once you're ready to scope the work, follow up with a [proposal](https://github.com/kleogeos/freelance-proposal-js) → get it signed with [freelance-contract-cli](https://github.com/kleogeos/freelance-contract-cli) → bill it with [freelance-invoice-js](https://github.com/kleogeos/freelance-invoice-js).

Want a more complete set of ready-to-send client documents (proposal, services agreement, invoice + late-payment emails, client scripts) already laid out? See the [Freelancer Starter Kit](https://kleogeos.github.io/freelancer-tools/kit.html?src=cli-nda-js).

Prefer Python? See the original [freelance-nda-cli](https://github.com/kleogeos/freelance-nda-cli).

## Tests

```bash
node test.js
```
