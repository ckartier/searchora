// Server-side Firebase auth verification + in-memory rate limiting for API routes.
// Tokens are verified against the Identity Toolkit accounts:lookup endpoint,
// which validates signature, expiry, and audience without needing admin credentials.

import { NextResponse } from 'next/server';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export async function verifyIdToken(request) {
    const header = request.headers.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token || !FIREBASE_API_KEY) return null;

    try {
        const resp = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: token }),
            }
        );
        if (!resp.ok) return null;
        const data = await resp.json();
        const account = data.users?.[0];
        if (!account?.localId || account.disabled) return null;
        return { uid: account.localId, email: account.email || null };
    } catch {
        return null;
    }
}

// Fixed-window in-memory rate limiter. Per-instance only, which is enough to
// stop abuse of the expensive LLM/crawl routes behind it.
const buckets = new Map();

export function isRateLimited(key, maxRequests, windowMs) {
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || now - bucket.start >= windowMs) {
        buckets.set(key, { start: now, count: 1 });
        if (buckets.size > 10000) {
            for (const [k, v] of buckets) {
                if (now - v.start >= windowMs) buckets.delete(k);
            }
        }
        return false;
    }
    bucket.count += 1;
    return bucket.count > maxRequests;
}

/**
 * Guard for API routes: returns { user } when the request carries a valid
 * Firebase ID token and is under the rate limit, otherwise { response } with
 * the 401/429 to return as-is.
 */
export async function requireAuth(request, { maxRequests = 20, windowMs = 60 * 60 * 1000 } = {}) {
    const user = await verifyIdToken(request);
    if (!user) {
        return {
            response: NextResponse.json(
                { error: 'Authentication required. Sign in and retry.' },
                { status: 401 }
            ),
        };
    }
    if (isRateLimited(user.uid, maxRequests, windowMs)) {
        return {
            response: NextResponse.json(
                { error: 'Rate limit exceeded. Try again later.' },
                { status: 429 }
            ),
        };
    }
    return { user };
}
