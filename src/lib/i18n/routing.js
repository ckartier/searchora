// Routing i18n — source de vérité partagée (middleware, layout, liens, sitemap).
// Stratégie d'URL : "as-needed" → l'anglais (défaut) reste à la racine (/pricing),
// le français et l'espagnol sont préfixés (/fr/pricing, /es/pricing).

export const LOCALES = ['en', 'fr', 'es'];
export const DEFAULT_LOCALE = 'en';

// Préfixes réellement présents dans l'URL (en est implicite, donc absent).
export const PREFIXED_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

// Segments racine qui NE sont PAS localisés (pas de valeur SEO / hors site public).
export const NON_LOCALIZED_SEGMENTS = ['dashboard', 'api'];

export function isLocale(value) {
    return LOCALES.includes(value);
}

/**
 * Extrait la locale d'un pathname et renvoie le chemin "nu" (sans préfixe).
 * /fr/pricing -> { locale: 'fr', pathname: '/pricing' }
 * /pricing    -> { locale: 'en', pathname: '/pricing' }
 */
export function parseLocale(pathname) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && PREFIXED_LOCALES.includes(segments[0])) {
        const rest = '/' + segments.slice(1).join('/');
        return { locale: segments[0], pathname: rest === '/' ? '/' : rest };
    }
    return { locale: DEFAULT_LOCALE, pathname };
}

/**
 * Construit l'URL publique d'un chemin nu pour une locale donnée.
 * localizePath('/pricing', 'fr') -> '/fr/pricing'
 * localizePath('/pricing', 'en') -> '/pricing'
 * Les liens externes, ancres et segments non localisés sont laissés tels quels.
 */
export function localizePath(href, locale) {
    if (typeof href !== 'string') return href;
    if (!href.startsWith('/')) return href; // externe, #, mailto, tel…

    const firstSegment = href.split('/').filter(Boolean)[0];
    if (NON_LOCALIZED_SEGMENTS.includes(firstSegment)) return href;

    // Évite un double préfixe si le chemin en porte déjà un.
    const { pathname } = parseLocale(href);

    if (locale === DEFAULT_LOCALE) return pathname;
    return pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
}
