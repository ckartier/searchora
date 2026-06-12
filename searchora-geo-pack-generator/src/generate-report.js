// Generates report.html — a human-readable summary of the generated pack.

import { escapeHtml } from './html-utils.js';

function scoreColor(score) {
    if (score === null) return '#999';
    if (score >= 70) return '#16a34a';
    if (score >= 40) return '#f59e0b';
    return '#dc2626';
}

export function generateReport(audit, files) {
    const { company } = audit;
    const score = audit.geoScore;

    const fileRows = files
        .map(
            (f) => `        <tr>
          <td><code>${escapeHtml(f.name)}</code></td>
          <td>${escapeHtml(f.description)}</td>
          <td class="status-ok">✔ generated</td>
        </tr>`
        )
        .join('\n');

    const serviceItems = audit.services
        .map((s) => `        <li><strong>${escapeHtml(s.name)}</strong>${s.description ? ` — ${escapeHtml(s.description)}` : ''}</li>`)
        .join('\n');

    const faqItems = audit.faq
        .map((f) => `        <li><strong>${escapeHtml(f.question)}</strong><br>${escapeHtml(f.answer)}</li>`)
        .join('\n');

    const pageItems = audit.pages
        .map((p) => `        <li><a href="${escapeHtml(p.url)}" rel="noopener">${escapeHtml(p.title || p.url)}</a></li>`)
        .join('\n');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Searchora GEO Pack — ${escapeHtml(company.name)}</title>
<style>
  :root { color-scheme: light; }
  body { font-family: system-ui, -apple-system, sans-serif; margin: 0; background: #f6f7f9; color: #1a1a1a; line-height: 1.6; }
  .wrap { max-width: 860px; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
  h1 { font-size: 1.6rem; margin: 0; }
  h2 { font-size: 1.15rem; margin: 2rem 0 0.75rem; }
  .meta { color: #666; font-size: 0.9rem; }
  .score { width: 84px; height: 84px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; color: #fff; background: ${scoreColor(score)}; flex-shrink: 0; }
  .card { background: #fff; border: 1px solid #e5e5e5; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
  th, td { text-align: left; padding: 0.55rem 0.6rem; border-bottom: 1px solid #eee; vertical-align: top; }
  th { color: #666; font-weight: 600; }
  code { background: #f1f1f1; padding: 0.1rem 0.35rem; border-radius: 5px; font-size: 0.85em; }
  .status-ok { color: #16a34a; font-weight: 600; white-space: nowrap; }
  ul { margin: 0.25rem 0 0; padding-left: 1.2rem; }
  li { margin-bottom: 0.5rem; }
  a { color: #ea580c; }
  footer { margin-top: 2.5rem; color: #999; font-size: 0.85rem; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div>
      <h1>Searchora GEO Pack</h1>
      <p class="meta">
        <strong>${escapeHtml(company.name)}</strong> · <a href="${escapeHtml(company.url)}" rel="noopener">${escapeHtml(company.url)}</a><br>
        Generated ${escapeHtml(audit.generatedAt)}
      </p>
    </div>
    <div class="score" title="GEO score">${score === null ? '—' : escapeHtml(score)}</div>
  </header>

  <div class="card">
    <h2 style="margin-top:0">Generated files</h2>
    <table>
      <thead><tr><th>File</th><th>Purpose</th><th>Status</th></tr></thead>
      <tbody>
${fileRows}
      </tbody>
    </table>
  </div>

${audit.services.length ? `  <div class="card">
    <h2 style="margin-top:0">Services (${audit.services.length})</h2>
    <ul>
${serviceItems}
    </ul>
  </div>
` : ''}${audit.faq.length ? `  <div class="card">
    <h2 style="margin-top:0">FAQ (${audit.faq.length})</h2>
    <ul>
${faqItems}
    </ul>
  </div>
` : ''}${audit.pages.length ? `  <div class="card">
    <h2 style="margin-top:0">Key pages (${audit.pages.length})</h2>
    <ul>
${pageItems}
    </ul>
  </div>
` : ''}
  <footer>Searchora GEO Pack Generator · install instructions in <code>install.md</code></footer>
</div>
</body>
</html>
`;
}
