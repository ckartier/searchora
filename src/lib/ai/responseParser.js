/**
 * AI Response Parser — safely extracts structured JSON from LLM responses
 */

/**
 * Parse a JSON response from an LLM, handling markdown code blocks
 */
export function parseJsonResponse(rawResponse) {
    if (!rawResponse) return null;

    // If it's already an object, return it
    if (typeof rawResponse === 'object') return rawResponse;

    let text = rawResponse.trim();

    // Try: extract JSON from markdown code fence
    const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fencedMatch) {
        try {
            return JSON.parse(fencedMatch[1].trim());
        } catch { }
    }

    // Try: direct JSON parse
    try {
        return JSON.parse(text);
    } catch { }

    // Try: find first { ... } block
    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) {
        try {
            return JSON.parse(braceMatch[0]);
        } catch { }
    }

    // Try: find first [ ... ] block
    const bracketMatch = text.match(/\[[\s\S]*\]/);
    if (bracketMatch) {
        try {
            return JSON.parse(bracketMatch[0]);
        } catch { }
    }

    // Failed to parse
    return null;
}

/**
 * Validate and fill defaults for audit output
 */
export function validateAuditOutput(parsed, defaults = {}) {
    if (!parsed) return defaults;

    return {
        summary: parsed.summary || defaults.summary || '',
        strengths: ensureArray(parsed.strengths, defaults.strengths),
        weaknesses: ensureArray(parsed.weaknesses, defaults.weaknesses),
        opportunities: ensureArray(parsed.opportunities, defaults.opportunities),
        subScores: {
            contentClarity: clampScore(parsed.subScores?.contentClarity),
            faqCoverage: clampScore(parsed.subScores?.faqCoverage),
            structuredAnswerReadiness: clampScore(parsed.subScores?.structuredAnswerReadiness),
            topicalAuthority: clampScore(parsed.subScores?.topicalAuthority),
            comparisonContent: clampScore(parsed.subScores?.comparisonContent),
            educationalDepth: clampScore(parsed.subScores?.educationalDepth),
            technicalReadiness: clampScore(parsed.subScores?.technicalReadiness),
        },
        scoreExplanation: parsed.scoreExplanation || defaults.scoreExplanation || '',
        recommendations: ensureArray(parsed.recommendations, defaults.recommendations),
        suggestedPages: ensureArray(parsed.suggestedPages, defaults.suggestedPages),
        faqSuggestions: ensureArray(parsed.faqSuggestions, defaults.faqSuggestions),
        competitorAnalysis: ensureArray(parsed.competitorAnalysis, defaults.competitorAnalysis),
        priorityActions: ensureArray(parsed.priorityActions, defaults.priorityActions),
        executiveReport: parsed.executiveReport || defaults.executiveReport || '',
    };
}

/**
 * Validate FAQ output
 */
export function validateFaqOutput(parsed) {
    if (!parsed) return { questions: [] };
    return {
        questions: ensureArray(parsed.questions),
    };
}

/**
 * Validate suggested pages output
 */
export function validatePagesOutput(parsed) {
    if (!parsed) return { pages: [] };
    return {
        pages: ensureArray(parsed.pages).map((p) => ({
            title: p.title || 'Untitled',
            type: p.type || 'guide',
            reason: p.reason || '',
            priority: p.priority || 'medium',
        })),
    };
}

/**
 * Validate competitor output
 */
export function validateCompetitorOutput(parsed) {
    if (!parsed) return { competitors: [] };
    return {
        competitors: ensureArray(parsed.competitors).map((c) => ({
            competitor: c.competitor || c.domain || 'Unknown',
            advantage: c.advantage || '',
            gap: c.gap || '',
        })),
    };
}

/**
 * Validate report output
 */
export function validateReportOutput(parsed) {
    if (!parsed) return { report: '', biggestIssue: '', bestOpportunity: '', recommendedNextSteps: [] };
    return {
        report: parsed.report || '',
        biggestIssue: parsed.biggestIssue || '',
        bestOpportunity: parsed.bestOpportunity || '',
        recommendedNextSteps: ensureArray(parsed.recommendedNextSteps),
    };
}

/* ==================== Helpers ==================== */

function ensureArray(val, fallback = []) {
    if (Array.isArray(val) && val.length > 0) return val;
    if (Array.isArray(fallback)) return fallback;
    return [];
}

function clampScore(val) {
    if (typeof val !== 'number' || isNaN(val)) return 0;
    return Math.max(0, Math.min(100, Math.round(val)));
}
