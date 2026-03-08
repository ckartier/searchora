/**
 * Text Extractor — clean, readable text extraction from HTML
 * Removes nav, footer, sidebar, script, style, cookie banners, etc.
 */

/**
 * Elements to remove before text extraction
 */
const REMOVE_SELECTORS = [
    'script',
    'style',
    'noscript',
    'iframe',
    'svg',
    'nav',
    'header',
    'footer',
    '[role="navigation"]',
    '[role="banner"]',
    '[role="contentinfo"]',
    '.cookie-banner',
    '.cookie-consent',
    '.cookie-notice',
    '#cookie-banner',
    '#cookie-consent',
    '#cookie-notice',
    '.gdpr',
    '#gdpr',
    '.newsletter-popup',
    '.modal',
    '.popup',
    '.sidebar',
    '#sidebar',
    'aside',
    '.breadcrumb',
    '.breadcrumbs',
    '.social-share',
    '.social-links',
    '.share-buttons',
    '.comments',
    '#comments',
    '.related-posts',
    '.wp-block-latest-posts',
    '[aria-hidden="true"]',
    '.skip-link',
    '.screen-reader-text',
    '.sr-only',
];

/**
 * Extract clean visible text from the page body
 */
export function extractCleanText($) {
    // Clone to avoid mutating
    const $clone = $.root().clone();
    const $body = $clone.find('body');

    if ($body.length === 0) {
        return { text: '', wordCount: 0, snippets: [] };
    }

    // Remove noise elements
    for (const selector of REMOVE_SELECTORS) {
        $body.find(selector).remove();
    }

    // Get text content
    let text = $body.text();

    // Clean up whitespace
    text = text
        .replace(/[\t\r]/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .replace(/ {2,}/g, ' ')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join('\n');

    // Remove very short lines that are likely UI elements
    const lines = text.split('\n').filter((line) => {
        // Keep lines with at least a few words or that look like content
        const words = line.split(/\s+/).length;
        return words >= 3 || line.length > 30;
    });

    const cleanText = lines.join('\n');
    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

    // Extract key content snippets (first meaningful paragraphs)
    const snippets = extractSnippets($body);

    return {
        text: cleanText.substring(0, 30000), // Cap at 30k chars
        wordCount,
        snippets,
    };
}

/**
 * Extract the first meaningful content snippets
 */
function extractSnippets($body) {
    const snippets = [];
    const paragraphs = $body.find('p, [class*="description"], [class*="summary"], [class*="intro"]');

    paragraphs.each((_, el) => {
        if (snippets.length >= 5) return false; // Stop after 5

        const text = paragraphs.eq(paragraphs.index(el)).text().trim().replace(/\s+/g, ' ');
        if (text.length >= 40 && text.length <= 1000) {
            snippets.push(text);
        }
    });

    return snippets;
}

/**
 * Detect if the first content block is answer-first (summary/answer at top)
 */
export function detectAnswerFirst($) {
    // Look for the first <p> after the H1
    const h1 = $('h1').first();
    if (h1.length === 0) return false;

    // Get the first <p> that follows
    let nextEl = h1.next();
    let attempts = 0;

    while (nextEl.length && attempts < 5) {
        if (nextEl.is('p')) {
            const text = nextEl.text().trim();
            // If the first paragraph after H1 is substantial, it's answer-first
            return text.split(/\s+/).length >= 15;
        }
        nextEl = nextEl.next();
        attempts++;
    }

    return false;
}

/**
 * Estimate content depth — thin, moderate, substantial, comprehensive
 */
export function estimateContentDepth(wordCount) {
    if (wordCount < 100) return 'empty';
    if (wordCount < 300) return 'thin';
    if (wordCount < 800) return 'moderate';
    if (wordCount < 2000) return 'substantial';
    return 'comprehensive';
}
