// Generates install.md — step-by-step install instructions for the pack.

export function generateInstallMd(audit) {
    const site = audit.company.url.replace(/\/$/, '');

    return `# Searchora GEO Pack — Installation

Pack generated for **${audit.company.name}** (${site}) on ${audit.generatedAt.slice(0, 10)}.

Works on **any website** — WordPress, Webflow, Shopify, custom HTML, Next.js, etc.

## 1. Place \`llms.txt\` at the site root

Upload \`llms.txt\` so it is reachable at:

\`\`\`text
${site}/llms.txt
\`\`\`

- **Static / custom site**: copy the file into the web root (next to \`index.html\`).
- **WordPress**: upload to the root folder via FTP, or use a file-manager plugin.
- **Next.js**: put it in \`public/\`.
- **Shopify / Webflow**: use the platform's file hosting or a redirect rule.

## 2. Add the structured data to the \`<head>\`

Open \`searchora-head.html\`, copy the **whole block**, and paste it just before
\`</head>\` — ideally on every page, at minimum on the homepage.

- **WordPress**: Appearance → Theme File Editor → \`header.php\`, or use a
  "header scripts" plugin (WPCode, Insert Headers and Footers).
- **Custom site**: paste into your base layout/template.

## 3. Add the FAQ section

Open \`searchora-faq.html\` and paste its content into your FAQ page (or any
page where the questions should appear). It is self-contained (HTML + CSS,
no JavaScript) and responsive.

## 4. Test the structured data

1. Open https://search.google.com/test/rich-results and test ${site}
2. Or paste the content of \`searchora-schema.json\` into https://validator.schema.org
3. Confirm the **Organization**, **WebSite** and **FAQPage** types are detected without errors.

## 5. Verify llms.txt is live

Open in a browser:

\`\`\`text
${site}/llms.txt
\`\`\`

You should see the Markdown summary of the brand.

## Files in this pack

| File | Purpose |
| --- | --- |
| \`llms.txt\` | Brand summary for AI crawlers — site root |
| \`searchora-head.html\` | JSON-LD block to paste before \`</head>\` |
| \`searchora-schema.json\` | Raw Schema.org JSON-LD (for validators / CMS fields) |
| \`searchora-faq.html\` | Ready-to-paste responsive FAQ section |
| \`searchora-data.json\` | Cleaned Searchora source data — keep for future updates |
| \`report.html\` | Human-readable summary of this pack |

## Updating later

Keep \`searchora-data.json\`. To regenerate the pack after changes, run the
Searchora GEO Pack Generator again with the updated audit file.
`;
}
