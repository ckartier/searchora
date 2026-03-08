/**
 * Searchora Crawler — main orchestrator
 *
 * Coordinates page fetching, content extraction, classification, and scoring
 * into a structured crawl result ready for the AI audit engine.
 */

import { fetchPage, fetchRobotsTxt, isDisallowedByRobots } from './fetcher.js';
import {
    normalizeUrl,
    isSameDomain,
    shouldCrawlUrl,
    getUrlDepth,
    deduplicateUrls,
    getRootDomain,
} from './urlUtils.js';
import { extractPageData } from '../extractor/index.js';
import { extractNavigationLinks } from '../extractor/linkExtractor.js';
import { classifyPageType, buildPageTypeBreakdown } from '../classifier/index.js';
import {
    computePageSignals,
    computePageScore,
    computeSiteSignals,
    computeSiteScore,
    generateContentGaps,
} from '../scoring/index.js';
import * as cheerio from 'cheerio';

/**
 * Default crawl configuration
 */
const DEFAULT_CONFIG = {
    maxPages: 50,
    maxDepth: 3,
    concurrency: 3,
    timeout: 15000,
    delay: 500,        // Polite delay between requests (ms)
    respectRobots: true,
};

/**
 * Start a full website crawl
 *
 * @param {string} websiteUrl - The website to crawl
 * @param {object} options - Crawl options
 * @returns {object} Full structured crawl result
 */
export async function startCrawl(websiteUrl, options = {}) {
    const config = { ...DEFAULT_CONFIG, ...options };
    const baseUrl = normalizeUrl(websiteUrl, websiteUrl);
    const baseDomain = getRootDomain(baseUrl);

    if (!baseUrl || !baseDomain) {
        throw new Error('Invalid website URL');
    }

    const startTime = Date.now();

    // State
    const visited = new Set();
    const queue = [baseUrl];
    const crawledPages = [];
    const allInternalLinks = [];
    const errors = [];
    let robotsTxt = null;

    // Fetch robots.txt
    if (config.respectRobots) {
        robotsTxt = await fetchRobotsTxt(baseDomain);
    }

    // Emit progress callback
    const onProgress = config.onProgress || (() => { });

    // ==================== CRAWL LOOP ====================
    while (queue.length > 0 && crawledPages.length < config.maxPages) {
        // Take next batch
        const batch = queue.splice(0, config.concurrency);

        const results = await Promise.allSettled(
            batch.map(async (url) => {
                if (visited.has(url)) return null;
                if (crawledPages.length >= config.maxPages) return null;

                // Depth check
                const depth = getUrlDepth(url, baseUrl);
                if (depth > config.maxDepth) return null;

                // Robots check
                if (robotsTxt) {
                    try {
                        const path = new URL(url).pathname;
                        if (isDisallowedByRobots(robotsTxt, path)) return null;
                    } catch { }
                }

                visited.add(url);

                // Polite delay
                if (config.delay > 0) {
                    await new Promise((r) => setTimeout(r, config.delay));
                }

                // Fetch
                const fetchResult = await fetchPage(url, { timeout: config.timeout });

                if (!fetchResult.success || !fetchResult.html) {
                    errors.push({
                        url,
                        error: fetchResult.error,
                        statusCode: fetchResult.statusCode,
                    });
                    return null;
                }

                // Extract data
                const pageData = extractPageData(fetchResult.html, url, baseDomain);

                // Classify page
                const classification = classifyPageType(pageData);

                // Compute signals and score
                const signals = computePageSignals(pageData);
                const pageScore = computePageScore(pageData, signals);

                // Collect internal links for further crawling
                const newLinks = (pageData.internalLinks || [])
                    .map((l) => l.url)
                    .filter((linkUrl) => {
                        return (
                            !visited.has(linkUrl) &&
                            isSameDomain(linkUrl, baseDomain) &&
                            shouldCrawlUrl(linkUrl) &&
                            getUrlDepth(linkUrl, baseUrl) <= config.maxDepth
                        );
                    });

                // Add internal link relationships
                for (const link of pageData.internalLinks || []) {
                    allInternalLinks.push({
                        sourceUrl: url,
                        targetUrl: link.url,
                        anchorText: link.anchor,
                        isNavigation: link.isNavigation,
                    });
                }

                // Build page result (without heavy extracted text for the crawl result summary)
                const pageResult = {
                    url,
                    finalUrl: fetchResult.finalUrl,
                    statusCode: fetchResult.statusCode,
                    redirected: fetchResult.redirected,

                    // Metadata
                    title: pageData.title,
                    metaDescription: pageData.metaDescription,
                    canonical: pageData.canonical,
                    ogTitle: pageData.ogTitle,
                    ogDescription: pageData.ogDescription,
                    language: pageData.language,
                    robots: pageData.robots,
                    schemaTypes: pageData.schemaTypes,

                    // Headings
                    h1: pageData.h1,
                    h2s: pageData.h2s,
                    h3s: pageData.h3s?.slice(0, 10),
                    totalHeadings: pageData.totalHeadings,
                    hasMultipleH1: pageData.hasMultipleH1,

                    // Content metrics
                    wordCount: pageData.wordCount,
                    contentDepth: pageData.contentDepth,
                    snippets: pageData.snippets,

                    // Classification
                    pageType: classification.pageType,
                    typeConfidence: classification.confidence,

                    // Structure detection
                    hasFAQ: pageData.hasFAQ,
                    hasTable: pageData.hasTable,
                    hasList: pageData.hasList,
                    hasComparison: pageData.hasComparison,
                    hasDefinitions: pageData.hasDefinitions,
                    hasHowTo: pageData.hasHowTo,
                    hasAnswerFirst: pageData.hasAnswerFirst,
                    hasShortAnswerNearTop: pageData.hasShortAnswerNearTop,

                    // FAQ details
                    faqQuestions: pageData.faqData?.questions || [],

                    // Signals
                    signals,
                    pageScore,

                    // Link metrics
                    linkMetrics: pageData.linkMetrics,

                    // Store extracted text separately (for AI engine)
                    extractedText: pageData.extractedText,
                };

                onProgress({
                    pagesComplete: crawledPages.length + 1,
                    maxPages: config.maxPages,
                    currentUrl: url,
                    pageScore,
                    pageType: classification.pageType,
                });

                return { pageResult, newLinks };
            })
        );

        // Process results
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                crawledPages.push(result.value.pageResult);
                // Add new URLs to queue
                const deduped = deduplicateUrls(result.value.newLinks, baseDomain);
                for (const newUrl of deduped) {
                    if (!visited.has(newUrl) && !queue.includes(newUrl)) {
                        queue.push(newUrl);
                    }
                }
            }
        }
    }

    // ==================== COMPUTE SITE-LEVEL ANALYSIS ====================
    const pageTypeBreakdown = buildPageTypeBreakdown(crawledPages);
    const siteSignals = computeSiteSignals(crawledPages);
    const siteScore = computeSiteScore(siteSignals);
    const contentGaps = generateContentGaps(siteSignals);

    const endTime = Date.now();

    // ==================== BUILD FINAL RESULT ====================
    return {
        // Crawl metadata
        website: baseUrl,
        baseDomain,
        crawledAt: new Date().toISOString(),
        duration: endTime - startTime,
        status: 'completed',

        // Crawl stats
        pagesCrawled: crawledPages.length,
        pagesErrored: errors.length,
        totalLinksFound: allInternalLinks.length,

        // Configuration used
        config: {
            maxPages: config.maxPages,
            maxDepth: config.maxDepth,
        },

        // Page type breakdown
        pageTypes: pageTypeBreakdown,

        // All pages
        pages: crawledPages.map((p) => ({
            ...p,
            // Don't include full extracted text in the summary
            extractedText: undefined,
        })),

        // Full page data (for AI engine, stored separately)
        pagesWithContent: crawledPages,

        // Internal links
        internalLinks: allInternalLinks.slice(0, 500), // Cap for storage

        // Site-level analysis
        siteSignals,
        siteScore,
        contentGaps,

        // Errors
        errors,
    };
}

