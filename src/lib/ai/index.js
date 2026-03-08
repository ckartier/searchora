/**
 * Searchora AI Service — core AI engine
 *
 * Handles LLM calls with structured prompts and provides demo fallback.
 * Supports OpenAI, with architecture ready for any LLM provider.
 */

import {
    SYSTEM_PROMPT,
    buildAuditPrompt,
    buildFaqPrompt,
    buildSuggestedPagesPrompt,
    buildCompetitorPrompt,
    buildReportPrompt,
} from './promptBuilder.js';

import {
    parseJsonResponse,
    validateAuditOutput,
    validateFaqOutput,
    validatePagesOutput,
    validateCompetitorOutput,
    validateReportOutput,
} from './responseParser.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const LLM_PROVIDER = process.env.LLM_PROVIDER || (GEMINI_API_KEY ? 'gemini' : 'demo');

/* ==================== LLM CLIENT ==================== */

/**
 * Call the configured LLM provider (Gemini, OpenAI, or demo fallback)
 */
async function callLLM(systemPrompt, userPrompt, options = {}) {
    const { temperature = 0.7, maxTokens = 3000 } = options;

    // --- Gemini (default, free with Firebase) ---
    if ((LLM_PROVIDER === 'gemini' || LLM_PROVIDER === 'google') && GEMINI_API_KEY) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
                        }],
                        generationConfig: {
                            temperature,
                            maxOutputTokens: maxTokens,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                console.error('Gemini API error:', error);
                // Fall through to demo mode
                return null;
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            return text || null;
        } catch (err) {
            console.error('Gemini call failed:', err.message);
            return null;
        }
    }

    // --- OpenAI ---
    if (LLM_PROVIDER === 'openai' && OPENAI_API_KEY) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature,
                max_tokens: maxTokens,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`LLM error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || null;
    }

    // Demo mode — return null so the caller uses demo generators
    return null;
}

/* ==================== PUBLIC API ==================== */

/**
 * Generate a complete AI audit from crawl data
 */
export async function generateAudit(auditInput) {
    const prompt = buildAuditPrompt(auditInput);

    // Try LLM first
    const raw = await callLLM(SYSTEM_PROMPT, prompt, { maxTokens: 4000 });

    if (raw) {
        const parsed = parseJsonResponse(raw);
        return validateAuditOutput(parsed, buildDemoAudit(auditInput));
    }

    // Demo fallback
    return buildDemoAudit(auditInput);
}

/**
 * Generate FAQ suggestions
 */
export async function generateFaqSuggestions(companyName, industry, website, existingFaqs) {
    const prompt = buildFaqPrompt(companyName, industry, website, existingFaqs);
    const raw = await callLLM(SYSTEM_PROMPT, prompt);

    if (raw) {
        const parsed = parseJsonResponse(raw);
        return validateFaqOutput(parsed);
    }

    return buildDemoFaqs(companyName, industry);
}

/**
 * Generate suggested pages
 */
export async function generateSuggestedPages(companyName, industry, pageTypes, contentGaps) {
    const prompt = buildSuggestedPagesPrompt(companyName, industry, pageTypes, contentGaps);
    const raw = await callLLM(SYSTEM_PROMPT, prompt);

    if (raw) {
        const parsed = parseJsonResponse(raw);
        return validatePagesOutput(parsed);
    }

    return buildDemoPages(companyName, industry);
}

/**
 * Generate competitor analysis
 */
export async function generateCompetitorAnalysis(companyName, website, competitors, industry) {
    if (!competitors || competitors.length === 0) {
        return { competitors: [] };
    }

    const prompt = buildCompetitorPrompt(companyName, website, competitors, industry);
    const raw = await callLLM(SYSTEM_PROMPT, prompt);

    if (raw) {
        const parsed = parseJsonResponse(raw);
        return validateCompetitorOutput(parsed);
    }

    return buildDemoCompetitors(competitors, industry);
}

/**
 * Generate executive report
 */
export async function generateExecutiveReport(auditData) {
    const prompt = buildReportPrompt(auditData);
    const raw = await callLLM(SYSTEM_PROMPT, prompt);

    if (raw) {
        const parsed = parseJsonResponse(raw);
        return validateReportOutput(parsed);
    }

    return buildDemoReport(auditData);
}

/* ==================== DEMO GENERATORS ==================== */
/* These produce realistic, structured outputs from real crawl data */

function buildDemoAudit(input) {
    const {
        companyName = 'Your brand',
        website = '',
        industry = 'your industry',
        siteSignals = {},
        contentGaps = [],
        topPages = [],
        weakPages = [],
        siteScore = 0,
        existingFAQs = [],
        competitors = [],
    } = input;

    // ---- Sub-scores from real site signals ----
    const subScores = computeSubScores(siteSignals, topPages);

    // ---- Summary ----
    const scoreLevel = siteScore >= 60 ? 'solid' : siteScore >= 30 ? 'moderate' : 'low';
    const summary = `${companyName} has ${scoreLevel} AI visibility with a score of ${siteScore}/100 across ${input.totalPages || 0} analyzed pages. ${siteSignals.contentMostlyCommercial
        ? 'The site is heavily commercial with limited informational content that AI tools prefer to cite.'
        : siteSignals.hasEducationalContent
            ? 'The site has some educational content but needs more structured, answer-first formatting for AI retrieval.'
            : 'The site lacks the educational and informational content that AI tools use as primary sources.'
        } ${contentGaps.length > 0
            ? `There are ${contentGaps.length} significant content gaps to address.`
            : 'The content foundation is promising.'
        }`;

    // ---- Strengths from real data ----
    const strengths = [];
    if (siteSignals.hasGuides) strengths.push('Educational guide content found — builds topical authority');
    if (siteSignals.hasFaqCoverage) strengths.push(`FAQ content detected (${siteSignals.faqPages} pages) — strong foundation for AI answer inclusion`);
    if (siteSignals.hasComparisons) strengths.push('Comparison content available — effective for competitive queries');
    if (siteSignals.hasHowTo) strengths.push('How-to content found — highly cited format by AI tools');
    if (siteSignals.schemaAdoption > 30) strengths.push(`Good schema markup adoption (${siteSignals.schemaAdoption}%) — helps AI understand content`);
    if (siteSignals.avgWordCount > 800) strengths.push(`Substantial content depth (avg. ${siteSignals.avgWordCount} words per page)`);
    if (siteSignals.metaDescriptionCoverage > 70) strengths.push(`Strong meta description coverage (${siteSignals.metaDescriptionCoverage}%)`);
    if (topPages.length > 0 && topPages[0]?.pageScore > 50) strengths.push('Top pages have AI-ready structure with good scores');
    if ((input.pageTypes?.guide || 0) > 2) strengths.push(`${input.pageTypes.guide} guide pages provide educational authority`);
    if (strengths.length === 0) strengths.push('Website is accessible and crawlable', 'Brand has clear commercial positioning');

    // ---- Weaknesses from real data ----
    const weaknesses = [];
    if (!siteSignals.hasFaqCoverage) weaknesses.push('No FAQ content detected — missing the #1 format AI tools cite');
    if (!siteSignals.hasComparisons) weaknesses.push('No comparison content — invisible for "vs" and "best X for Y" queries');
    if (!siteSignals.hasDefinitions) weaknesses.push('No definition or glossary content — missing "What is X?" query opportunities');
    if (!siteSignals.hasGuides) weaknesses.push('No educational guides — AI tools strongly prefer informational sources');
    if (siteSignals.contentMostlyCommercial) weaknesses.push('Content is heavily commercial — AI tools deprioritize sales-focused pages');
    if (siteSignals.avgWordCount < 400) weaknesses.push(`Thin content (avg. ${siteSignals.avgWordCount} words) — not enough substance for AI citation`);
    if (siteSignals.schemaAdoption < 20) weaknesses.push(`Very low structured data adoption (${siteSignals.schemaAdoption}%) — AI tools rely on schema`);
    if (siteSignals.metaDescriptionCoverage < 50) weaknesses.push(`Poor meta description coverage (${siteSignals.metaDescriptionCoverage}%)`);
    if (weaknesses.length === 0) weaknesses.push('Minor optimization opportunities across content structure');

    // ---- Opportunities ----
    const opportunities = contentGaps.map((g) => g.action).slice(0, 6);
    if (opportunities.length === 0) {
        opportunities.push(
            'Add FAQ sections to top category and service pages',
            'Create comparison guides for main product/service categories',
            'Build educational content around core industry topics',
            'Implement structured data on key landing pages'
        );
    }

    // ---- Recommendations ----
    const recommendations = [];
    for (const gap of contentGaps.slice(0, 4)) {
        recommendations.push({
            title: gap.action,
            priority: gap.severity,
            impact: gap.type === 'faq' ? '+15-20% visibility' :
                gap.type === 'comparison' ? '+10-15% visibility' :
                    gap.type === 'guide' ? '+10-15% visibility' :
                        gap.type === 'technical' ? '+5-10% visibility' :
                            '+5-8% visibility',
            details: gap.description,
            category: ['faq', 'comparison', 'guide', 'definition', 'howto', 'balance', 'depth'].includes(gap.type) ? 'content' : 'technical',
        });
    }
    // Add page-specific recommendations
    for (const page of weakPages.slice(0, 3)) {
        if (page.wordCount < 300) {
            recommendations.push({
                title: `Expand content on ${safePath(page.url)} to 800+ words`,
                priority: 'medium',
                impact: '+3-5% page visibility',
                details: `Currently ${page.wordCount} words. Add structured, answer-first content with clear headings.`,
                category: 'content',
            });
        }
        if (!page.signals?.hasMetaDescription) {
            recommendations.push({
                title: `Add meta description to ${safePath(page.url)}`,
                priority: 'low',
                impact: '+1-2% discoverability',
                details: 'Missing meta descriptions reduce how AI tools understand and reference your page.',
                category: 'technical',
            });
        }
    }
    // Ensure we have enough recommendations
    if (recommendations.length < 5) {
        recommendations.push({
            title: 'Structure key pages with answer-first format',
            priority: 'high',
            impact: '+10-15% visibility',
            details: 'Put the most important answer in the first paragraph of each key page. AI tools extract top-of-page content.',
            category: 'structure',
        });
    }

    // ---- Suggested pages ----
    const suggestedPages = buildDemoPages(companyName, industry).pages;

    // ---- FAQ suggestions ----
    const faqSuggestions = buildDemoFaqs(companyName, industry).questions;

    // ---- Competitor analysis ----
    const competitorAnalysis = competitors.length > 0
        ? buildDemoCompetitors(competitors, industry).competitors
        : [];

    // ---- Priority actions ----
    const priorityActions = [];
    if (!siteSignals.hasFaqCoverage) {
        priorityActions.push({
            action: `Create a comprehensive FAQ page with 15-20 ${industry} questions`,
            expectedImpact: '+15-20% visibility within 4 weeks',
            timeframe: '1-2 weeks',
        });
    }
    if (!siteSignals.hasComparisons) {
        priorityActions.push({
            action: `Publish 3 comparison pages (${companyName} vs top alternatives)`,
            expectedImpact: '+10-15% visibility for competitive queries',
            timeframe: '2-3 weeks',
        });
    }
    if (siteSignals.schemaAdoption < 30) {
        priorityActions.push({
            action: 'Add FAQ and Article schema markup to top 10 pages',
            expectedImpact: '+5-10% structured data visibility',
            timeframe: '1 week',
        });
    }
    priorityActions.push({
        action: 'Restructure top landing pages with answer-first content format',
        expectedImpact: '+8-12% AI citation rate',
        timeframe: '2-3 weeks',
    });

    // ---- Score explanation ----
    const lowestSub = Object.entries(subScores).sort((a, b) => a[1] - b[1])[0];
    const scoreExplanation = `Your overall score of ${siteScore}/100 reflects ${siteScore >= 60 ? 'strong' : siteScore >= 30 ? 'moderate' : 'limited'
        } AI visibility. The fastest improvement will come from addressing ${lowestSub ? lowestSub[0].replace(/([A-Z])/g, ' $1').toLowerCase().trim() : 'content gaps'
        } (currently at ${lowestSub ? lowestSub[1] : 0}/100).`;

    // ---- Executive report ----
    const executiveReport = `${companyName} currently scores ${siteScore}/100 for AI visibility. ${siteScore >= 60
        ? 'The site has a strong foundation with clear opportunities to reach top-tier visibility.'
        : siteScore >= 30
            ? 'The site has moderate presence but is missing critical content types that AI tools prefer to cite.'
            : 'The site has limited AI visibility — competitors are likely capturing the majority of AI-generated answer citations.'
        } ${contentGaps.length > 0
            ? `The most impactful action is to ${contentGaps[0]?.action?.toLowerCase() || 'create structured informational content'}.`
            : 'Focused content optimization can significantly improve AI citation rates.'
        } With targeted execution on the priority actions, we estimate a ${siteScore < 30 ? '30-50' : siteScore < 60 ? '15-30' : '10-20'
        } point improvement within 8 weeks.`;

    return {
        summary,
        strengths,
        weaknesses,
        opportunities,
        subScores,
        scoreExplanation,
        recommendations,
        suggestedPages,
        faqSuggestions,
        competitorAnalysis,
        priorityActions,
        executiveReport,
    };
}

function computeSubScores(siteSignals, topPages) {
    const s = siteSignals || {};

    // Content clarity: based on meta descriptions + avg word count
    const contentClarity = Math.min(100, Math.round(
        (s.metaDescriptionCoverage || 0) * 0.4 +
        Math.min(100, (s.avgWordCount || 0) / 10) * 0.4 +
        (s.informationalRatio || 0) * 0.2
    ));

    // FAQ coverage
    const faqCoverage = Math.min(100, Math.round(
        (s.faqPages || 0) * 25 +
        (s.hasFaqCoverage ? 20 : 0)
    ));

    // Structured answer readiness: schema + answer-first pages
    const answerFirstCount = topPages?.filter((p) => p.signals?.answerFirst).length || 0;
    const structuredAnswerReadiness = Math.min(100, Math.round(
        (s.schemaAdoption || 0) * 0.5 +
        answerFirstCount * 10 +
        (s.hasHowTo ? 15 : 0)
    ));

    // Topical authority: guides + educational content + word count
    const topicalAuthority = Math.min(100, Math.round(
        (s.guidePages || 0) * 15 +
        (s.informationalRatio || 0) * 0.4 +
        Math.min(30, (s.avgWordCount || 0) / 40)
    ));

    // Comparison content
    const comparisonContent = Math.min(100, Math.round(
        (s.comparisonPages || 0) * 25 +
        (s.hasComparisons ? 20 : 0)
    ));

    // Educational depth
    const educationalDepth = Math.min(100, Math.round(
        (s.guidePages || 0) * 12 +
        (s.howToPages || 0) * 15 +
        (s.definitionPages || 0) * 12 +
        (s.informationalPages || 0) * 8
    ));

    // Technical readiness
    const technicalReadiness = Math.min(100, Math.round(
        (s.schemaAdoption || 0) * 0.5 +
        (s.metaDescriptionCoverage || 0) * 0.3 +
        (s.avgPageScore || 0) * 0.2
    ));

    return {
        contentClarity,
        faqCoverage,
        structuredAnswerReadiness,
        topicalAuthority,
        comparisonContent,
        educationalDepth,
        technicalReadiness,
    };
}

function buildDemoFaqs(companyName, industry) {
    const name = companyName || 'this company';
    const ind = industry || 'the industry';
    return {
        questions: [
            `What is ${name} and what do they offer?`,
            `How much does ${name} cost?`,
            `What are the best alternatives to ${name}?`,
            `Who is ${name} best suited for?`,
            `How does ${name} compare to its main competitors?`,
            `What features does ${name} include?`,
            `How do I get started with ${name}?`,
            `What results can I expect from using ${name}?`,
            `Is ${name} suitable for small businesses?`,
            `What is the difference between ${name}'s plans?`,
            `What are the top trends in ${ind} right now?`,
            `How do I choose the right solution in ${ind}?`,
            `What common mistakes should I avoid in ${ind}?`,
            `What are the key success factors in ${ind}?`,
            `How long does it take to see results with ${name}?`,
        ],
    };
}

