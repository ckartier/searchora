/**
 * Searchora — Content Opportunity Engine
 *
 * Combines crawl data, AI audit results, AI answer tracking, and competitor signals
 * to generate strategic, business-grade content opportunities.
 */

/**
 * Run the Content Opportunity Engine
 * @param {Object} params
 * @param {string} params.companyName
 * @param {string} params.website
 * @param {string} params.industry
 * @param {Object} params.crawlData - crawl results (pages, pageTypes, contentGaps, siteSignals)
 * @param {Object} params.auditData - AI audit results (strengths, weaknesses, recommendations, subScores)
 * @param {Array}  params.competitors - competitor domains / analysis
 * @param {Array}  params.trackedPrompts - AI prompts tracked (optional)
 */
export function generateContentOpportunities({
    companyName = '',
    website = '',
    industry = '',
    crawlData = {},
    auditData = {},
    competitors = [],
    trackedPrompts = [],
}) {
    const pages = crawlData.pages || [];
    const pageTypes = crawlData.pageTypes || {};
    const contentGaps = crawlData.contentGaps || [];
    const siteSignals = crawlData.siteSignals || {};

    const strengths = auditData.strengths || [];
    const weaknesses = auditData.weaknesses || [];
    const recommendations = auditData.recommendations || [];
    const subScores = auditData.subScores || {};

    // Analyze what exists on the site
    const existingContent = analyzeExistingContent(pages, pageTypes);

    // Detect missing content types
    const missingTypes = detectMissingContentTypes(existingContent, siteSignals);

    // Generate content opportunities from multiple signals
    const contentOpportunities = generatePageOpportunities(
        companyName, industry, existingContent, missingTypes,
        contentGaps, weaknesses, recommendations, competitors, trackedPrompts
    );

    // Generate FAQ opportunities
    const faqOpportunities = generateFaqOpportunities(
        industry, existingContent, pages, contentGaps, trackedPrompts
    );

    // Generate comparison opportunities
    const comparisonOpportunities = generateComparisonOpportunities(
        industry, existingContent, competitors, trackedPrompts
    );

    // Generate definition opportunities
    const definitionOpportunities = generateDefinitionOpportunities(
        industry, existingContent, contentGaps
    );

    // Detect content themes
    const contentThemes = detectContentThemes(
        contentOpportunities, faqOpportunities, comparisonOpportunities,
        definitionOpportunities, industry
    );

    // Build priority plan
    const priorityPlan = buildPriorityPlan(
        contentOpportunities, faqOpportunities,
        comparisonOpportunities, definitionOpportunities
    );

    return {
        companyName,
        website,
        industry,
        contentOpportunities: sortByPriority(contentOpportunities),
        faqOpportunities: sortByPriority(faqOpportunities),
        comparisonOpportunities: sortByPriority(comparisonOpportunities),
        definitionOpportunities: sortByPriority(definitionOpportunities),
        contentThemes,
        priorityPlan,
        stats: {
            totalOpportunities:
                contentOpportunities.length + faqOpportunities.length +
                comparisonOpportunities.length + definitionOpportunities.length,
            highPriority: [...contentOpportunities, ...faqOpportunities, ...comparisonOpportunities, ...definitionOpportunities]
                .filter((o) => o.priority === 'high').length,
            missingTypes: missingTypes.length,
            themes: contentThemes.length,
        },
    };
}

/* ==================== ANALYZE EXISTING CONTENT ==================== */

