'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { localizePath } from '@/lib/i18n/routing';

/**
 * Remplaçant de next/link qui préfixe automatiquement les liens internes
 * selon la langue active (/pricing -> /fr/pricing en français).
 * API identique à next/link : on peut juste changer l'import.
 */
export default function LocaleLink({ href, ...props }) {
    const { lang } = useI18n();
    return <Link href={localizePath(href, lang)} {...props} />;
}
