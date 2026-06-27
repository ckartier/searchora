import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { LOCALES, DEFAULT_LOCALE, localizePath } from '@/lib/i18n/routing';

const SITE_URL = 'https://searchora.io';

const META = {
    en: {
        title: 'Searchora — Make Your Brand Appear in AI Answers',
        description:
            'Searchora helps companies become the source used inside AI-generated responses from ChatGPT, Gemini, Copilot, and more. Audit your AI visibility today.',
        locale: 'en_US',
    },
    fr: {
        title: 'Searchora — Faites apparaître votre marque dans les réponses des IA',
        description:
            "Searchora aide les entreprises à devenir la source citée dans les réponses générées par ChatGPT, Gemini, Copilot et plus encore. Auditez votre visibilité IA dès aujourd'hui.",
        locale: 'fr_FR',
    },
    es: {
        title: 'Searchora — Haz que tu marca aparezca en las respuestas de IA',
        description:
            'Searchora ayuda a las empresas a convertirse en la fuente citada dentro de las respuestas generadas por ChatGPT, Gemini, Copilot y más. Audita tu visibilidad en IA hoy.',
        locale: 'es_ES',
    },
};

export function generateStaticParams() {
    return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const meta = META[locale] || META[DEFAULT_LOCALE];

    // Chemin nu transmis par le proxy → canonical/hreflang corrects PAR page.
    const barePath = (await headers()).get('x-searchora-path') || '/';

    // Alternates hreflang : une URL par langue pour CETTE page.
    const languages = {};
    for (const l of LOCALES) {
        languages[l] = `${SITE_URL}${localizePath(barePath, l)}`;
    }
    languages['x-default'] = `${SITE_URL}${localizePath(barePath, DEFAULT_LOCALE)}`;

    return {
        title: meta.title,
        description: meta.description,
        alternates: {
            canonical: `${SITE_URL}${localizePath(barePath, locale)}`,
            languages,
        },
        openGraph: {
            title: meta.title,
            description: meta.description,
            type: 'website',
            locale: meta.locale,
        },
    };
}

export default async function LocaleLayout({ children, params }) {
    const { locale } = await params;
    if (!LOCALES.includes(locale)) notFound();
    return children;
}