function buildDemoPages(companyName, industry) {
    const name = companyName || 'Your Brand';
    const ind = industry || 'Your Industry';
    return {
        pages: [
            { title: `FAQ: Top 20 Questions About ${ind}`, type: 'faq', reason: 'FAQ pages are the #1 content type cited by AI tools', priority: 'high' },
            { title: `${name} vs Competitors — Honest Comparison`, type: 'comparison', reason: '"vs" queries are growing 40% YoY in AI searches', priority: 'high' },
            { title: `Complete Guide to ${ind} in 2025`, type: 'guide', reason: 'Comprehensive guides build topical authority for AI citation', priority: 'high' },
            { title: `${ind} Glossary: Key Terms Explained`, type: 'definition', reason: '"What is X?" queries are the most common AI use case', priority: 'medium' },
            { title: `How to Choose the Right ${ind} Solution`, type: 'guide', reason: 'Decision-support content is highly referenced by AI assistants', priority: 'high' },
            { title: `${name} Case Studies & Client Results`, type: 'use-case', reason: 'First-party evidence increases citation credibility', priority: 'medium' },
            { title: `Step-by-Step: Getting Started with ${name}`, type: 'guide', reason: 'How-to content is preferred format for instructional AI answers', priority: 'medium' },
            { title: `Best ${ind} Practices for [Target Audience]`, type: 'product-education', reason: 'Best-practices content captures informational queries', priority: 'medium' },
            { title: `Common ${ind} Mistakes to Avoid`, type: 'guide', reason: 'Problem-solution content is highly AI-retrievable', priority: 'low' },
            { title: `${ind} Trends and Predictions`, type: 'guide', reason: 'Trend content builds authority and recency signals', priority: 'low' },
        ],
    };
}

