import { NextResponse } from 'next/server';
import { runPresenceTest } from '@/lib/presenceTester/index.js';

/**
 * POST /api/presence-test
 *
 * Run the AI Answer Presence Tester.
 * Tests whether a domain/brand appears in AI-generated answers.
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            domain,
            companyName = '',
            trackedPages = [],
            prompts = [],
            competitors = [],
            userId = null,
        } = body;

        if (!domain) {
            return NextResponse.json(
                { error: 'Domain is required' },
                { status: 400 }
            );
        }

        if (!prompts || prompts.length === 0) {
            return NextResponse.json(
                { error: 'At least one prompt is required' },
                { status: 400 }
            );
        }

        if (prompts.length > 20) {
            return NextResponse.json(
                { error: 'Maximum 20 prompts per test' },
                { status: 400 }
            );
        }

        const result = await runPresenceTest({
            domain,
            companyName,
            trackedPages: trackedPages.filter(Boolean),
            prompts: prompts.filter(Boolean),
            competitors: competitors.filter(Boolean),
        });

        return NextResponse.json({
            success: true,
            test: {
                ...result,
                userId,
            },
        });
    } catch (error) {
        console.error('Presence test API error:', error);
        return NextResponse.json(
            { error: 'Presence test failed: ' + (error.message || 'Unknown error') },
            { status: 500 }
        );
    }
}
