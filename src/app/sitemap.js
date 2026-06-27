import { LOCALES, DEFAULT_LOCALE, localizePath } from '@/lib/i18n/routing';

const BASE_URL = 'https://searchora.io';

// lastmod commun : recalculé à chaque build.
const lastModified = new Date();

// Chemins publics nus + métadonnées SEO.
const routes = [
    { path: '/', changeFrequency: 'weekly', priority: 1.0 },
    { path: '/how-it-works', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/services', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/pricing', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/case-studies', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/contact', changeFrequency: 'yearly', priority: 0.6 },
    { path: '/demo', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/login', changeFrequency: 'yearly', priority: 0.6 },
];

/**
 * Sitemap dynamique multilingue (Next.js App Router).
 * Une entrée par (page × langue), chacune avec ses alternates hreflang.
 * Sert https://searchora.io/sitemap.xml — référencé depuis public/robots.txt.
 */
export default function sitemap() {
    return routes.flatMap(({ path, changeFrequency, priority }) => {
        // Alternates hreflang partagés par toutes les variantes de langue de la page.
        const languages = Object.fromEntries(
            LOCALES.map((l) => [l, `${BASE_URL}${localizePath(path, l)}`])
        );

        return LOCALES.map((locale) => ({
            url: `${BASE_URL}${localizePath(path, locale)}`,
            lastModified,
            changeFrequency,
            // L'anglais (défaut, racine) garde la priorité pleine ; les variantes -0.1.
            priority: locale === DEFAULT_LOCALE ? priority : Math.max(0.1, priority - 0.1),
            alternates: { languages },
        }));
    });
}