function buildDemoCompetitors(competitors, industry) {
    return {
        competitors: competitors.filter(Boolean).map((comp, i) => ({
            competitor: comp.replace(/https?:\/\//, '').replace(/\/$/, ''),
            advantage: [
                'More structured FAQ content covering common questions',
                'Stronger educational content with guides and tutorials',
                'Better comparison pages that AI tools frequently cite',
            ][i % 3],
            gap: [
                `${industry || 'Industry'} FAQ coverage is stronger — your site needs equivalent depth`,
                'More answer-first content formatting — your pages need structural improvements',
                'Broader topical coverage with definition and glossary content',
            ][i % 3],
        })),
    };
}

function buildDemoReport(auditData) {
    const score = auditData.visibilityScore || auditData.siteScore || 0;
    const name = auditData.companyName || 'Your brand';

    return {
        report: `${name} currently achieves a ${score}/100 AI visibility score. ${score >= 60
            ? 'The site has a solid foundation with clear paths to top-tier visibility.'
            : score >= 30
                ? 'The site has moderate presence but is missing critical content formats that AI tools prefer.'
                : 'The site has significant gaps in AI-ready content, providing large improvement opportunities.'
            } The most impactful next step is to ${auditData.weaknesses?.[0]?.toLowerCase() || 'create structured informational content'
            }.`,
        biggestIssue: auditData.weaknesses?.[0] || 'Limited AI-optimized content presence',
        bestOpportunity: auditData.opportunities?.[0] || 'Create structured FAQ and guide content',
        recommendedNextSteps: [
            auditData.priorityActions?.[0]?.action || 'Create comprehensive FAQ content',
            auditData.priorityActions?.[1]?.action || 'Add structured data to key pages',
            auditData.priorityActions?.[2]?.action || 'Publish comparison content for top queries',
        ],
    };
}

/* ==================== Helpers ==================== */

function safePath(url) {
    try {
        const path = new URL(url).pathname;
        return path.length > 30 ? path.substring(0, 30) + '...' : path;
    } catch {
        return url?.substring(0, 30) || '';
    }
}
