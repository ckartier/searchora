import { requireAuth } from '@/lib/server/verifyAuth.js';
import { NextResponse } from 'next/server';
import { callLLM, hasLLMProvider } from '@/lib/llm/index.js';

/**
 * POST /api/generate-content
 * Generate AI-optimized content using the configured LLM provider chain.
 */
export async function POST(request) {
    const auth = await requireAuth(request, { maxRequests: 30, windowMs: 60 * 60 * 1000 });
    if (auth.response) return auth.response;
    try {
        const { prompt, topic, contentType } = await request.json();

        if (!prompt || !topic) {
            return NextResponse.json({ error: 'Topic and prompt are required' }, { status: 400 });
        }

        if (!hasLLMProvider()) {
            return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
        }

        const content = await callLLM(
            `You are an expert content strategist specializing in creating content optimized for AI citation and retrieval.
Your content should be structured with clear headings, answer-first formatting, and factual language that AI tools prefer to cite.`,
            prompt,
            { temperature: 0.7, maxTokens: 4000 }
        );

        if (!content) {
            return NextResponse.json({ error: 'Content generation failed' }, { status: 502 });
        }

        return NextResponse.json({
            success: true,
            content,
            topic,
            contentType,
            wordCount: content.split(/\s+/).length,
        });
    } catch (error) {
        console.error('Content generation error:', error);
        return NextResponse.json(
            { error: 'Content generation failed: ' + (error.message || 'Unknown error') },
            { status: 500 }
        );
    }
}
