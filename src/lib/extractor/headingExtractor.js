/**
 * Heading Extractor — H1, H2, H3 extraction with hierarchy
 */

/**
 * Extract all headings from the page
 */
export function extractHeadings($) {
    const h1 = [];
    const h2 = [];
    const h3 = [];

    $('h1').each((_, el) => {
        const text = $(el).text().trim().replace(/\s+/g, ' ');
        if (text && text.length > 0 && text.length < 500) {
            h1.push(text);
        }
    });

    $('h2').each((_, el) => {
        const text = $(el).text().trim().replace(/\s+/g, ' ');
        if (text && text.length > 0 && text.length < 500) {
            h2.push(text);
        }
    });

    $('h3').each((_, el) => {
        const text = $(el).text().trim().replace(/\s+/g, ' ');
        if (text && text.length > 0 && text.length < 500) {
            h3.push(text);
        }
    });

    return {
        h1: h1.length > 0 ? h1[0] : null, // Primary H1
        h1All: h1,
        h2s: h2.slice(0, 30), // Cap at 30
        h3s: h3.slice(0, 50), // Cap at 50
        totalHeadings: h1.length + h2.length + h3.length,
        hasMultipleH1: h1.length > 1,
        headingHierarchy: buildHierarchy($),
    };
}

/**
 * Build a structured heading hierarchy
 */
function buildHierarchy($) {
    const hierarchy = [];
    const headings = $('h1, h2, h3').toArray();

    for (const el of headings.slice(0, 50)) {
        const tag = el.tagName?.toLowerCase() || el.name?.toLowerCase();
        const text = $(el).text().trim().replace(/\s+/g, ' ');
        if (text && text.length > 0) {
            hierarchy.push({
                level: parseInt(tag?.replace('h', '') || '0'),
                text: text.substring(0, 200),
            });
        }
    }

    return hierarchy;
}