function analyzeExistingContent(pages, pageTypes) {
    const result = {
        totalPages: pages.length,
        types: pageTypes,
        hasGuides: (pageTypes.guide || 0) > 0,
        hasFaq: (pageTypes.faq || 0) > 0,
        hasComparison: (pageTypes.comparison || 0) > 0,
        hasDefinition: (pageTypes.definition || 0) > 0,
        hasProduct: (pageTypes.product || 0) > 0,
        hasBlog: (pageTypes.blog || 0) > 0,
        hasService: (pageTypes.service || 0) > 0,
        hasContact: (pageTypes.contact || 0) > 0,
        hasPricing: (pageTypes.pricing || 0) > 0,
        pagesWithFaq: pages.filter((p) => p.hasFAQ || p.structures?.faq).length,
        pagesWithComparison: pages.filter((p) => p.hasTable || p.structures?.comparison).length,
        pagesWithList: pages.filter((p) => p.hasList || p.structures?.list).length,
        pagesWithAnswerFirst: pages.filter((p) => p.hasAnswerFirst).length,
        avgWordCount: pages.length > 0
            ? Math.round(pages.reduce((a, p) => a + (p.wordCount || 0), 0) / pages.length)
            : 0,
        titles: pages.map((p) => p.title?.toLowerCase() || ''),
        urls: pages.map((p) => p.url?.toLowerCase() || ''),
        h1s: pages.map((p) => p.h1?.toLowerCase() || ''),
    };

    return result;
}

/* ==================== DETECT MISSING CONTENT TYPES ==================== */

function detectMissingContentTypes(existing, siteSignals) {
    const missing = [];

    if (!existing.hasFaq && !existing.pagesWithFaq) {
        missing.push({ type: 'faq', label: 'FAQ Page', severity: 'high' });
    }
    if (!existing.hasComparison) {
        missing.push({ type: 'comparison', label: 'Comparison Content', severity: 'high' });
    }
    if (!existing.hasDefinition) {
        missing.push({ type: 'definition', label: 'Glossary / Definition Pages', severity: 'medium' });
    }
    if (!existing.hasGuides) {
        missing.push({ type: 'guide', label: 'Educational Guides', severity: 'high' });
    }
    if (existing.pagesWithAnswerFirst < 3) {
        missing.push({ type: 'answer-first', label: 'Answer-First Content', severity: 'medium' });
    }

    const schemaAdoption = siteSignals?.schemaAdoption || 0;
    if (schemaAdoption < 20) {
        missing.push({ type: 'schema', label: 'Structured Data / Schema', severity: 'medium' });
    }

    return missing;
}

/* ==================== GENERATE PAGE OPPORTUNITIES ==================== */

