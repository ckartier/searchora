/**
 * Cluster Page Generator Engine
 *
 * Generates strategic topic clusters to improve AI answer visibility.
 * Each cluster contains: pillar page, supporting pages, internal linking plan,
 * publishing order, and AI answer value assessment.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

/* ==================== MAIN GENERATOR ==================== */

/**
 * Generate content clusters for a domain
 *
 * @param {object} params
 * @param {string} params.domain
 * @param {string} params.companyName
 * @param {string} params.industry
 * @param {string[]} params.themes - Strategic themes to cluster around
 * @param {string[]} params.trackedPrompts - User's tracked prompts
 * @param {string[]} params.contentGaps - Content gaps from audit
 * @param {string[]} params.faqOpportunities - FAQ opportunities
 * @param {string[]} params.comparisonOpportunities - Comparison page opportunities
 * @param {string[]} params.definitionOpportunities - Definition page opportunities
 * @param {string[]} params.competitorMentions - Domains competitors are winning
 * @param {object} params.auditData - Previous audit results
 * @returns {object} Full cluster generation result
 */
export async function generateClusters({
    domain,
    companyName = '',
    industry = '',
    themes = [],
    trackedPrompts = [],
    contentGaps = [],
    faqOpportunities = [],
    comparisonOpportunities = [],
    definitionOpportunities = [],
    competitorMentions = [],
    auditData = null,
}) {
    const startTime = Date.now();

    // If no themes provided, derive them from available data
    const derivedThemes = themes.length > 0
        ? themes
        : deriveThemes({ trackedPrompts, contentGaps, faqOpportunities, comparisonOpportunities, industry });

    if (derivedThemes.length === 0) {
        throw new Error('No themes provided or derivable. Please provide at least one strategic theme.');
    }

    // Build context for AI
    const context = buildContext({
        domain,
        companyName,
        industry,
        themes: derivedThemes,
        trackedPrompts,
        contentGaps,
        faqOpportunities,
        comparisonOpportunities,
        definitionOpportunities,
        competitorMentions,
        auditData,
    });

    // Generate clusters via AI
    const clusters = await generateClustersViaAI(context);

    const duration = Date.now() - startTime;

    return {
        companyName,
        website: domain,
        industry,
        generatedAt: new Date().toISOString(),
        duration,
        themeCount: derivedThemes.length,
        clusterCount: clusters.length,
        totalPages: clusters.reduce((sum, c) => sum + 1 + (c.supportingPages?.length || 0), 0),
        clusters,
        inputThemes: derivedThemes,
    };
}

/* ==================== THEME DERIVATION ==================== */

function deriveThemes({ trackedPrompts, contentGaps, faqOpportunities, comparisonOpportunities, industry }) {
    const themes = new Set();

    // Extract themes from tracked prompts
    for (const prompt of trackedPrompts) {
        const cleaned = prompt
            .replace(/\b(best|top|how to|what is|which|vs|versus|for|the|a|an|in|on|with|and|or)\b/gi, '')
            .trim();
        if (cleaned.length > 5) themes.add(cleaned.toLowerCase());
    }

    // Extract from content gaps
    for (const gap of contentGaps) {
        if (typeof gap === 'string' && gap.length > 5) themes.add(gap.toLowerCase());
    }

    // Extract from FAQ opportunities
    for (const faq of faqOpportunities) {
        const q = typeof faq === 'string' ? faq : faq?.question || '';
        if (q.length > 10) {
            const topic = q.replace(/\?$/, '').replace(/^(what|how|why|when|where|which|can|do|does|is|are)\s+/i, '').trim();
            if (topic.length > 5) themes.add(topic.toLowerCase());
        }
    }

    // From comparison opportunities
    for (const comp of comparisonOpportunities) {
        const title = typeof comp === 'string' ? comp : comp?.title || '';
        if (title.length > 5) themes.add(title.toLowerCase());
    }

    // Fallback: use industry as theme
    if (themes.size === 0 && industry) {
        themes.add(industry.toLowerCase());
    }

    return [...themes].slice(0, 8); // Max 8 themes
}

/* ==================== CONTEXT BUILDER ==================== */

