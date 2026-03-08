import { runSecurityScan } from '@/lib/scanner';

export async function POST(req) {
    try {
        const { url } = await req.json();

        if (!url) {
            return Response.json({ error: 'URL is required' }, { status: 400 });
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
