/**
 * AI Answer Presence Tester
 *
 * Verifies whether a client's domain or pages appear in AI-generated answers.
 * Sends prompts to AI, analyzes responses for brand/domain mentions,
 * competitor mentions, and paraphrased references.
 */

import { callLLM, hasLLMProvider } from '../llm/index.js';

/* ==================== MAIN TESTER ==================== */

/**
 * Run a full presence test
 *
 * @param {object} params
 * @param {string} params.domain - Client domain (e.g. "prophot.com")
 * @param {string} params.companyName - Company/brand name
 * @param {string[]} params.trackedPages - Specific pages to look for
 * @param {string[]} params.prompts - Queries to test
 * @param {string[]} params.competitors - Competitor domains
 * @param {function} params.onProgress - Progress callback
 * @returns {object} Full presence test results
 */
export async function runPresenceTest({
    domain,
    companyName = '',
    trackedPages = [],
    prompts = [],
    competitors = [],
    onProgress = () => { },
}) {
    const startTime = Date.now();

    // Normalize domains
    const cleanDomain = normalizeDomain(domain);
    const brandTerms = extractBrandTerms(companyName, cleanDomain);
    const cleanCompetitors = competitors.filter(Boolean).map(normalizeDomain);

    const results = [];
    let totalMentions = 0;
    let totalCompetitorMentions = 0;

    for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        onProgress({
            phase: 'testing',
            current: i + 1,
            total: prompts.length,
            prompt,
            message: `Testing prompt ${i + 1}/${prompts.length}: "${prompt}"`,
        });

        const result = await testSinglePrompt({
            prompt,
            domain: cleanDomain,
            brandTerms,
            trackedPages,
            competitors: cleanCompetitors,
        });

        results.push(result);

        if (result.clientMentioned) totalMentions++;
        totalCompetitorMentions += result.competitorMentions.length;

        // Small delay between calls to avoid rate limiting
        if (i < prompts.length - 1) {
            await sleep(800);
        }
    }

    // Compute aggregate scores
    const presenceRate = prompts.length > 0
        ? Math.round((totalMentions / prompts.length) * 100)
        : 0;

    const avgPosition = results
        .filter((r) => r.clientMentioned && r.positionEstimate > 0)
        .reduce((sum, r, _, arr) => sum + r.positionEstimate / arr.length, 0) || 0;

    const competitorDomainCounts = {};
    for (const r of results) {
        for (const comp of r.competitorMentions) {
            competitorDomainCounts[comp] = (competitorDomainCounts[comp] || 0) + 1;
        }
    }

    // Build competitor leaderboard
    const competitorLeaderboard = Object.entries(competitorDomainCounts)
        .map(([domain, count]) => ({
            domain,
            mentions: count,
            presenceRate: Math.round((count / prompts.length) * 100),
        }))
        .sort((a, b) => b.mentions - a.mentions);

    // All mentioned domains across all prompts
    const allMentionedDomains = {};
    for (const r of results) {
        for (const d of r.mentionedDomains) {
            allMentionedDomains[d] = (allMentionedDomains[d] || 0) + 1;
        }
    }

    const domainLeaderboard = Object.entries(allMentionedDomains)
        .map(([domain, count]) => ({
            domain,
            mentions: count,
            isClient: domain === cleanDomain || brandTerms.includes(domain),
            isCompetitor: cleanCompetitors.includes(domain),
        }))
        .sort((a, b) => b.mentions - a.mentions);

    const duration = Date.now() - startTime;

    onProgress({
        phase: 'complete',
        message: `Presence test complete — ${presenceRate}% presence rate`,
    });

    return {
        // Metadata
        testId: generateId(),
        domain: cleanDomain,
        companyName,
        testedAt: new Date().toISOString(),
        duration,
        promptCount: prompts.length,

        // Aggregate scores
        presenceRate,
        totalMentions,
        avgPosition: Math.round(avgPosition * 10) / 10,

        // Per-prompt results
        results,

        // Competitor analysis
        competitorLeaderboard,
        totalCompetitorMentions,

        // Domain leaderboard
        domainLeaderboard,

        // Input data (for reference)
        trackedPages,
        competitors: cleanCompetitors,
        prompts,
    };
}

/* ==================== SINGLE PROMPT TEST ==================== */