function buildContext({ domain, companyName, industry, themes, trackedPrompts, contentGaps, faqOpportunities, comparisonOpportunities, definitionOpportunities, competitorMentions, auditData }) {
    let context = `Company: ${companyName || domain}\nWebsite: ${domain}\nIndustry: ${industry || 'general'}\n\n`;

    context += `STRATEGIC THEMES TO BUILD CLUSTERS AROUND:\n`;
    for (const t of themes) {
        context += `- ${t}\n`;
    }

    if (trackedPrompts.length > 0) {
        context += `\nTRACKED AI PROMPTS (queries users ask AI):\n`;
        for (const p of trackedPrompts.slice(0, 15)) context += `- ${p}\n`;
    }

    if (contentGaps.length > 0) {
        context += `\nCONTENT GAPS IDENTIFIED:\n`;
        for (const g of contentGaps.slice(0, 10)) context += `- ${typeof g === 'string' ? g : JSON.stringify(g)}\n`;
    }

    if (faqOpportunities.length > 0) {
        context += `\nFAQ OPPORTUNITIES:\n`;
        for (const f of faqOpportunities.slice(0, 10)) {
            const q = typeof f === 'string' ? f : f?.question || JSON.stringify(f);
            context += `- ${q}\n`;
        }
    }

    if (comparisonOpportunities.length > 0) {
        context += `\nCOMPARISON OPPORTUNITIES:\n`;
        for (const c of comparisonOpportunities.slice(0, 10)) {
            const t = typeof c === 'string' ? c : c?.title || JSON.stringify(c);
            context += `- ${t}\n`;
        }
    }

    if (definitionOpportunities.length > 0) {
        context += `\nDEFINITION OPPORTUNITIES:\n`;
        for (const d of definitionOpportunities.slice(0, 10)) {
            const t = typeof d === 'string' ? d : d?.term || JSON.stringify(d);
            context += `- ${t}\n`;
        }
    }

    if (competitorMentions.length > 0) {
        context += `\nCOMPETITOR DOMAINS WINNING IN AI ANSWERS:\n`;
        for (const m of competitorMentions.slice(0, 10)) context += `- ${m}\n`;
    }

    if (auditData) {
        context += `\nAUDIT SUMMARY:\n`;
        if (auditData.visibilityScore != null) context += `- AI Visibility Score: ${auditData.visibilityScore}%\n`;
        if (auditData.strengths?.length) context += `- Strengths: ${auditData.strengths.slice(0, 3).join(', ')}\n`;
        if (auditData.weaknesses?.length) context += `- Weaknesses: ${auditData.weaknesses.slice(0, 3).join(', ')}\n`;
    }

    return context;
}

/* ==================== AI CLUSTER GENERATION ==================== */

async function generateClustersViaAI(context) {
    if (!GEMINI_API_KEY) {
        console.warn('No API key — returning demo clusters');
        return getDemoClusters();
    }

    const systemPrompt = `You are a content strategist specializing in AI visibility optimization.
Your job is to generate strategic topic clusters for a website.

Each cluster focuses on ONE clear theme and contains:
1. A pillar page (the main comprehensive guide)
2. Supporting pages (guides, comparisons, definitions, FAQs, use-case, decision pages)
3. Internal linking plan
4. Recommended publishing order
5. AI answer value assessment

RULES:
- Each cluster must focus on one clear theme
- Pages must complement each other, not duplicate
- Each page must have a clear role and type
- Prioritize pages that support AI answer retrieval
- Include commercially relevant educational pages
- Page types: guide, comparison, definition, faq, use-case, decision
- Publishing order: pillar first, then definitions, then comparisons, then use-cases, then FAQ

Return ONLY valid JSON matching this exact structure:
{
  "clusters": [
    {
      "theme": "string",
      "priority": "high|medium|low",
      "reason": "why this theme matters strategically",
      "aiValue": "expected AI answer value",
      "commercialRelevance": "why commercially important",
      "pillarPage": {
        "title": "string",
        "type": "guide",
        "description": "brief description"
      },
      "supportingPages": [
        {
          "title": "string",
          "type": "guide|comparison|definition|faq|use-case|decision",
          "description": "brief description",
          "role": "why this page is needed"
        }
      ],
      "internalLinkingPlan": ["string"],
      "recommendedPublishingOrder": ["page title 1", "page title 2"]
    }
  ]
}

Generate 1 cluster per theme. Each cluster should have 4-7 supporting pages.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `${systemPrompt}\n\n--- CONTEXT ---\n${context}\n\nGenerate clusters now. Return ONLY the JSON object.` }],
                    }],
                    generationConfig: {
                        temperature: 0.6,
                        maxOutputTokens: 8000,
                        responseMimeType: 'application/json',
                    },
                }),
            }
        );

        if (!response.ok) {
            console.error('Gemini cluster generation error:', await response.text());
            return getDemoClusters();
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse JSON from response
        const parsed = JSON.parse(text);
        return parsed.clusters || [];
    } catch (err) {
        console.error('Cluster generation failed:', err.message);
        return getDemoClusters();
    }
}

/* ==================== DEMO FALLBACK ==================== */

function getDemoClusters() {
    return [{
        theme: 'getting started',
        priority: 'high',
        reason: 'Foundational content needed for topical authority.',
        aiValue: 'High — educational queries frequently answered by AI.',
        commercialRelevance: 'Introduces prospects to the brand.',
        pillarPage: { title: 'Complete Getting Started Guide', type: 'guide', description: 'Comprehensive beginner guide' },
        supportingPages: [
            { title: 'Key Terms Glossary', type: 'definition', description: 'Define industry terms', role: 'Establishes terminology authority' },
            { title: 'Frequently Asked Questions', type: 'faq', description: 'Answer common questions', role: 'Captures FAQ queries' },
            { title: 'Best Practices Guide', type: 'guide', description: 'Actionable tips', role: 'Provides practical value' },
        ],
        internalLinkingPlan: ['Link all pages to pillar', 'Definitions link to guides', 'FAQ links to all pages'],
        recommendedPublishingOrder: ['Complete Getting Started Guide', 'Key Terms Glossary', 'Frequently Asked Questions', 'Best Practices Guide'],
    }];
}

export default generateClusters;