function generatePageOpportunities(
    companyName, industry, existing, missingTypes,
    contentGaps, weaknesses, recommendations, competitors, trackedPrompts
) {
    const opportunities = [];
    const addedTitles = new Set();

    function addOpp(opp) {
        const key = opp.title.toLowerCase();
        if (!addedTitles.has(key)) {
            addedTitles.add(key);
            opportunities.push(opp);
        }
    }

    // 1. From content gaps
    for (const gap of contentGaps) {
        if (gap.type === 'missing_definition' || gap.gap?.includes('definition') || gap.gap?.includes('glossary')) {
            addOpp({
                title: `${industry} Glossary — Key Terms Explained`,
                type: 'definition',
                priority: 'high',
                reason: 'No definition or glossary content detected. "What is X?" queries are the most common AI use case.',
                aiValue: 'Definition pages are directly used in AI answer snippets.',
                gapDetected: gap.gap || 'No glossary/definition pages found on the site.',
                suggestedStructure: ['One-sentence definition', 'Detailed explanation', 'Visual example', 'Related terms', 'FAQ'],
            });
        }
        if (gap.type === 'low_schema' || gap.gap?.includes('schema') || gap.gap?.includes('structured data')) {
            addOpp({
                title: `Add FAQ and Article Schema to Top Pages`,
                type: 'technical',
                priority: 'high',
                reason: 'Low structured data adoption. AI tools rely heavily on schema markup to identify content structure.',
                aiValue: 'Schema markup directly improves AI content retrieval accuracy.',
                gapDetected: gap.gap || 'Very few pages use structured data.',
                suggestedStructure: ['Identify top 10 pages by traffic', 'Add FAQ schema to Q&A content', 'Add Article schema to guides', 'Add Product schema to product pages'],
            });
        }
    }

    // 2. From missing content types
    for (const missing of missingTypes) {
        if (missing.type === 'faq') {
            addOpp({
                title: `FAQ: Top 20 Questions About ${industry}`,
                type: 'faq',
                priority: 'high',
                reason: 'FAQ pages are the #1 content type cited by AI tools. No dedicated FAQ page found.',
                aiValue: 'Directly answers common questions AI tools receive about this topic.',
                gapDetected: 'No dedicated FAQ page exists on the website.',
                suggestedStructure: ['Direct answer per question', 'Short paragraph explanation', 'Related questions', 'FAQ schema markup'],
            });
        }
        if (missing.type === 'comparison') {
            addOpp({
                title: `${companyName} vs Competitors — Honest Comparison`,
                type: 'comparison',
                priority: 'high',
                reason: '"vs" queries are growing 40% YoY in AI searches. No comparison content found.',
                aiValue: 'Comparison pages perform well in AI-generated recommendations and "vs" queries.',
                gapDetected: 'The site lacks comparison content.',
                suggestedStructure: ['What each option is', 'Key differences table', 'Pros and cons', 'Best use cases', 'FAQ'],
            });
        }
        if (missing.type === 'guide') {
            addOpp({
                title: `Complete Guide to ${industry} in ${new Date().getFullYear()}`,
                type: 'guide',
                priority: 'high',
                reason: 'Comprehensive guides build topical authority. No guide-type pages detected.',
                aiValue: 'Guides are highly cited for educational and research prompts.',
                gapDetected: 'No in-depth guide content found on the website.',
                suggestedStructure: ['Direct answer summary', 'Key concepts explained', 'Step-by-step guidance', 'Practical criteria', 'Comparison table', 'FAQ'],
            });
        }
    }

    // 3. From audit recommendations
    for (const rec of recommendations.slice(0, 8)) {
        if (rec.title && !rec.title.includes('Expand content') && !rec.title.includes('Add meta')) {
            addOpp({
                title: rec.title,
                type: rec.category === 'technical' ? 'technical' : 'guide',
                priority: rec.priority || 'medium',
                reason: rec.reason || rec.description || 'Based on AI audit analysis.',
                aiValue: rec.impact || 'Improves AI content retrieval.',
                gapDetected: rec.reason || 'Identified during site audit.',
                suggestedStructure: rec.suggestedStructure || ['Direct answer summary', 'Detailed explanation', 'Actionable steps', 'FAQ'],
            });
        }
    }

    // 4. From competitor analysis
    for (const comp of competitors.slice(0, 5)) {
        if (comp.advantage) {
            addOpp({
                title: `${companyName} vs ${comp.competitor || comp.domain} — Full Comparison`,
                type: 'comparison',
                priority: 'high',
                reason: `Competitor ${comp.competitor || comp.domain} has an advantage in: ${comp.advantage}. Creating comparison content helps level the playing field.`,
                aiValue: 'Direct competitor comparisons are among the highest-cited page types in AI answers.',
                gapDetected: `No comparison page with ${comp.competitor || comp.domain} found.`,
                suggestedStructure: ['What each company offers', 'Feature comparison table', 'Pricing comparison', 'Pros and cons', 'Who should choose which', 'FAQ'],
            });
        }
    }

    // 5. From tracked prompts where client is NOT cited
    for (const prompt of trackedPrompts.filter((p) => !p.cited).slice(0, 5)) {
        addOpp({
            title: inferPageTitle(prompt.prompt, companyName),
            type: inferPageType(prompt.prompt),
            priority: 'high',
            reason: `Your brand is not mentioned when users ask "${prompt.prompt}". Creating targeted content for this query pattern increases citation probability.`,
            aiValue: 'Directly targets an AI query where you are currently not cited.',
            gapDetected: `No content on the website targets this specific question pattern.`,
            suggestedStructure: getStructureForType(inferPageType(prompt.prompt)),
        });
    }

    // 6. Industry-specific decision pages
    if (!existing.titles.some((t) => t.includes('best') || t.includes('choose') || t.includes('how to pick'))) {
        addOpp({
            title: `How to Choose the Right ${industry} Solution`,
            type: 'decision',
            priority: 'medium',
            reason: 'Decision-support content is highly referenced by AI assistants when users ask for recommendations.',
            aiValue: '"How to choose" and "best X for Y" queries are extremely common in AI.',
            gapDetected: 'No decision-support or buying guide content found.',
            suggestedStructure: ['What to look for', 'Key criteria', 'Comparison of options', 'Best for different needs', 'Common mistakes', 'FAQ'],
        });
    }

    // 7. Use-case pages
    addOpp({
        title: `${companyName} Case Studies & Client Results`,
        type: 'use-case',
        priority: 'medium',
        reason: 'First-party evidence increases citation credibility. AI tools value real-world results.',
        aiValue: 'Case studies provide evidence that AI tools reference for credibility.',
        gapDetected: existing.titles.some((t) => t.includes('case') || t.includes('result')) ? 'Existing case studies may need updating' : 'No case study content found.',
        suggestedStructure: ['Client challenge', 'Solution implemented', 'Results with metrics', 'Client quote', 'Key takeaways'],
    });

    return opportunities;
}

