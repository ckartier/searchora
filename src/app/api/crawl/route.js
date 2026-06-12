import { requireAuth } from '@/lib/server/verifyAuth.js';
import { NextResponse } from 'next/server';
import { startCrawl, buildAuditInput } from '@/lib/crawler/index.js';
import { assertSafePublicUrl } from '@/lib/security/urlSafety.js';

/**
 * POST /api/crawl
 *
 * Start a website crawl and return structured results.
 * This is the entry point for the crawler engine.
 */
export async function POST(request) {
    const auth = await requireAuth(request, { maxRequests: 10, windowMs: 60 * 60 * 1000 });
    if (auth.response) return auth.response;
    try {
        const body = await request.json();
        const {
            websiteUrl,
            companyName = '',
            industry = '',
            competitors = [],
            country = '',
            maxPages = 30,
            maxDepth = 2,
        } = body;

        if (!websiteUrl) {
            return NextResponse.json(
                { error: 'Website URL is required' },
                { status: 400 }
            );
        }

        // Validate URL
        let validUrl;
        try {
            validUrl = new URL(
                websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`
            );
            await assertSafePublicUrl(validUrl.toString());
        } catch {
            return NextResponse.json(
                { error: 'Invalid or restricted URL' },
                { status: 400 }
            );
        }

        // Run the crawl
        const crawlResult = await startCrawl(validUrl.toString(), {
            maxPages: Math.min(maxPages, 50), // Cap at 50
            maxDepth: Math.min(maxDepth, 3),  // Cap at 3
            concurrency: 3,
            delay: 300,
        });

        // Build audit-ready input
        const auditInput = buildAuditInput(crawlResult, {
            companyName,
            industry,
            competitors: competitors.filter(Boolean),
        });

        // Return crawl summary (without full text content to reduce payload)
        return NextResponse.json({
            success: true,
            crawl: {
                website: crawlResult.website,
                crawledAt: crawlResult.crawledAt,
                duration: crawlResult.duration,
                status: crawlResult.status,
                pagesCrawled: crawlResult.pagesCrawled,
                pagesErrored: crawlResult.pagesErrored,
                pageTypes: crawlResult.pageTypes,
                siteScore: crawlResult.siteScore,
                siteSignals: crawlResult.siteSignals,
                contentGaps: crawlResult.contentGaps,
                pages: crawlResult.pages,
                internalLinks: crawlResult.internalLinks?.slice(0, 100),
                errors: crawlResult.errors,
            },
            auditInput,
        });
    } catch (error) {
        console.error('Crawl API error:', error);
        return NextResponse.json(
            { error: 'Crawl failed: ' + (error.message || 'Unknown error') },
            { status: 500 }
        );
    }
}
