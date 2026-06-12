/**
 * Page Fetcher — fetches HTML with timeout, redirect handling, status codes
 */

import { safeFetch } from '../security/urlSafety.js';

const DEFAULT_TIMEOUT = 15000; // 15s
const USER_AGENT =
    'SearchoraBot/1.0 (+https://searchora.com/bot; AI Visibility Audit)';

/**
 * Fetch a single page and return raw HTML + metadata
 */
export async function fetchPage(url, options = {}) {
    const {
        timeout = DEFAULT_TIMEOUT,
        followRedirects = true,
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await safeFetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': USER_AGENT,
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate',
            },
            redirect: followRedirects ? 'follow' : 'manual',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Check content type — only process HTML
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
            return {
                url,
                finalUrl: response.url,
                statusCode: response.status,
                redirected: response.redirected,
                contentType,
                html: null,
                error: 'Not HTML content',
                success: false,
            };
        }

        const html = await response.text();

        return {
            url,
            finalUrl: response.url,
            statusCode: response.status,
            redirected: response.redirected,
            contentType,
            html,
            error: null,
            success: response.ok,
        };
    } catch (error) {
        clearTimeout(timeoutId);

        const isTimeout = error.name === 'AbortError';
        return {
            url,
            finalUrl: url,
            statusCode: 0,
            redirected: false,
            contentType: null,
            html: null,
            error: isTimeout ? 'Request timeout' : error.message,
            success: false,
        };
    }
}

/**
 * Fetch robots.txt for a domain
 */
export async function fetchRobotsTxt(baseUrl) {
    try {
        const robotsUrl = new URL('/robots.txt', baseUrl).toString();
        const response = await safeFetch(robotsUrl, {
            headers: { 'User-Agent': USER_AGENT },
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) return null;
        return await response.text();
    } catch {
        return null;
    }
}

/**
 * Basic robots.txt parser — check if a path is disallowed
 */
export function isDisallowedByRobots(robotsTxt, path) {
    if (!robotsTxt) return false;

    const lines = robotsTxt.split('\n');
    let inRelevantBlock = false;
    const disallowed = [];

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (line.toLowerCase().startsWith('user-agent:')) {
            const agent = line.split(':')[1]?.trim().toLowerCase();
            inRelevantBlock = agent === '*' || agent === 'searchorabot';
        }

        if (inRelevantBlock && line.toLowerCase().startsWith('disallow:')) {
            const disallowPath = line.split(':').slice(1).join(':').trim();
            if (disallowPath) {
                disallowed.push(disallowPath);
            }
        }
    }

    return disallowed.some((d) => {
        if (d.endsWith('*')) {
            return path.startsWith(d.slice(0, -1));
        }
        return path === d || path.startsWith(d);
    });
}
