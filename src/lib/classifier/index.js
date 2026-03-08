/**
 * Page Type Classifier — classifies pages based on URL, headings, and content signals
 *
 * Categories:
 * homepage, category, product, service, guide, faq, comparison,
 * definition, blog, contact, about, pricing, other
 */

/**
 * Classify a page based on extracted data
 */
export function classifyPageType(pageData) {
    const scores = {
        homepage: 0,
        category: 0,
        product: 0,
        service: 0,
        guide: 0,
        faq: 0,
        comparison: 0,
        definition: 0,
        blog: 0,
        contact: 0,
        about: 0,
        pricing: 0,
        other: 0,
    };

    const url = (pageData.url || '').toLowerCase();
    const path = getPath(url);
    const title = (pageData.title || '').toLowerCase();
    const h1 = (pageData.h1 || '').toLowerCase();
    const h2s = (pageData.h2s || []).map((h) => h.toLowerCase());
    const text = (pageData.extractedText || '').toLowerCase().substring(0, 5000);

    // ==================== URL SIGNALS ====================
    if (path === '/' || path === '') scores.homepage += 10;

    // FAQ
    if (/\/(faq|frequently-asked|questions)/.test(path)) scores.faq += 8;

    // Blog / Article
    if (/\/(blog|article|news|post|journal|insights|resources\/blog)/.test(path)) scores.blog += 8;

    // Guide / How-to
    if (/\/(guide|tutorial|how-to|howto|learn|academy|knowledge)/.test(path)) scores.guide += 8;

    // Category
    if (/\/(category|categories|collection|collections|shop|store)/.test(path)) scores.category += 6;

    // Product
    if (/\/(product|products|item|p\/)/.test(path)) scores.product += 6;

    // Service
    if (/\/(service|services|solution|solutions|offering)/.test(path)) scores.service += 6;

    // Contact
    if (/\/(contact|get-in-touch|reach-us|support)/.test(path)) scores.contact += 8;

    // About
    if (/\/(about|about-us|team|our-story|who-we-are)/.test(path)) scores.about += 8;

    // Pricing
    if (/\/(pricing|plans|prices|tarif|packages)/.test(path)) scores.pricing += 8;

    // Comparison
    if (/\/(compare|comparison|vs|versus|alternatives)/.test(path)) scores.comparison += 8;

    // Definition / Glossary
    if (/\/(glossary|definition|terms|dictionary|wiki)/.test(path)) scores.definition += 8;

    // ==================== TITLE & H1 SIGNALS ====================

    // FAQ signals
    if (/faq|frequently asked|questions/i.test(title + h1)) scores.faq += 6;

    // Blog signals
    if (/blog|article|news|insight|update/i.test(title)) scores.blog += 4;

    // Guide signals
    if (/guide|tutorial|how to|step by step|introduction to|beginner|complete guide/i.test(title + h1)) scores.guide += 6;

    // Comparison signals
    if (/\bvs\.?\b|\bversus\b|\bcompare|comparison|alternatives?\b/i.test(title + h1)) scores.comparison += 7;
    if (/\bbest\s+\w+\s+(for|of|in)\b/i.test(title + h1)) scores.comparison += 4;

    // Definition signals
    if (/^what is\b|^definition|^meaning of|glossary/i.test(h1)) scores.definition += 7;

    // Contact signals
    if (/contact|get in touch|reach|talk to us/i.test(title + h1)) scores.contact += 5;

    // About signals
    if (/about us|our story|who we are|our team|our mission/i.test(title + h1)) scores.about += 5;

    // Pricing signals
    if (/pricing|plans|prices|packages|tarif/i.test(title + h1)) scores.pricing += 5;

    // Service signals
    if (/service|solution|what we do|what we offer|our offering/i.test(title + h1)) scores.service += 4;

    // Product signals
    if (/product|feature|specification/i.test(title + h1)) scores.product += 4;

    // ==================== CONTENT STRUCTURE SIGNALS ====================

    // FAQ from content
    if (pageData.hasFAQ) scores.faq += 5;
    if ((pageData.faqData?.questionCount || 0) >= 5) scores.faq += 3;

    // Comparison
    if (pageData.hasComparison) scores.comparison += 5;

    // Definition
    if (pageData.hasDefinitions) scores.definition += 5;

    // How-to suggests guide
    if (pageData.hasHowTo) scores.guide += 4;

    // ==================== CONTENT PATTERN SIGNALS ====================

    // Heavy commercial language suggests product/service
    const commercialWords = (text.match(/\b(buy|purchase|order|price|offer|discount|deal|sale|shipping|delivery|add to cart|checkout)\b/ig) || []).length;
    if (commercialWords > 5) {
        scores.product += 3;
        scores.service += 2;
    }

    // Educational language suggests guide
    const educationalWords = (text.match(/\b(learn|understand|explain|example|step|tip|trick|best practice|beginner|advanced)\b/ig) || []).length;
    if (educationalWords > 5) scores.guide += 3;

    // ==================== WORD COUNT SIGNALS ====================

    // Long content is more likely guide/blog
    if (pageData.wordCount > 1500) {
        scores.guide += 2;
        scores.blog += 2;
    }

    // Very short content is less likely guide
    if (pageData.wordCount < 200) {
        scores.guide -= 3;
        scores.blog -= 3;
    }

    // ==================== DETERMINE WINNER ====================

    let best = 'other';
    let bestScore = 0;

    for (const [type, score] of Object.entries(scores)) {
        if (score > bestScore) {
            bestScore = score;
            best = type;
        }
    }

    // Confidence level
    let confidence = 'low';
    if (bestScore >= 10) confidence = 'high';
    else if (bestScore >= 6) confidence = 'medium';

    return {
        pageType: best,
        confidence,
        score: bestScore,
        allScores: scores,
    };
}

/**
 * Batch classify multiple pages and build breakdown
 */
export function buildPageTypeBreakdown(classifiedPages) {
    const breakdown = {};

    for (const page of classifiedPages) {
        const type = page.pageType || 'other';
        breakdown[type] = (breakdown[type] || 0) + 1;
    }

    return breakdown;
}

/* ==================== Helpers ==================== */

function getPath(url) {
    try {
        return new URL(url).pathname.replace(/\/$/, '') || '/';
    } catch {
        return url;
    }
}
