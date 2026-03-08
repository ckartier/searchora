/**
 * Link Extractor — internal links, anchor text, navigation structure
 */

import { normalizeUrl, isSameDomain, shouldCrawlUrl } from '../crawler/urlUtils.js';

/**
 * Extract all internal links from a page
 */
export function extractInternalLinks($, pageUrl, baseDomain) {
    const links = [];
    const seen = new Set();

    $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;

        const normalized = normalizeUrl(href, pageUrl);
        if (!normalized) return;
        if (!isSameDomain(normalized, baseDomain)) return;
        if (!shouldCrawlUrl(normalized)) return;
        if (seen.has(normalized)) return;

        seen.add(normalized);

        const anchor = $(el).text().trim().replace(/\s+/g, ' ').substring(0, 200);
        const isNav = isNavigationLink($, el);

        links.push({
            url: normalized,
            anchor: anchor || null,
            isNavigation: isNav,
            rel: $(el).attr('rel') || null,
        });
    });

    return links;
}

/**
 * Detect if a link is inside navigation elements
 */
function isNavigationLink($, el) {
    const parents = $(el).parents();
    for (let i = 0; i < parents.length; i++) {
        const parent = parents.eq(i);
        const tag = parent.prop('tagName')?.toLowerCase();
        const role = parent.attr('role');
        const cls = parent.attr('class') || '';

        if (
            tag === 'nav' ||
            tag === 'header' ||
            tag === 'footer' ||
            role === 'navigation' ||
            /\b(nav|menu|header|footer|breadcrumb)\b/i.test(cls)
        ) {
            return true;
        }
    }
    return false;
}

/**
 * Extract navigation structure (main menu links)
 */
export function extractNavigationLinks($, baseDomain) {
    const navLinks = [];
    const seen = new Set();

    // Look in <nav>, [role="navigation"], header
    const navContainers = $('nav, [role="navigation"], header nav, .main-nav, .primary-nav, #main-nav');

    navContainers.find('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;

        const normalized = normalizeUrl(href, baseDomain);
        if (!normalized) return;
        if (!isSameDomain(normalized, baseDomain)) return;
        if (seen.has(normalized)) return;

        seen.add(normalized);

        navLinks.push({
            url: normalized,
            text: $(el).text().trim().replace(/\s+/g, ' ').substring(0, 100),
        });
    });

    return navLinks;
}

/**
 * Compute basic link metrics
 */
export function computeLinkMetrics(links) {
    const navLinks = links.filter((l) => l.isNavigation);
    const contentLinks = links.filter((l) => !l.isNavigation);

    return {
        totalInternalLinks: links.length,
        navigationLinks: navLinks.length,
        contentLinks: contentLinks.length,
        uniqueTargets: new Set(links.map((l) => l.url)).size,
    };
}
