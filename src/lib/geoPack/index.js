/**
 * GEO Pack builder for the web app.
 *
 * Reuses the pure generator modules (copied under ./generator, kept byte-identical
 * to searchora-geo-pack-generator/src) but orchestrates them without the filesystem,
 * so an API route can return the pack in-memory.
 */

import { validateAudit } from './generator/validate.js';
import { sanitizeAudit } from './generator/sanitize.js';
import { generateLlms } from './generator/generate-llms.js';
import { generateSchema } from './generator/generate-schema.js';
import { generateHeadHtml } from './generator/generate-head-html.js';
import { generateFaqHtml } from './generator/generate-faq-html.js';
import { generateReport } from './generator/generate-report.js';
import { generateInstallMd } from './generator/generate-install-md.js';

/** Ensure a value is an http(s) URL string, prefixing https:// when missing. */
function normalizeUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    const trimmed = value.trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed.replace(/^\/+/, '')}`;
}

/**
 * Map a Searchora audit (live result or Firestore doc) onto the generator's
 * input schema. `faq` is supplied separately because the audit only stores FAQ
 * questions — answers are enriched (optionally) before calling this.
 *
 * @param {object} audit
 * @param {Array<{question:string, answer:string}>} [faqPairs]
 */
export function auditToSource(audit = {}, faqPairs = []) {
    const pages = (audit.crawl?.pages || audit.pages || [])
        .map((p) => ({
            url: normalizeUrl(p?.url),
            title: p?.title || '',
            description: p?.metaDescription || p?.description || '',
        }))
        .filter((p) => p.url)
        .slice(0, 100);

    return {
        company: {
            name: audit.companyName || audit.company?.name || 'Your brand',
            url: normalizeUrl(audit.website || audit.company?.url || ''),
            description: audit.summary || audit.executiveReport || '',
            industry: audit.industry || '',
        },
        geoScore: typeof audit.visibilityScore === 'number' ? audit.visibilityScore : undefined,
        faq: Array.isArray(faqPairs) ? faqPairs : [],
        pages,
        keywords: [],
    };
}

/**
 * Build the full GEO pack from a generator-shaped source object.
 * @returns {{ audit: object, files: Array<{name:string, description:string, content:string}> }}
 */
export function buildGeoPack(source) {
    const audit = sanitizeAudit(validateAudit(source));
    const schema = generateSchema(audit);

    const files = [
        { name: 'llms.txt', description: 'Brand summary for AI crawlers (site root)', content: generateLlms(audit) },
        { name: 'searchora-schema.json', description: 'Schema.org JSON-LD graph', content: JSON.stringify(schema, null, 2) + '\n' },
        { name: 'searchora-head.html', description: 'JSON-LD block to paste before </head>', content: generateHeadHtml(schema, audit) },
        { name: 'searchora-faq.html', description: 'Responsive FAQ section (HTML/CSS)', content: generateFaqHtml(audit) },
        { name: 'searchora-data.json', description: 'Cleaned Searchora source data', content: JSON.stringify(audit, null, 2) + '\n' },
        { name: 'install.md', description: 'Installation instructions', content: generateInstallMd(audit) },
    ];
    files.push({
        name: 'report.html',
        description: 'Pack summary report',
        content: generateReport(audit, files.concat({ name: 'report.html', description: 'Pack summary report' })),
    });

    return { audit, files };
}
