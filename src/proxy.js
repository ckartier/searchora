import { NextResponse } from 'next/server';
import { LOCALES, DEFAULT_LOCALE, PREFIXED_LOCALES } from '@/lib/i18n/routing';

const LOCALE_HEADER = 'x-searchora-locale';
const PATH_HEADER = 'x-searchora-path';

// Le proxy ne s'exécute que sur les routes publiques localisables.
// Tout le reste (api, dashboard, assets, fichiers) est exclu par le matcher.
export function proxy(request) {
    const { pathname } = request.nextUrl;
    const segments = pathname.split('/').filter(Boolean);
    const first = segments[0];

    // /en/* explicite : canonique = racine non préfixée → redirige (308).
    if (first === DEFAULT_LOCALE) {
        const stripped = '/' + segments.slice(1).join('/');
        const url = request.nextUrl.clone();
        url.pathname = stripped === '/' ? '/' : stripped;
        return NextResponse.redirect(url, 308);
    }

    let locale = DEFAULT_LOCALE;
    let barePath = pathname;
    let rewriteTo = null;

    if (PREFIXED_LOCALES.includes(first)) {
        // /fr/* ou /es/* : rendu natif par le segment [locale].
        locale = first;
        const rest = '/' + segments.slice(1).join('/');
        barePath = rest === '/' ? '/' : rest;
    } else {
        // Racine non préfixée = anglais : rewrite interne vers /en/* (l'URL reste nue).
        rewriteTo = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
    }

    // On transmet locale + chemin nu à l'app (lus par le layout pour
    // <html lang>, canonical et hreflang corrects par page).
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(LOCALE_HEADER, locale);
    requestHeaders.set(PATH_HEADER, barePath);

    if (rewriteTo) {
        const url = request.nextUrl.clone();
        url.pathname = rewriteTo;
        return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
    // Exclut api, _next, dashboard et tout chemin contenant un point (fichiers statiques).
    matcher: ['/((?!api|_next|dashboard|.*\\..*).*)'],
};

export { LOCALE_HEADER, PATH_HEADER, LOCALES };
