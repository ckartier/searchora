import { NextResponse } from 'next/server';
import { runFullAudit, buildFirestoreAudit, buildFirestoreSubDocs } from '@/lib/audit/index.js';

/**
 * POST /api/audit
 *
 * Runs the full Searchora audit pipeline:
 * 1. Crawl website
 * 2. Extract & classify content
 * 3. Score AI-readiness
 * 4. Generate AI analysis
 * 5. Return structured results
 *
 * Supports real crawling + AI (OpenAI), with demo fallback.
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            websiteUrl,
            companyName,
            industry,
            country,
            competitors = [],
            keywords = [],
            maxPages = 30,
            maxDepth = 2,
            userId = null,
            projectId = null,
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
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        // Run the full audit pipeline
        const auditResult = await runFullAudit({
            websiteUrl: validUrl.toString(),
            companyName: companyName || '',
            industry: industry || '',
            country: country || '',
            competitors: competitors.filter(Boolean),
            keywords,
            maxPages: Math.min(maxPages, 50),
            maxDepth: Math.min(maxDepth, 3),
            userId,
            projectId,
        });

        // Build Firestore-ready documents
        const firestoreAudit = buildFirestoreAudit(auditResult);
        const firestoreSubDocs = buildFirestoreSubDocs(auditResult);

        // Return everything the dashboard needs
        return NextResponse.json({
            success: true,
            audit: {
                // Metadata
                auditId: auditResult.auditId,
                companyName: auditResult.companyName,
                website: auditResult.website,
                industry: auditResult.industry,
                country: auditResult.country,
                createdAt: auditResult.createdAt,
                duration: auditResult.duration,
                provider: auditResult.provider,

                // Scores
                visibilityScore: auditResult.visibilityScore,
                subScores: auditResult.subScores,
                scoreExplanation: auditResult.scoreExplanation,

                // AI Analysis
                summary: auditResult.summary,
                executiveReport: auditResult.executiveReport,
                strengths: auditResult.strengths,
                weaknesses: auditResult.weaknesses,
                opportunities: auditResult.opportunities,
                recommendations: auditResult.recommendations,
                suggestedPages: auditResult.suggestedPages,
                faqSuggestions: auditResult.faqSuggestions,
                competitorAnalysis: auditResult.competitorAnalysis,
                priorityActions: auditResult.priorityActions,

                // Executive report
                report: auditResult.report,

                // Crawl data
                crawl: auditResult.crawl,

                // Internal links
                internalLinks: auditResult.internalLinks?.slice(0, 100),
            },

            // Firestore-ready data (for client-side save if needed)
            firestore: {
                audit: firestoreAudit,
                subDocs: firestoreSubDocs,
            },
        });
    } catch (error) {
        console.error('Audit API error:', error);
        return NextResponse.json(
            { error: 'Audit failed: ' + (error.message || 'Unknown error') },
            { status: 500 }
        );
    }
}
