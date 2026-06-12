#!/usr/bin/env node
// Searchora GEO Pack Generator — entry point.
// Usage: npm run build -- ./examples/searchora-audit.example.geo

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { parseAuditFile, validateAudit } from './validate.js';
import { sanitizeAudit } from './sanitize.js';
import { generateLlms } from './generate-llms.js';
import { generateSchema } from './generate-schema.js';
import { generateHeadHtml } from './generate-head-html.js';
import { generateFaqHtml } from './generate-faq-html.js';
import { generateReport } from './generate-report.js';
import { generateInstallMd } from './generate-install-md.js';

const OUTPUT_DIR = path.resolve(process.cwd(), 'dist/searchora-geo-pack');

async function main() {
    const inputArg = process.argv[2];
    if (!inputArg) {
        console.error('Usage: npm run build -- <searchora-audit.geo|.json>');
        process.exit(1);
    }

    const inputPath = path.resolve(process.cwd(), inputArg);
    if (!/\.(geo|json)$/i.test(inputPath)) {
        console.error('Input file must have a .geo or .json extension.');
        process.exit(1);
    }

    let raw;
    try {
        raw = await readFile(inputPath, 'utf8');
    } catch (err) {
        console.error(`Cannot read input file: ${err.message}`);
        process.exit(1);
    }

    let audit;
    try {
        audit = sanitizeAudit(validateAudit(parseAuditFile(raw)));
    } catch (err) {
        console.error(`Invalid audit file: ${err.message}`);
        process.exit(1);
    }

    const schema = generateSchema(audit);

    const files = [
        { name: 'llms.txt', description: 'Brand summary for AI crawlers (site root)', content: generateLlms(audit) },
        { name: 'searchora-schema.json', description: 'Schema.org JSON-LD graph', content: JSON.stringify(schema, null, 2) + '\n' },
        { name: 'searchora-head.html', description: 'JSON-LD block to paste before </head>', content: generateHeadHtml(schema, audit) },
        { name: 'searchora-faq.html', description: 'Responsive FAQ section (HTML/CSS)', content: generateFaqHtml(audit) },
        { name: 'searchora-data.json', description: 'Cleaned Searchora source data', content: JSON.stringify(audit, null, 2) + '\n' },
        { name: 'install.md', description: 'Installation instructions', content: generateInstallMd(audit) },
    ];
    files.push({ name: 'report.html', description: 'Pack summary report', content: generateReport(audit, files.concat({ name: 'report.html', description: 'Pack summary report' })) });

    await mkdir(OUTPUT_DIR, { recursive: true });
    for (const file of files) {
        await writeFile(path.join(OUTPUT_DIR, file.name), file.content, 'utf8');
    }

    console.log(`Searchora GEO Pack generated for ${audit.company.name}`);
    console.log(`Output: ${OUTPUT_DIR}`);
    for (const file of files) console.log(`  - ${file.name}`);
}

main();