/**
 * Build the structured input for the AI audit engine
 * This packages the crawl result into a format optimal for LLM analysis
 */
export function buildAuditInput(crawlResult, options = {}) {
    const { companyName = '', industry = '', competitors = [] } = options;

    // Build a concise summary for the AI
    const topPages = crawlResult.pagesWithContent
        ?.sort((a, b) => (b.pageScore || 0) - (a.pageScore || 0))
        .slice(0, 15) || [];

    const weakPages = crawlResult.pagesWithContent
        ?.sort((a, b) => (a.pageScore || 0) - (b.pageScore || 0))
        .slice(0, 10) || [];

    return {
        // Context
        website: crawlResult.website,
        companyName,
        industry,
        competitors,

        // Crawl summary
        totalPages: crawlResult.pagesCrawled,
        pageTypes: crawlResult.pageTypes,
        siteScore: crawlResult.siteScore,

        // Site-level signals
        siteSignals: crawlResult.siteSignals,
        contentGaps: crawlResult.contentGaps,

        // Top performing pages (with content for AI analysis)
        topPages: topPages.map((p) => ({
            url: p.url,
            title: p.title,
            pageType: p.pageType,
            pageScore: p.pageScore,
            wordCount: p.wordCount,
            h1: p.h1,
            h2s: p.h2s,
            hasFAQ: p.hasFAQ,
            hasSchema: p.signals?.hasSchema,
            snippets: p.snippets,
            // Include first part of text for AI analysis
            contentPreview: p.extractedText?.substring(0, 2000) || '',
        })),

        // Weakest pages
        weakPages: weakPages.map((p) => ({
            url: p.url,
            title: p.title,
            pageType: p.pageType,
            pageScore: p.pageScore,
            wordCount: p.wordCount,
            signals: p.signals,
        })),

        // Questions found on the site
        existingFAQs: topPages
            .flatMap((p) => p.faqQuestions || [])
            .slice(0, 20),
    };
}
