/**
 * AI-Readiness Scoring — page-level and site-level signal computation
 */

/**
 * Compute page-level AI-readiness signals
 */
export function computePageSignals(pageData) {
    const wordCount = pageData.wordCount || 0;
    const text = (pageData.extractedText || '').toLowerCase();

    return {
        // Content quality signals
        answerFirst: pageData.hasAnswerFirst || false,
        hasShortAnswerNearTop: pageData.hasShortAnswerNearTop || false,

        // Structure signals
        faqPresent: pageData.hasFAQ || false,
        comparisonPresent: pageData.hasComparison || false,
        definitionPresent: pageData.hasDefinitions || false,
        howToPresent: pageData.hasHowTo || false,
        tablePresent: pageData.hasTable || false,
        listPresent: pageData.hasList || false,

        // Content health signals
        thinContent: wordCount < 300,
        moderateContent: wordCount >= 300 && wordCount < 800,
        substantialContent: wordCount >= 800,
        comprehensiveContent: wordCount >= 2000,

        // Structure quality
        hasStructuredHeadings: (pageData.h2s?.length || 0) >= 2,
        hasSchema: (pageData.schemaTypes?.length || 0) > 0,
        hasMultipleH1: pageData.hasMultipleH1 || false,
        hasMetaDescription: !!pageData.metaDescription,

        // Commercial vs informational balance
        commercialHeavy: detectCommercialTone(text, wordCount),
        informationalStrong: detectInformationalTone(text, wordCount),

        // Weak signals
        missingH1: !pageData.h1,
        missingMetaDescription: !pageData.metaDescription,
        noInternalLinks: (pageData.linkMetrics?.contentLinks || 0) === 0,

        // Content depth
        contentDepth: pageData.contentDepth || 'unknown',
    };
}

/**
 * Compute a page-level AI visibility score (0–100)
 */
export function computePageScore(pageData, signals) {
    let score = 0;

    // Content depth (0-25 points)
    const wordCount = pageData.wordCount || 0;
    if (wordCount >= 2000) score += 25;
    else if (wordCount >= 800) score += 20;
    else if (wordCount >= 300) score += 12;
    else if (wordCount >= 100) score += 5;

    // Structure quality (0-25 points)
    if (signals.hasStructuredHeadings) score += 8;
    if (signals.hasSchema) score += 8;
    if (signals.hasMetaDescription) score += 5;
    if (!signals.hasMultipleH1 && pageData.h1) score += 4;

    // AI-friendly patterns (0-30 points)
    if (signals.answerFirst) score += 10;
    if (signals.faqPresent) score += 8;
    if (signals.listPresent) score += 4;
    if (signals.tablePresent) score += 4;
    if (signals.definitionPresent) score += 4;

    // Content type bonuses (0-10 points)
    if (signals.informationalStrong) score += 6;
    if (signals.howToPresent) score += 4;

    // Penalties (negative points)
    if (signals.thinContent) score -= 10;
    if (signals.commercialHeavy) score -= 5;
    if (signals.missingH1) score -= 5;
    if (signals.missingMetaDescription) score -= 3;
    if (signals.hasMultipleH1) score -= 3;

    return Math.max(0, Math.min(100, score));
}

/**
 * Compute site-level signals from all crawled pages
 */
export function computeSiteSignals(pages) {
    const total = pages.length;
    if (total === 0) {
        return {
            hasEducationalContent: false,
            hasFaqCoverage: false,
            hasComparisons: false,
            hasDefinitions: false,
            hasGuides: false,
            hasHowTo: false,
            contentMostlyCommercial: false,
            informationalRatio: 0,
            avgWordCount: 0,
            avgPageScore: 0,
            schemaAdoption: 0,
            metaDescriptionCoverage: 0,
        };
    }

    // Page type counts
    const types = {};
    for (const page of pages) {
        types[page.pageType] = (types[page.pageType] || 0) + 1;
    }

    // Count pages with specific features
    let faqPages = 0;
    let comparisonPages = 0;
    let definitionPages = 0;
    let guidePages = 0;
    let howToPages = 0;
    let commercialPages = 0;
    let informationalPages = 0;
    let withSchema = 0;
    let withMetaDesc = 0;
    let totalWords = 0;
    let totalScore = 0;

    for (const page of pages) {
        const signals = page.signals || {};

        if (signals.faqPresent || page.pageType === 'faq') faqPages++;
        if (signals.comparisonPresent || page.pageType === 'comparison') comparisonPages++;
        if (signals.definitionPresent || page.pageType === 'definition') definitionPages++;
        if (page.pageType === 'guide') guidePages++;
        if (signals.howToPresent) howToPages++;
        if (signals.commercialHeavy) commercialPages++;
        if (signals.informationalStrong) informationalPages++;
        if (signals.hasSchema) withSchema++;
        if (signals.hasMetaDescription) withMetaDesc++;
        totalWords += page.wordCount || 0;
        totalScore += page.pageScore || 0;
    }

    const informationalRatio = total > 0 ? informationalPages / total : 0;

    return {
        totalPages: total,
        pageTypes: types,

        // Content coverage
        hasEducationalContent: guidePages > 0 || informationalPages > 0,
        hasFaqCoverage: faqPages > 0,
        hasComparisons: comparisonPages > 0,
        hasDefinitions: definitionPages > 0,
        hasGuides: guidePages > 0,
        hasHowTo: howToPages > 0,

        // Counts
        faqPages,
        comparisonPages,
        definitionPages,
        guidePages,
        howToPages,
        commercialPages,
        informationalPages,

        // Ratios
        informationalRatio: Math.round(informationalRatio * 100),
        contentMostlyCommercial: commercialPages > informationalPages && commercialPages > total * 0.5,

        // Quality metrics
        avgWordCount: Math.round(totalWords / total),
        avgPageScore: Math.round(totalScore / total),
        schemaAdoption: Math.round((withSchema / total) * 100),
        metaDescriptionCoverage: Math.round((withMetaDesc / total) * 100),
    };
}

