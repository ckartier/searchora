import { NextResponse } from 'next/server';
import { startCrawl } from '@/lib/crawler/index.js';
import { assertSafePublicUrl } from '@/lib/security/urlSafety.js';

const DEMO_COOKIE = 'searchora_demo_test_used';

export async function POST(request) {
    if (request.cookies.get(DEMO_COOKIE)?.value === '1') {
        return NextResponse.json(
            { error: 'This browser has already used its free live test.' },
            { status: 429 }
        );
    }

    try {
        const { websiteUrl } = await request.json();
        if (!websiteUrl || typeof websiteUrl !== 'string') {
            return NextResponse.json({ error: 'Website URL is required.' }, { status: 400 });
        }

        const normalizedUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
        const validUrl = await assertSafePublicUrl(normalizedUrl);
        const crawl = await startCrawl(validUrl.toString(), {
            maxPages: 3,
            maxDepth: 1,
            concurrency: 2,
            delay: 200,
            timeout: 10000,
        });

        const response = NextResponse.json({
            success: true,
            result: {
                website: crawl.website,
                score: crawl.siteScore,
                pagesCrawled: crawl.pagesCrawled,
                pagesErrored: crawl.pagesErrored,
                duration: crawl.duration,
                signals: crawl.siteSignals,
                gaps: crawl.contentGaps?.slice(0, 3) || [],
                pages: crawl.pages?.slice(0, 3).map((page) => ({
                    url: page.url,
                    title: page.title,
                    pageScore: page.pageScore,
                    wordCount: page.wordCount,
                })) || [],
            },
        });

        response.cookies.set(DEMO_COOKIE, '1', {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 365,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });
        return response;
    } catch (error) {
        const message = error.message === 'Local network URLs are not allowed'
            ? 'Local or restricted URLs cannot be tested.'
            : 'We could not analyze this website. Check the URL and try again.';
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