async function testSinglePrompt({ prompt, domain, brandTerms, trackedPages, competitors }) {
    // 1. Send prompt to AI
    const aiResponse = await queryAI(prompt);

    if (!aiResponse) {
        return {
            prompt,
            response: '',
            clientMentioned: false,
            mentionedDomains: [],
            competitorMentions: [],
            trackedPagesMentioned: [],
            positionEstimate: 0,
            brandMentionType: null,
            confidence: 0,
        };
    }

    // 2. Analyze response
    const responseLower = aiResponse.toLowerCase();

    // 3. Detect client domain mentions
    const domainMention = detectDomainMention(responseLower, domain);
    const brandMention = detectBrandMentions(responseLower, brandTerms);
    const clientMentioned = domainMention.found || brandMention.found;

    // 4. Detect tracked page mentions
    const trackedPagesMentioned = trackedPages.filter((page) => {
        const cleanPage = normalizeDomain(page);
        return responseLower.includes(cleanPage) ||
            responseLower.includes(page.replace(/^https?:\/\//, ''));
    });

    // 5. Extract all mentioned domains
    const mentionedDomains = extractMentionedDomains(aiResponse);

    // 6. Detect competitor mentions
    const competitorMentions = competitors.filter((comp) =>
        responseLower.includes(comp) ||
        mentionedDomains.includes(comp)
    );

    // 7. Estimate position
    const positionEstimate = clientMentioned
        ? estimatePosition(aiResponse, domain, brandTerms)
        : 0;

    // 8. Determine mention type
    let brandMentionType = null;
    if (domainMention.found && brandMention.found) brandMentionType = 'domain+brand';
    else if (domainMention.found) brandMentionType = 'domain';
    else if (brandMention.found) brandMentionType = 'brand';

    // 9. Confidence score
    const confidence = clientMentioned
        ? (domainMention.found ? 0.9 : 0) + (brandMention.found ? 0.8 : 0) + (trackedPagesMentioned.length > 0 ? 0.95 : 0)
        : 0;

    return {
        prompt,
        response: aiResponse.substring(0, 2000), // Trim for storage
        clientMentioned,
        mentionedDomains,
        competitorMentions,
        trackedPagesMentioned,
        positionEstimate,
        brandMentionType,
        confidence: Math.min(1, confidence),
    };
}

/* ==================== AI QUERY ==================== */

async function queryAI(prompt) {
    if (!hasLLMProvider()) {
        console.warn('No LLM provider configured — using demo response');
        return null;
    }

    const systemInstructions = `You are a helpful AI assistant answering user questions.
When answering, if relevant, mention specific websites, brands, products, or services by name.
Include URL references when you know them. Be specific and cite sources when possible.
Answer naturally and comprehensively.`;

    try {
        return await callLLM(systemInstructions, `User question: ${prompt}`, {
            temperature: 0.8,
            maxTokens: 1500,
        });
    } catch (err) {
        console.error('AI query failed:', err.message);
        return null;
    }
}

/* ==================== DETECTION FUNCTIONS ==================== */

function detectDomainMention(text, domain) {
    // Exact domain match
    if (text.includes(domain)) {
        return { found: true, type: 'exact' };
    }

    // Check www. prefix
    if (text.includes(`www.${domain}`)) {
        return { found: true, type: 'www' };
    }

    // Check as URL part
    const urlPattern = new RegExp(`https?://[^\\s]*${escapeRegex(domain)}`, 'i');
    if (urlPattern.test(text)) {
        return { found: true, type: 'url' };
    }

    return { found: false, type: null };
}

function detectBrandMentions(text, brandTerms) {
    for (const term of brandTerms) {
        if (term.length < 3) continue; // Skip very short terms

        // Word boundary check
        const pattern = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i');
        if (pattern.test(text)) {
            return { found: true, term };
        }
    }
    return { found: false, term: null };
}

function extractMentionedDomains(text) {
    const domains = new Set();

    // Match explicit URLs
    const urlRegex = /https?:\/\/(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+)/g;
    let match;
    while ((match = urlRegex.exec(text)) !== null) {
        domains.add(match[1].toLowerCase());
    }

    // Match domain patterns (word.tld)
    const domainRegex = /\b([a-zA-Z0-9-]+\.(?:com|org|net|io|co|fr|de|uk|us|ca|au|app|dev|tech))\b/g;
    while ((match = domainRegex.exec(text)) !== null) {
        const d = match[1].toLowerCase();
        // Filter out common false positives
        if (!['e.g.', 'i.e.', 'etc.', 'vs.'].some((fp) => d.includes(fp))) {
            domains.add(d);
        }
    }

    return [...domains];
}

function estimatePosition(text, domain, brandTerms) {
    // Split response into sentences/chunks
    const sentences = text.split(/[.!?\n]+/).filter(Boolean);
    if (sentences.length === 0) return 0;

    // Find earliest mention position
    const searchTerms = [domain, ...brandTerms];
    let earliestPosition = sentences.length;

    for (let i = 0; i < sentences.length; i++) {
        const sentenceLower = sentences[i].toLowerCase();
        for (const term of searchTerms) {
            if (term.length >= 3 && sentenceLower.includes(term.toLowerCase())) {
                earliestPosition = Math.min(earliestPosition, i);
                break;
            }
        }
    }

    // Convert to a 1-based ranking estimate
    if (earliestPosition === 0) return 1; // First sentence
    if (earliestPosition <= 2) return 2;  // Top 3 sentences
    if (earliestPosition <= 5) return 3;  // Top quarter
    return Math.min(10, Math.ceil(earliestPosition / 2));
}

/* ==================== HELPERS ==================== */

function normalizeDomain(url) {
    if (!url) return '';
    return url
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '')
        .toLowerCase();
}

function extractBrandTerms(companyName, domain) {
    const terms = [];

    if (companyName) {
        terms.push(companyName.toLowerCase());
        // Also add without common suffixes
        const cleaned = companyName
            .replace(/\.(com|io|org|net|co|fr|de)$/i, '')
            .replace(/\s+(inc|ltd|llc|sarl|sas|gmbh)\.?$/i, '')
            .toLowerCase();
        if (cleaned !== companyName.toLowerCase()) terms.push(cleaned);
    }

    if (domain) {
        // Extract brand from domain
        const domainBrand = domain.split('.')[0];
        if (domainBrand && !terms.includes(domainBrand)) {
            terms.push(domainBrand);
        }
    }

    return terms.filter((t) => t.length >= 3);
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
