// Generates searchora-faq.html — a self-contained, responsive FAQ block
// (plain HTML + CSS, native <details>, no JavaScript) ready to paste into any page.

import { escapeHtml } from './html-utils.js';

export function generateFaqHtml(audit) {
    if (!audit.faq.length) {
        return `<!-- Searchora GEO Pack: no FAQ entries in the audit file. -->\n`;
    }

    const items = audit.faq
        .map(
            (item) => `    <details class="searchora-faq__item">
      <summary class="searchora-faq__question">${escapeHtml(item.question)}</summary>
      <div class="searchora-faq__answer">
        <p>${escapeHtml(item.answer).replace(/\n/g, '</p>\n        <p>')}</p>
      </div>
    </details>`
        )
        .join('\n');

    return `<!-- ============================================================
  Searchora GEO Pack — FAQ section for ${escapeHtml(audit.company.name)}
  Paste this block into your FAQ page (works on any site).
  No JavaScript required. Generated: ${audit.generatedAt}
============================================================= -->
<section class="searchora-faq" aria-label="Frequently asked questions">
  <style>
    .searchora-faq { max-width: 760px; margin: 0 auto; padding: 2rem 1rem; font-family: system-ui, -apple-system, sans-serif; }
    .searchora-faq__title { font-size: 1.75rem; font-weight: 700; margin: 0 0 1.25rem; }
    .searchora-faq__item { border: 1px solid #e2e2e2; border-radius: 12px; margin-bottom: 0.75rem; background: #fff; overflow: hidden; }
    .searchora-faq__question { padding: 1rem 1.25rem; font-weight: 600; cursor: pointer; list-style: none; position: relative; }
    .searchora-faq__question::-webkit-details-marker { display: none; }
    .searchora-faq__question::after { content: "+"; position: absolute; right: 1.25rem; top: 50%; transform: translateY(-50%); font-size: 1.25rem; color: #888; }
    .searchora-faq__item[open] .searchora-faq__question::after { content: "\\2212"; }
    .searchora-faq__answer { padding: 0 1.25rem 1.1rem; color: #444; line-height: 1.6; }
    .searchora-faq__answer p { margin: 0 0 0.6rem; }
    @media (max-width: 480px) { .searchora-faq { padding: 1.25rem 0.75rem; } }
  </style>
  <h2 class="searchora-faq__title">Frequently asked questions</h2>
${items}
</section>
<!-- ============================ end Searchora GEO Pack ===== -->
`;
}