/* ==================== FAQ OPPORTUNITIES ==================== */

function generateFaqOpportunities(industry, existing, pages, contentGaps, trackedPrompts) {
    const faqs = [];
    const added = new Set();

    function addFaq(question, reason, priority = 'medium') {
        const key = question.toLowerCase();
        if (!added.has(key)) {
            added.add(key);
            faqs.push({ question, reason, priority });
        }
    }

    // From tracked prompts
    for (const prompt of trackedPrompts) {
        if (prompt.prompt) {
            addFaq(
                prompt.prompt,
                prompt.cited
                    ? 'You are already cited — add FAQ to reinforce positioning.'
                    : 'You are NOT cited for this query — a direct FAQ answer increases chances.',
                prompt.cited ? 'medium' : 'high'
            );
        }
    }

    // Industry-specific FAQ patterns
    const faqPatterns = generateIndustryFaqPatterns(industry);
    for (const pattern of faqPatterns) {
        if (!existing.titles.some((t) => t.includes(pattern.keyword))) {
            addFaq(pattern.question, pattern.reason, pattern.priority);
        }
    }

    // From content gaps
    for (const gap of contentGaps) {
        if (gap.gap?.includes('FAQ') || gap.gap?.includes('faq')) {
            addFaq(
                `What is the most important thing to know about ${industry}?`,
                'Fundamental question that AI tools frequently need to answer.',
                'high'
            );
        }
    }

    return faqs;
}

/* ==================== COMPARISON OPPORTUNITIES ==================== */

function generateComparisonOpportunities(industry, existing, competitors, trackedPrompts) {
    const comparisons = [];
    const added = new Set();

    function addComp(title, reason, priority = 'medium') {
        const key = title.toLowerCase();
        if (!added.has(key)) {
            added.add(key);
            comparisons.push({ title, reason, priority });
        }
    }

    // From competitor data
    for (const comp of competitors.slice(0, 5)) {
        const compName = comp.competitor || comp.domain || '';
        if (compName) {
            addComp(
                `${compName} Alternatives — Complete Comparison`,
                `"Alternative to ${compName}" is a common AI query. Creating comparison content captures this traffic.`,
                'high'
            );
        }
    }

    // From tracked prompts with "vs" or comparison intent
    for (const prompt of trackedPrompts) {
        if (prompt.prompt && (prompt.prompt.includes(' vs ') || prompt.prompt.includes('compare') || prompt.prompt.includes('difference'))) {
            addComp(
                prompt.prompt,
                'This comparison query is being asked to AI tools. A dedicated page targets it directly.',
                'high'
            );
        }
    }

    // Generic industry comparison
    if (!existing.hasComparison) {
        addComp(
            `Top ${industry} Solutions Compared`,
            '"Best X" and comparison queries are growing. A comprehensive comparison page helps win these.',
            'high'
        );
    }

    return comparisons;
}

