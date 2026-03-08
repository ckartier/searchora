import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

/**
 * POST /api/generate-content
 * Generate AI-optimized content using Gemini
 */
export async function POST(request) {
    try {
        const { prompt, topic, contentType, companyName, industry } = await request.json();

        if (!prompt || !topic) {
            return NextResponse.json({ error: 'Topic and prompt are required' }, { status: 400 });
        }

        if (!GEMINI_API_KEY) {
            return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are an expert content strategist specializing in creating content optimized for AI citation and retrieval.
Your content should be structured with clear headings, answer-first formatting, and factual language that AI tools prefer to cite.

${prompt}`
                        }],
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 4000,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error('Gemini content generation error:', JSON.stringify(errData));
            const msg = errData?.error?.message || 'Content generation failed';
            return NextResponse.json({ error: msg }, { status: 500 });
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

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
