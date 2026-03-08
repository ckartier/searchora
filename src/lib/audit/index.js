/**
 * Audit Orchestrator — coordinates the full audit pipeline
 *
 * Flow: Input → Crawl → Extract → Score → AI Analysis → Firebase Storage
 */

import { startCrawl, buildAuditInput } from '../crawler/index.js';
import {
    generateAudit,
    generateFaqSuggestions,
    generateSuggestedPages,
    generateCompetitorAnalysis,
    generateExecutiveReport,
} from '../ai/index.js';

/**
 * Run a complete audit pipeline
 *
 * @param {object} params - Audit parameters
 * @param {function} onProgress - Progress callback
 * @returns {object} Complete audit result
 */
export async function runFullAudit(params, onProgress = () => { }) {
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
    } = params;

    const startTime = Date.now();
    const auditId = generateId();

    try {
        // ==================== PHASE 1: CRAWL ====================
        onProgress({ phase: 'crawl', status: 'starting', message: 'Starting website crawl...' });

        const crawlResult = await startCrawl(websiteUrl, {
            maxPages: Math.min(maxPages, 50),
            maxDepth: Math.min(maxDepth, 3),
            concurrency: 3,
            delay: 300,
            onProgress: (p) => {
                onProgress({
                    phase: 'crawl',
                    status: 'progress',
                    message: `Crawled ${p.pagesComplete}/${p.maxPages}: ${p.currentUrl}`,
                    data: p,
                });
            },
        });

        onProgress({
            phase: 'crawl',
            status: 'complete',
            message: `Crawl complete — ${crawlResult.pagesCrawled} pages discovered`,
        });

        // ==================== PHASE 2: BUILD AUDIT INPUT ====================
        onProgress({ phase: 'analysis', status: 'starting', message: 'Preparing analysis data...' });

        const auditInput = buildAuditInput(crawlResult, {
            companyName,
            industry,
            competitors: competitors.filter(Boolean),
            country,
        });

        // ==================== PHASE 3: AI ANALYSIS ====================
        onProgress({ phase: 'ai', status: 'starting', message: 'Running AI analysis...' });

        const aiResult = await generateAudit(auditInput);

        onProgress({
            phase: 'ai',
            status: 'progress',
            message: 'Generating FAQ suggestions...',
        });

        // Generate additional modules in parallel
        const [faqResult, competitorResult] = await Promise.all([
            generateFaqSuggestions(
                companyName,
                industry,
                websiteUrl,
                auditInput.existingFAQs
            ),
            competitors.filter(Boolean).length > 0
                ? generateCompetitorAnalysis(companyName, websiteUrl, competitors.filter(Boolean), industry)
                : Promise.resolve({ competitors: [] }),
        ]);

        // Merge FAQ and competitor data if AI didn't already provide them
        if (faqResult.questions.length > 0 && aiResult.faqSuggestions.length === 0) {
            aiResult.faqSuggestions = faqResult.questions;
        }
        if (competitorResult.competitors.length > 0 && aiResult.competitorAnalysis.length === 0) {
            aiResult.competitorAnalysis = competitorResult.competitors;
        }

        onProgress({
            phase: 'ai',
            status: 'progress',
            message: 'Generating executive report...',
        });

        // Generate executive report
        const reportResult = await generateExecutiveReport({
            companyName,
            visibilityScore: crawlResult.siteScore,
            strengths: aiResult.strengths,
            weaknesses: aiResult.weaknesses,
            opportunities: aiResult.opportunities,
            contentGaps: crawlResult.contentGaps,
            priorityActions: aiResult.priorityActions,
        });

        onProgress({ phase: 'ai', status: 'complete', message: 'AI analysis complete' });

        // ==================== PHASE 4: BUILD FINAL RESULT ====================
        const endTime = Date.now();

        const fullResult = {
            // Audit metadata
            auditId,
            projectId,
            userId,
            companyName,
            website: websiteUrl,
            industry,
            country,
            createdAt: new Date().toISOString(),
            duration: endTime - startTime,
            status: 'completed',
            provider: aiResult.provider || 'demo',

            // Scores
            visibilityScore: crawlResult.siteScore,
            subScores: aiResult.subScores,
            scoreExplanation: aiResult.scoreExplanation,

            // AI analysis
            summary: aiResult.summary,
            strengths: aiResult.strengths,
            weaknesses: aiResult.weaknesses,
            opportunities: aiResult.opportunities,
            recommendations: aiResult.recommendations,
            suggestedPages: aiResult.suggestedPages,
            faqSuggestions: aiResult.faqSuggestions,
            competitorAnalysis: aiResult.competitorAnalysis,
            priorityActions: aiResult.priorityActions,
            executiveReport: aiResult.executiveReport,

            // Executive report
            report: reportResult,

            // Crawl data
            crawl: {
                pagesCrawled: crawlResult.pagesCrawled,
                pagesErrored: crawlResult.pagesErrored,
                pageTypes: crawlResult.pageTypes,
                siteSignals: crawlResult.siteSignals,
                contentGaps: crawlResult.contentGaps,
                duration: crawlResult.duration,
                pages: crawlResult.pages, // without full text
            },

            // Internal links (for relationship analysis)
            internalLinks: crawlResult.internalLinks?.slice(0, 200),
        };

        onProgress({ phase: 'complete', status: 'complete', message: 'Audit complete', data: fullResult });

        return fullResult;
    } catch (error) {
        onProgress({ phase: 'error', status: 'error', message: error.message });
        throw error;
    }
}

