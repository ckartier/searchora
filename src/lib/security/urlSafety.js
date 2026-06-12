import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const MAX_REDIRECTS = 5;

function isPrivateIpv4(address) {
    const [a, b] = address.split('.').map(Number);
    return (
        a === 0 ||
        a === 10 ||
        a === 127 ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        a >= 224
    );
}

function isPrivateIpv6(address) {
    const normalized = address.toLowerCase();
    return (
        normalized === '::' ||
        normalized === '::1' ||
        normalized.startsWith('fc') ||
        normalized.startsWith('fd') ||
        normalized.startsWith('fe8') ||
        normalized.startsWith('fe9') ||
        normalized.startsWith('fea') ||
        normalized.startsWith('feb') ||
        normalized.startsWith('::ffff:127.') ||
        normalized.startsWith('::ffff:10.') ||
        normalized.startsWith('::ffff:192.168.')
    );
}

function isPrivateAddress(address) {
    const version = isIP(address);
    return version === 4 ? isPrivateIpv4(address) : version === 6 ? isPrivateIpv6(address) : true;
}

export async function assertSafePublicUrl(rawUrl) {
    const url = new URL(rawUrl);

    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are allowed');
    }
    if (url.username || url.password) {
        throw new Error('URLs with credentials are not allowed');
    }
    if (url.hostname === 'localhost' || url.hostname.endsWith('.localhost')) {
        throw new Error('Local network URLs are not allowed');
    }

    const addresses = await lookup(url.hostname, { all: true, verbatim: true });
    if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
        throw new Error('Local network URLs are not allowed');
    }

    return url;
}

export async function safeFetch(rawUrl, options = {}) {
    let currentUrl = (await assertSafePublicUrl(rawUrl)).toString();
    const { redirect = 'follow', ...fetchOptions } = options;

    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
        const response = await fetch(currentUrl, { ...fetchOptions, redirect: 'manual' });

        if (redirect === 'manual' || ![301, 302, 303, 307, 308].includes(response.status)) {
            return response;
        }

        const location = response.headers.get('location');
        if (!location || redirectCount === MAX_REDIRECTS) {
            throw new Error('Too many redirects');
        }

        currentUrl = (await assertSafePublicUrl(new URL(location, currentUrl).toString())).toString();
    }
}
