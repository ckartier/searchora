import { requireAuth } from '@/lib/server/verifyAuth.js';
import { NextResponse } from 'next/server';

/**
 * General AI API Route
 * Handles various AI-powered features:
 * - Content recommendations
 * - FAQ suggestions
 * - Competitor analysis
 * - Brief report generation
 * 
 * Uses environment variables for API keys (never exposed to frontend).
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'demo';

async function callLLM(systemPrompt, userPrompt) {
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
                temperature: 0.7,
                max_tokens: 1500,
            }),
        });

        if (!response.ok) throw new Error('LLM API error');
        const data = await response.json();
        return data.choices[0].message.content;
    }

    // Demo responses
    return null;
}

const handlers = {
    'content-recommendations': async (data) => {
        const llmResponse = await callLLM(
            'You are a content strategist specializing in AI visibility and GEO.',
            `Generate 5 content recommendations for ${data.companyName} in the ${data.industry} industry to improve AI visibility.`
        );

        return llmResponse || {
            recommendations: [
                { title: 'Create a comprehensive industry FAQ hub', type: 'page', priority: 'high' },
                { title: 'Publish monthly "State of the Industry" reports', type: 'blog', priority: 'high' },
                { title: 'Build a comparison guide vs top alternatives', type: 'page', priority: 'medium' },
                { title: 'Create video tutorials with full transcripts', type: 'content', priority: 'medium' },
                { title: 'Develop a glossary of industry terms', type: 'page', priority: 'low' },
            ],
        };
    },

    'faq-suggestions': async (data) => {
        const llmResponse = await callLLM(
            'You are an SEO expert focused on AI-generated answers.',
            `Suggest 10 FAQ questions that ${data.companyName} should answer on their website to appear in AI-generated responses for the ${data.industry} industry.`
        );

        return llmResponse || {
            questions: [
                `What is the best ${data.industry?.toLowerCase() || 'solution'} for small businesses?`,
                `How much does a ${data.industry?.toLowerCase() || 'typical solution'} cost?`,
                `What features should I look for in a ${data.industry?.toLowerCase() || 'product'}?`,
                `How do I get started with ${data.companyName}?`,
                `What are the alternatives to ${data.companyName}?`,
                'How long does implementation take?',
                'Is there a free trial available?',
                'What integrations are supported?',
                'How does pricing work for teams?',
                'What support options are available?',
            ],
        };
    },

    'competitor-analysis': async (data) => {
        const llmResponse = await callLLM(
            'You are a competitive intelligence analyst specializing in AI visibility.',
            `Analyze the competitive landscape for ${data.companyName} against ${data.competitors?.join(', ')} in the ${data.industry} industry.`
        );

        return llmResponse || {
            insights: [
                { finding: 'Competitor A has 3x more structured FAQ content', impact: 'high' },
                { finding: 'Competitor B ranks in 60% more AI prompts', impact: 'high' },
                { finding: 'Your brand is missing from pricing comparison queries', impact: 'medium' },
                { finding: 'Competitors have stronger entity signals on About pages', impact: 'medium' },
            ],
        };
    },

    'brief-report': async (data) => {
        const llmResponse = await callLLM(
            'You are an AI visibility consultant. Generate clear, professional reports.',
            `Generate a brief executive report for ${data.companyName} regarding their AI visibility status. Score: ${data.score}%. Citations: ${data.citations}.`
        );

        return llmResponse || {
            title: `AI Visibility Report — ${data.companyName}`,
            summary: `${data.companyName} currently achieves a ${data.score || 42}% AI visibility score with ${data.citations || 8} citations across major AI platforms. This places the brand in the moderate visibility category with significant improvement opportunities.`,
            keyFindings: [
                'Brand appears in 16% of relevant AI prompts',
                'Content structure is not optimized for AI retrieval',
                'Competitor visibility is 30-50% higher on average',
                'Missing structured data on 85% of key pages',
            ],
        };
    },
};

export async function POST(request) {
    const auth = await requireAuth(request, { maxRequests: 60, windowMs: 60 * 60 * 1000 });
    if (auth.response) return auth.response;
    try {
        const { action, data } = await request.json();

        if (!action || !handlers[action]) {
            return NextResponse.json(
                { error: 'Invalid action. Supported: ' + Object.keys(handlers).join(', ') },
                { status: 400 }
            );
        }

        const result = await handlers[action](data || {});

        return NextResponse.json({
            success: true,
            result,
            provider: LLM_PROVIDER,
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('AI API error:', error);
        return NextResponse.json(
            { error: 'Failed to process AI request' },
            { status: 500 }
        );
    }
}
