import { requireAuth } from '@/lib/server/verifyAuth.js';
import { runSecurityScan } from '@/lib/scanner';
import { assertSafePublicUrl } from '@/lib/security/urlSafety';

export async function POST(request) {
    const auth = await requireAuth(request, { maxRequests: 10, windowMs: 60 * 60 * 1000 });
    if (auth.response) return auth.response;
    try {
        const { url } = await request.json();

        if (!url) {
            return Response.json({ error: 'URL is required' }, { status: 400 });
        }
        try {
            await assertSafePublicUrl(url.startsWith('http') ? url : `https://${url}`);
        } catch {
            return Response.json({ error: 'Invalid or restricted URL' }, { status: 400 });
        }

        const results = await runSecurityScan(url);

        return Response.json(results);
    } catch (err) {
        console.error('Security scan error:', err);
        return Response.json(
            { error: 'Security scan failed', message: err.message },
            { status: 500 }
        );
    }
}
