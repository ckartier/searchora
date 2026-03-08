/**
 * AI Prompt Builder — constructs structured prompts for the Searchora AI engine
 *
 * All prompts enforce JSON output format for clean UI rendering.
 */

/**
 * System prompt for the Searchora AI engine
 */
export const SYSTEM_PROMPT = `You are an AI visibility strategist for Searchora.

Your role:
- Analyze business websites for discoverability in AI-generated answers (ChatGPT, Gemini, Copilot, Perplexity)
- Provide clear, actionable recommendations for business owners
- Prioritize clarity, structured content, educational usefulness, and answerability
- Write for business users, not developers

Rules:
- Be specific and data-driven — reference actual pages, metrics, and content
- Prioritize recommendations by impact (high/medium/low)
- Use clear, non-technical business language
- Never produce generic SEO advice or vague "improve content quality" recommendations
- Every recommendation must be actionable with a clear next step
- Outputs must be realistic enough for paying B2B clients

Always respond with valid JSON matching the requested structure.`;

/**
 * Build the full audit prompt from crawl data
 */
export function buildAuditPrompt(auditInput) {
    const {
        companyName,
        website,
        industry,
        competitors,
        country,
        totalPages,
        pageTypes,
        siteScore,
        siteSignals,
        contentGaps,
        topPages,
        weakPages,
        existingFAQs,
    } = auditInput;

    return `Analyze this website and generate a complete AI visibility audit.

COMPANY: ${companyName || 'Unknown'}
WEBSITE: ${website}
INDUSTRY: ${industry || 'General'}
COUNTRY: ${country || 'Global'}
COMPETITORS: ${competitors?.join(', ') || 'None specified'}

CRAWL DATA:
- Pages analyzed: ${totalPages}
- Page types: ${JSON.stringify(pageTypes || {})}
- Current visibility score: ${siteScore}/100

SITE SIGNALS:
- Educational content: ${siteSignals?.hasEducationalContent ? 'Yes' : 'No'}
- FAQ coverage: ${siteSignals?.hasFaqCoverage ? 'Yes' : 'No'} (${siteSignals?.faqPages || 0} pages)
- Comparison content: ${siteSignals?.hasComparisons ? 'Yes' : 'No'}
- Definition/glossary: ${siteSignals?.hasDefinitions ? 'Yes' : 'No'}
- How-to content: ${siteSignals?.hasHowTo ? 'Yes' : 'No'}
- Content mostly commercial: ${siteSignals?.contentMostlyCommercial ? 'Yes' : 'No'}
- Avg words per page: ${siteSignals?.avgWordCount || 0}
- Schema adoption: ${siteSignals?.schemaAdoption || 0}%
- Meta description coverage: ${siteSignals?.metaDescriptionCoverage || 0}%
- Informational content ratio: ${siteSignals?.informationalRatio || 0}%

CONTENT GAPS:
${contentGaps?.map((g) => `- [${g.severity}] ${g.title}: ${g.action}`).join('\n') || 'None detected'}

TOP PAGES (highest AI-readiness):
${topPages?.slice(0, 10).map((p) => `- ${p.url} | type: ${p.pageType} | score: ${p.pageScore}/100 | words: ${p.wordCount}${p.hasFAQ ? ' | FAQ' : ''}${p.hasSchema ? ' | Schema' : ''}`).join('\n') || 'None'}

WEAKEST PAGES:
${weakPages?.slice(0, 8).map((p) => `- ${p.url} | type: ${p.pageType} | score: ${p.pageScore}/100 | words: ${p.wordCount}`).join('\n') || 'None'}

EXISTING FAQ QUESTIONS ON SITE:
${existingFAQs?.slice(0, 10).join('\n') || 'None found'}

Return your analysis as JSON with this exact structure:
{
  "summary": "2-3 sentence executive summary of the site's AI visibility status",
  "strengths": ["list of 3-5 specific strengths based on real data"],
  "weaknesses": ["list of 3-5 specific weaknesses based on real data"],
  "opportunities": ["list of 4-6 content opportunities"],
  "subScores": {
    "contentClarity": 0-100,
    "faqCoverage": 0-100,
    "structuredAnswerReadiness": 0-100,
    "topicalAuthority": 0-100,
    "comparisonContent": 0-100,
    "educationalDepth": 0-100,
    "technicalReadiness": 0-100
  },
  "scoreExplanation": "1-2 sentences explaining the score and fastest path to improvement",
  "recommendations": [
    {"title": "specific action", "priority": "high|medium|low", "impact": "expected improvement", "details": "why this matters", "category": "content|technical|structure"}
  ],
  "suggestedPages": [
    {"title": "page title to create", "type": "guide|faq|comparison|definition|use-case|product-education", "reason": "why this page matters for AI visibility", "priority": "high|medium|low"}
  ],
  "faqSuggestions": ["list of 8-12 specific FAQ questions relevant to this business"],
  "competitorAnalysis": [
    {"competitor": "domain", "advantage": "what they do better", "gap": "what the client is missing"}
  ],
  "priorityActions": [
    {"action": "specific next step", "expectedImpact": "expected result", "timeframe": "estimated time"}
  ],
  "executiveReport": "3-5 sentence executive summary suitable for client presentation"
}`;
}