/**
 * Compute overall site AI visibility score (0–100)
 */
export function computeSiteScore(siteSignals) {
    let score = 0;

    // Content diversity (0-30)
    if (siteSignals.hasGuides) score += 8;
    if (siteSignals.hasFaqCoverage) score += 8;
    if (siteSignals.hasComparisons) score += 6;
    if (siteSignals.hasDefinitions) score += 4;
    if (siteSignals.hasHowTo) score += 4;

    // Quality metrics (0-30)
    score += Math.min(15, siteSignals.avgPageScore * 0.3);
    if (siteSignals.avgWordCount > 500) score += 5;
    if (siteSignals.avgWordCount > 1000) score += 5;
    if (siteSignals.informationalRatio > 30) score += 5;

    // Technical (0-20)
    score += Math.min(10, siteSignals.schemaAdoption * 0.1);
    score += Math.min(10, siteSignals.metaDescriptionCoverage * 0.1);

    // Penalties
    if (siteSignals.contentMostlyCommercial) score -= 10;
    if (!siteSignals.hasFaqCoverage) score -= 5;
    if (!siteSignals.hasEducationalContent) score -= 8;

    // Page count bonus
    if (siteSignals.totalPages >= 10) score += 5;
    if (siteSignals.totalPages >= 20) score += 5;

    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate content gap analysis
 */
export function generateContentGaps(siteSignals) {
    const gaps = [];

    if (!siteSignals.hasFaqCoverage) {
        gaps.push({
            type: 'faq',
            severity: 'high',
            title: 'No FAQ content detected',
            description: 'FAQ pages are one of the strongest signals for AI answer inclusion. Creating structured FAQ content would significantly improve visibility.',
            action: 'Create a comprehensive FAQ page with common industry questions',
        });
    }

    if (!siteSignals.hasComparisons) {
        gaps.push({
            type: 'comparison',
            severity: 'high',
            title: 'No comparison pages detected',
            description: 'AI tools frequently reference comparison content when users ask "which is better" or "best X for Y" questions.',
            action: 'Create comparison pages for your product/service vs top competitors',
        });
    }

    if (!siteSignals.hasGuides) {
        gaps.push({
            type: 'guide',
            severity: 'high',
            title: 'No educational guides detected',
            description: 'Educational content builds topical authority and is frequently cited by AI assistants.',
            action: 'Create in-depth guides covering key topics in your industry',
        });
    }

    if (!siteSignals.hasDefinitions) {
        gaps.push({
            type: 'definition',
            severity: 'medium',
            title: 'No definition/glossary content detected',
            description: 'Definition pages are ideal for "What is X?" queries which AI tools handle frequently.',
            action: 'Build a glossary of industry terms with clear definitions',
        });
    }

    if (!siteSignals.hasHowTo) {
        gaps.push({
            type: 'howto',
            severity: 'medium',
            title: 'No how-to content detected',
            description: 'Step-by-step guides are highly preferred by AI tools for instructional queries.',
            action: 'Create how-to guides for common tasks in your domain',
        });
    }

    if (siteSignals.contentMostlyCommercial) {
        gaps.push({
            type: 'balance',
            severity: 'high',
            title: 'Content is heavily commercial',
            description: 'AI tools prefer balanced, informational content over purely commercial pages. Your site appears to be mostly commercial.',
            action: 'Balance commercial content with informational and educational pages',
        });
    }

    if (siteSignals.schemaAdoption < 30) {
        gaps.push({
            type: 'technical',
            severity: 'medium',
            title: 'Low structured data adoption',
            description: `Only ${siteSignals.schemaAdoption}% of pages have schema markup. Structured data helps AI tools understand your content.`,
            action: 'Implement FAQ, HowTo, Article, and Product schema where appropriate',
        });
    }

    if (siteSignals.metaDescriptionCoverage < 50) {
        gaps.push({
            type: 'technical',
            severity: 'low',
            title: 'Missing meta descriptions',
            description: `Only ${siteSignals.metaDescriptionCoverage}% of pages have meta descriptions.`,
            action: 'Add unique, descriptive meta descriptions to all important pages',
        });
    }

    if (siteSignals.avgWordCount < 300) {
        gaps.push({
            type: 'depth',
            severity: 'high',
            title: 'Very thin content across the site',
            description: `Average word count is ${siteSignals.avgWordCount}. AI tools need substantial content to reference.`,
            action: 'Increase content depth on key pages to at least 800+ words',
        });
    }

    return gaps;
}

/* ==================== Helpers ==================== */

function detectCommercialTone(text, wordCount) {
    if (wordCount < 50) return false;
    const commercialTerms = (text.match(
        /\b(buy|purchase|order|shop|price|pricing|discount|deal|sale|offer|free trial|sign up|subscribe|checkout|add to cart|limited time|exclusive)\b/gi
    ) || []).length;
    const ratio = commercialTerms / (wordCount / 100);
    return ratio > 2;
}

function detectInformationalTone(text, wordCount) {
    if (wordCount < 100) return false;
    const infoTerms = (text.match(
        /\b(learn|understand|explain|example|guide|tutorial|how to|what is|tip|trick|best practice|overview|introduction|concept|method|approach|strategy)\b/gi
    ) || []).length;
    const ratio = infoTerms / (wordCount / 100);
    return ratio > 1;
}
