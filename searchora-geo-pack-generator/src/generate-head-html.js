// Generates searchora-head.html — a ready-to-paste block for the page <head>.

import { schemaToScriptJson } from './generate-schema.js';

export function generateHeadHtml(schema, audit) {
    return `<!-- ============================================================
  Searchora GEO Pack — structured data for ${audit.company.name}
  Paste this whole block just before </head> on every page
  (or at least on the homepage).
  Generated: ${audit.generatedAt}
============================================================= -->
<script type="application/ld+json">
${schemaToScriptJson(schema)}
</script>
<!-- ============================ end Searchora GEO Pack ===== -->
`;
}
