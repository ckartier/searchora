/**
 * URL Utilities — normalization, deduplication, filtering
 */

/**
 * Normalize a URL: remove fragments, trailing slashes, sort query params
 */
export function normalizeUrl(rawUrl, baseUrl) {
    try {
        const url = new URL(rawUrl, baseUrl);

        // Remove fragment
        url.hash = '';

        // Sort search params for consistent dedup
        url.searchParams.sort();

        // Remove trailing slash from pathname (except root)
        if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
            url.pathname = url.pathname.slice(0, -1);
        }

        // Force lowercase host
        url.hostname = url.hostname.toLowerCase();

        return url.toString();
    } catch {
        return null;
    }
}

/**
 * Check if a URL belongs to the same domain
 */
export function isSameDomain(url, baseDomain) {
    try {
        const parsed = new URL(url);
        const base = new URL(baseDomain);
        // Match domain and subdomains
        return (
            parsed.hostname === base.hostname ||
            parsed.hostname.endsWith('.' + base.hostname)
        );
    } catch {
        return false;
    }
}

/**
 * Filter out URLs that should not be crawled
 */
const SKIP_EXTENSIONS = new Set([
    '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
    '.mp4', '.mp3', '.avi', '.mov', '.wmv', '.flv',
    '.css', '.js', '.json', '.xml', '.rss', '.atom',
    '.zip', '.tar', '.gz', '.rar', '.7z',
    '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
]);

const SKIP_PATTERNS = [
    /\/wp-admin\//i,
    /\/wp-includes\//i,
    /\/wp-content\/uploads\//i,
    /\/wp-json\//i,
    /\/admin\//i,
    /\/login/i,
    /\/signin/i,
    /\/signup/i,
    /\/register/i,
    /\/cart/i,
    /\/checkout/i,
    /\/account/i,
    /\/my-account/i,
    /\/password/i,
    /\/feed\/?$/i,
    /\/sitemap/i,
    /\?replytocom=/i,
    /\?add-to-cart=/i,
    /\/tag\//i,
    /\/author\//i,
    /\/page\/\d+/i,
    /\/attachment\//i,
    /#respond$/i,
    /mailto:/i,
    /tel:/i,
    /javascript:/i,
    /data:/i,
];

export function shouldCrawlUrl(url) {
    try {
        const parsed = new URL(url);
        const pathname = parsed.pathname.toLowerCase();

        // Skip non-http protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) return false;

        // Skip asset extensions
        const ext = pathname.substring(pathname.lastIndexOf('.'));
        if (SKIP_EXTENSIONS.has(ext)) return false;

        // Skip known irrelevant patterns
        for (const pattern of SKIP_PATTERNS) {
            if (pattern.test(url)) return false;
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Determine crawl depth of a URL relative to the base
 */
export function getUrlDepth(url, baseUrl) {
    try {
        const parsed = new URL(url);
        const base = new URL(baseUrl);
        const basePath = base.pathname.replace(/\/$/, '');
        const urlPath = parsed.pathname.replace(/\/$/, '');

        if (urlPath === basePath || urlPath === '') return 0;

        const segments = urlPath.split('/').filter(Boolean);
        return segments.length;
    } catch {
        return 999;
    }
}

/**
 * Deduplicate a list of URLs after normalization
 */
export function deduplicateUrls(urls, baseUrl) {
    const seen = new Set();
    const results = [];

    for (const url of urls) {
        const normalized = normalizeUrl(url, baseUrl);
        if (normalized && !seen.has(normalized)) {
            seen.add(normalized);
            results.push(normalized);
        }
    }

    return results;
}

/**
 * Extract the root domain from a URL
 */
export function getRootDomain(url) {
    try {
        return new URL(url).origin;
    } catch {
        return null;
    }
}
