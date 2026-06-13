import { requireAuth } from '@/lib/server/verifyAuth.js';
import { NextResponse } from 'next/server';
import { callLLM, hasLLMProvider } from '@/lib/llm/index.js';
import { buildGeoPack, auditToSource } from '@/lib/geoPack/index.js';
import { createZip } from '@/lib/geoPack/zip.js';

/**
 * POST /api/geo-pack
 * Build the downloadable Searchora GEO Pack (llms.txt, schema, head/FAQ HTML,
 * install guide, report) from an audit and return it as a .zip.
 *
 * Body: { audit: <audit result or Firestore doc> }
 */
export async function POST(request) {
    const auth = await requireAuth(request, { maxRequests: 20, windowMs: 60 * 60 * 1000 });
    if (auth.response) return auth.response;

    let audit;
    try {
        ({ audit } = await request.json());
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!audit || (!audit.website && !audit.company?.url)) {
        return NextResponse.json({ error: 'An audit with a website is required' }, { status: 400 });
    }

    try {
        // FAQ answers are not stored with the audit (only questions). Enrich them
        // with the LLM when a provider is available; degrade gracefully otherwise.
        const faqPairs = await enrichFaq(audit);

        const source = auditToSource(audit, faqPairs);
        const { audit: cleaned, files } = buildGeoPack(source);
        const zip = createZip(files);

        const slug = (cleaned.company.name || 'searchora')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'searchora';

        return new NextResponse(zip, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${slug}-geo-pack.zip"`,
                'Content-Length': String(zip.length),
                'Cache-Control': 'no-store',
            },
        });
    } catch (err) {
        return NextResponse.json(
            { error: err?.message || 'Failed to build GEO pack' },
            { status: 500 }
        );
    }
}

/**
 * Turn the audit's FAQ questions into {question, answer} pairs via the LLM.
 * Best-effort: returns [] if no provider, no questions, or the call/parse fails,
 * in which case the pack simply ships without an FAQ section.
 */
async function enrichFaq(audit) {
    const questions = (audit.faqSuggestions || [])
        .filter((q) => typeof q === 'string' && q.trim())
        .slice(0, 12);

    if (questions.length === 0 || !hasLLMProvider()) return [];

    const system = 'You are an expert content writer. Answer FAQ questions concisely and factually for AI citation. Each answer is 1-2 sentences, no marketing fluff.';
    const user = `Company: ${audit.companyName || 'the company'}${audit.industry ? ` (${audit.industry})` : ''}.
Website: ${audit.website || ''}.
Write a short, factual answer for each question below.
Return JSON only: {"faq":[{"question":"...","answer":"..."}]}

Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;

    try {
        const raw = await callLLM(system, user, { temperature: 0.4, maxTokens: 1500, json: true });
        if (!raw) return [];
        const parsed = JSON.parse(stripCodeFence(raw));
        const list = Array.isArray(parsed?.faq) ? parsed.faq : [];
        return list
            .map((f) => ({
                question: typeof f?.question === 'string' ? f.question.trim() : '',
                answer: typeof f?.answer === 'string' ? f.answer.trim() : '',
            }))
            .filter((f) => f.question && f.answer)
            .slice(0, 12);
    } catch {
        return [];
    }
}

function stripCodeFence(text) {
    return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
}