/**
 * Build a Firestore-ready audit document
 */
export function buildFirestoreAudit(auditResult) {
    return {
        // Core fields
        auditId: auditResult.auditId,
        projectId: auditResult.projectId,
        userId: auditResult.userId,
        companyName: auditResult.companyName,
        website: auditResult.website,
        industry: auditResult.industry,
        country: auditResult.country,
        createdAt: auditResult.createdAt,
        status: auditResult.status,

        // Scores
        visibilityScore: auditResult.visibilityScore,
        subScores: auditResult.subScores,
        scoreExplanation: auditResult.scoreExplanation,

        // Summary
        summary: auditResult.summary,
        executiveReport: auditResult.executiveReport,

        // Crawl stats
        pagesCrawled: auditResult.crawl?.pagesCrawled || 0,
        pageTypes: auditResult.crawl?.pageTypes || {},
        siteSignals: auditResult.crawl?.siteSignals || {},
        contentGaps: auditResult.crawl?.contentGaps || [],

        // Analysis
        strengths: auditResult.strengths,
        weaknesses: auditResult.weaknesses,
        opportunities: auditResult.opportunities,
        priorityActions: auditResult.priorityActions,
    };
}

/**
 * Build Firestore-ready sub-collection documents
 */
export function buildFirestoreSubDocs(auditResult) {
    const auditId = auditResult.auditId;
    const createdAt = auditResult.createdAt;

    return {
        recommendations: (auditResult.recommendations || []).map((r, i) => ({
            auditId,
            order: i,
            title: r.title,
            priority: r.priority,
            impact: r.impact,
            details: r.details,
            category: r.category,
            status: 'pending',
            createdAt,
        })),

        faqSuggestions: (auditResult.faqSuggestions || []).map((q) => ({
            auditId,
            question: q,
            status: 'suggested',
            createdAt,
        })),

        suggestedPages: (auditResult.suggestedPages || []).map((p) => ({
            auditId,
            title: p.title,
            type: p.type,
            reason: p.reason,
            priority: p.priority,
            status: 'suggested',
            createdAt,
        })),

        competitors: (auditResult.competitorAnalysis || []).map((c) => ({
            auditId,
            domain: c.competitor,
            advantage: c.advantage,
            gap: c.gap,
            createdAt,
        })),

        crawledPages: (auditResult.crawl?.pages || []).map((p) => ({
            auditId,
            url: p.url,
            title: p.title,
            metaDescription: p.metaDescription,
            h1: p.h1,
            h2s: p.h2s,
            wordCount: p.wordCount,
            pageType: p.pageType,
            pageScore: p.pageScore,
            hasFAQ: p.hasFAQ,
            hasTable: p.hasTable,
            hasList: p.hasList,
            hasAnswerFirst: p.hasAnswerFirst,
            schemaTypes: p.schemaTypes,
            statusCode: p.statusCode,
            createdAt,
        })),

        report: {
            auditId,
            report: auditResult.report?.report || '',
            biggestIssue: auditResult.report?.biggestIssue || '',
            bestOpportunity: auditResult.report?.bestOpportunity || '',
            recommendedNextSteps: auditResult.report?.recommendedNextSteps || [],
            createdAt,
        },
    };
}

/* ==================== Helpers ==================== */

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