/* ==================== DEFINITION OPPORTUNITIES ==================== */

function generateDefinitionOpportunities(industry, existing, contentGaps) {
    const definitions = [];
    const added = new Set();

    function addDef(title, reason, priority = 'medium') {
        const key = title.toLowerCase();
        if (!added.has(key)) {
            added.add(key);
            definitions.push({ title, reason, priority });
        }
    }

    // Check content gaps for definition needs
    for (const gap of contentGaps) {
        if (gap.type === 'missing_definition' || gap.gap?.includes('definition') || gap.gap?.includes('glossary')) {
            addDef(
                `${industry} Glossary — Key Terms Explained`,
                '"What is X?" queries are the most common AI use case. A glossary page captures dozens of these.',
                'high'
            );
        }
    }

    if (!existing.hasDefinition) {
        addDef(
            `What is ${industry}? — Complete Explanation`,
            'Industry definition pages are foundational for AI answer retrieval.',
            'medium'
        );
    }

    return definitions;
}

/* ==================== CONTENT THEMES ==================== */

function detectContentThemes(contentOpps, faqOpps, compOpps, defOpps, industry) {
    const themes = new Map();

    const allText = [
        ...contentOpps.map((o) => o.title),
        ...faqOpps.map((o) => o.question),
        ...compOpps.map((o) => o.title),
        ...defOpps.map((o) => o.title),
    ].join(' ').toLowerCase();

    // Extract recurring meaningful words
    const words = allText.split(/\s+/).filter((w) => w.length > 4);
    const freq = {};
    for (const w of words) {
        if (!STOP_WORDS.has(w)) {
            freq[w] = (freq[w] || 0) + 1;
        }
    }

    // Top themes by frequency
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    for (const [word, count] of sorted.slice(0, 8)) {
        if (count >= 2) {
            themes.set(word, { label: word, frequency: count, priority: count >= 4 ? 'high' : 'medium' });
        }
    }

    // Add industry as a theme
    if (industry) {
        themes.set(industry.toLowerCase(), { label: industry, frequency: 10, priority: 'high' });
    }

    return Array.from(themes.values()).slice(0, 10);
}

const STOP_WORDS = new Set([
    'about', 'after', 'again', 'being', 'between', 'could', 'every', 'first',
    'found', 'great', 'important', 'large', 'might', 'other', 'pages', 'should',
    'their', 'these', 'those', 'through', 'under', 'using', 'where', 'which',
    'while', 'would', 'content', 'based', 'complete', 'create', 'guide',
    'missing', 'opportunities', 'opportunity', 'questions', 'reason',
]);

/* ==================== PRIORITY PLAN ==================== */

function buildPriorityPlan(contentOpps, faqOpps, compOpps, defOpps) {
    const plan = [];

    const highGuides = contentOpps.filter((o) => o.priority === 'high' && o.type === 'guide').length;
    const highComps = compOpps.filter((o) => o.priority === 'high').length;
    const highFaqs = faqOpps.filter((o) => o.priority === 'high').length;
    const highDefs = defOpps.filter((o) => o.priority === 'high').length;

    if (highGuides > 0) plan.push(`Publish ${highGuides} high-priority guide${highGuides > 1 ? 's' : ''}`);
    if (highFaqs > 0) plan.push(`Add ${highFaqs} FAQ answer${highFaqs > 1 ? 's' : ''} to strategic pages`);
    if (highComps > 0) plan.push(`Create ${highComps} comparison page${highComps > 1 ? 's' : ''}`);
    if (highDefs > 0) plan.push(`Create ${highDefs} definition/glossary page${highDefs > 1 ? 's' : ''}`);

    const technical = contentOpps.filter((o) => o.type === 'technical').length;
    if (technical > 0) plan.push(`Implement ${technical} technical optimization${technical > 1 ? 's' : ''}`);

    const medium = [...contentOpps, ...faqOpps, ...compOpps, ...defOpps].filter((o) => o.priority === 'medium').length;
    if (medium > 0) plan.push(`Review ${medium} medium-priority opportunities`);

    return plan;
}

