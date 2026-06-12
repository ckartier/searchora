'use client';

// Authenticated fetch for internal API routes: attaches the current user's
// Firebase ID token so the server can verify identity.

import { auth } from './firebase';

export async function authFetch(url, options = {}) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('You must be signed in to perform this action.');
    }
    const token = await user.getIdToken();
    return fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
        },
    });
}