/**
 * Build prompt for FAQ suggestion generation
 */
export function buildFaqPrompt(companyName, industry, website, existingFaqs = []) {
    return `Generate 15 specific FAQ questions for ${companyName} (${website}) in the ${industry} industry.

These FAQs should:
- Be questions real customers would ask
- Be questions AI tools frequently encounter
- Cover: product/service details, pricing, comparisons, how-to, getting started
- NOT duplicate existing FAQs: ${existingFaqs.join(', ') || 'none'}
- Be specific to ${industry}, not generic

Return JSON: {"questions": ["question1", "question2", ...]}`;
}

/**
 * Build prompt for suggested page generation
 */
export function buildSuggestedPagesPrompt(companyName, industry, pageTypes, contentGaps) {
    return `Generate 10 specific page suggestions for ${companyName} in ${industry}.

Current page types on site: ${JSON.stringify(pageTypes || {})}
Content gaps: ${contentGaps?.map((g) => g.title).join(', ') || 'none detected'}

Each suggestion must include a specific title, page type, and business reason.
Types: guide, faq, comparison, definition, use-case, product-education

Return JSON:
{"pages": [{"title": "specific title", "type": "type", "reason": "why", "priority": "high|medium|low"}]}`;
}

/**
 * Build prompt for competitor comparison
 */
export function buildCompetitorPrompt(companyName, website, competitors, industry) {
    return `Compare ${companyName} (${website}) against these competitors in the ${industry} industry for AI visibility:
${competitors.map((c) => `- ${c}`).join('\n')}

For each competitor, identify:
- What they do better for AI visibility
- What the client is missing compared to them
- Specific content gaps

Return JSON:
{"competitors": [{"competitor": "domain", "advantage": "specific advantage", "gap": "specific gap for client"}]}`;
}

/**
 * Build prompt for executive report
 */
export function buildReportPrompt(auditData) {
    return `Write a brief executive report for ${auditData.companyName} based on their AI visibility audit.

Score: ${auditData.visibilityScore}/100
Strengths: ${auditData.strengths?.join(', ')}
Weaknesses: ${auditData.weaknesses?.join(', ')}
Key gaps: ${auditData.contentGaps?.map((g) => g.title).join(', ')}

Write 4-5 sentences suitable for a C-level executive. Be direct, specific, and actionable.
Do not use technical jargon.

Return JSON: {"report": "executive summary text", "biggestIssue": "one sentence", "bestOpportunity": "one sentence", "recommendedNextSteps": ["step1", "step2", "step3"]}`;
}