/* ==================== HELPERS ==================== */

function sortByPriority(items) {
    const order = { high: 0, medium: 1, low: 2 };
    return items.sort((a, b) => (order[a.priority] || 2) - (order[b.priority] || 2));
}

function inferPageTitle(prompt, companyName) {
    const q = prompt.trim();
    if (q.toLowerCase().startsWith('what is') || q.toLowerCase().startsWith('what are')) {
        return q.charAt(0).toUpperCase() + q.slice(1);
    }
    if (q.toLowerCase().includes('best')) {
        return q.charAt(0).toUpperCase() + q.slice(1) + ` — ${companyName} Guide`;
    }
    if (q.toLowerCase().includes('how to') || q.toLowerCase().includes('how do')) {
        return q.charAt(0).toUpperCase() + q.slice(1);
    }
    return `${q} — Complete Guide`;
}

function inferPageType(prompt) {
    const q = prompt.toLowerCase();
    if (q.includes('what is') || q.includes('what are') || q.includes('define')) return 'definition';
    if (q.includes(' vs ') || q.includes('compare') || q.includes('difference')) return 'comparison';
    if (q.includes('best') || q.includes('top') || q.includes('recommend')) return 'decision';
    if (q.includes('how to') || q.includes('how do') || q.includes('guide')) return 'guide';
    return 'guide';
}

function getStructureForType(type) {
    const structures = {
        guide: ['Direct answer summary', 'Key concepts explained', 'Step-by-step guidance', 'Practical criteria', 'FAQ'],
        comparison: ['What each option is', 'Key differences table', 'Pros and cons', 'Best use cases', 'FAQ'],
        definition: ['One-sentence definition', 'Detailed explanation', 'Examples', 'Common confusion', 'FAQ'],
        decision: ['What to look for', 'Key criteria', 'Comparison table', 'Best for different needs', 'FAQ'],
        'use-case': ['Challenge', 'Solution', 'Results', 'Key takeaways'],
        faq: ['Direct answer', 'Short explanation', 'Related questions'],
        technical: ['Current state', 'What to implement', 'How to implement', 'Expected impact'],
    };
    return structures[type] || structures.guide;
}

function generateIndustryFaqPatterns(industry) {
    const i = industry.toLowerCase();
    return [
        {
            question: `What is the best ${i} solution for small businesses?`,
            keyword: 'best',
            reason: '"Best X for Y" is one of the most common AI question patterns.',
            priority: 'high',
        },
        {
            question: `How much does ${i} typically cost?`,
            keyword: 'cost',
            reason: 'Pricing questions are frequently asked to AI assistants.',
            priority: 'high',
        },
        {
            question: `What should I look for when choosing a ${i} provider?`,
            keyword: 'choose',
            reason: 'Decision-support questions drive high commercial intent.',
            priority: 'medium',
        },
        {
            question: `What are the main benefits of ${i}?`,
            keyword: 'benefits',
            reason: 'Benefits questions bridge educational and commercial intent.',
            priority: 'medium',
        },
        {
            question: `How does ${i} compare to alternatives?`,
            keyword: 'compare',
            reason: 'Comparison questions are growing in AI search patterns.',
            priority: 'medium',
        },
        {
            question: `What are common mistakes when using ${i}?`,
            keyword: 'mistakes',
            reason: 'Mistake-prevention content builds trust and authority.',
            priority: 'low',
        },
    ];
}
