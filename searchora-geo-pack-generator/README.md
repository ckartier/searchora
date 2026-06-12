# Searchora GEO Pack Generator

Generates a **universal, installable GEO pack** from a Searchora audit file
(`.geo` or `.json`). The pack works on any website — WordPress, Webflow,
Shopify, custom HTML, Next.js — and contains everything a site needs to be
visible to AI answer engines (ChatGPT, Gemini, Copilot, Perplexity…).

## Requirements

- Node.js 20+
- No dependencies, no network access, no paid APIs.

## Usage

```bash
npm install
npm run build -- ./examples/searchora-audit.example.geo
```

Output is written to:

```text
dist/searchora-geo-pack/
  llms.txt                 # Brand summary for AI crawlers — place at the site root
  searchora-schema.json    # Schema.org JSON-LD graph (Organization, WebSite, FAQPage, Service, Person, LocalBusiness)
  searchora-head.html      # Ready-to-paste <script type="application/ld+json"> block for the <head>
  searchora-faq.html       # Self-contained responsive FAQ section (HTML/CSS, no JS)
  searchora-data.json      # Cleaned source data, kept for future regeneration
  install.md               # Step-by-step installation instructions
  report.html              # Human-readable pack summary (score, services, FAQ, files)
```

Zip that folder and it is the deliverable you hand to a client.

## Input format

The audit file is plain JSON (the `.geo` extension is a convention). Required
fields: `company.name` and `company.url`. Everything else is optional —
sections without data are simply omitted from the output. See
[examples/searchora-audit.example.geo](examples/searchora-audit.example.geo)
for a complete example.

| Field | Used for |
| --- | --- |
| `company` (name, url, logo, description, email, phone, industry, languages, social) | Organization + WebSite schema, llms.txt |
| `company.founder` | Person schema |
| `company.address` | LocalBusiness schema |
| `services[]` | Service schema, llms.txt |
| `faq[]` | FAQPage schema, FAQ HTML, llms.txt |
| `pages[]` | Key pages in llms.txt and report |
| `keywords[]` | Topics section of llms.txt |
| `geoScore` | Report header |

## Security

- The input file is parsed with `JSON.parse` only — no code from the file is
  ever evaluated.
- Input is limited to 1 MB.
- All strings are sanitized (HTML tags and control characters stripped) and
  HTML-escaped in every generated HTML file; `</` is escaped inside the
  JSON-LD script block.

## Module layout

```text
src/
  index.js               # CLI entry — orchestrates the pipeline
  validate.js            # File size / JSON / shape validation
  sanitize.js            # Data cleaning and normalization
  generate-llms.js       # llms.txt
  generate-schema.js     # Schema.org JSON-LD graph
  generate-head-html.js  # <head> block
  generate-faq-html.js   # FAQ section
  generate-report.js     # report.html
  generate-install-md.js # install.md
  html-utils.js          # Shared HTML escaping
```
