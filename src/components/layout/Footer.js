'use client';

import Link from '@/components/ui/LocaleLink';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

export default function Footer() {
    const pathname = usePathname();
    const { t } = useI18n();
    const isDashboard = pathname?.startsWith('/dashboard');

    if (isDashboard) return null;

    const footerLinks = {
        [t('footer.product')]: [
            { label: t('nav.howItWorks'), href: '/how-it-works' },
            { label: t('nav.services'), href: '/services' },
            { label: t('nav.pricing'), href: '/pricing' },
            { label: t('nav.caseStudies'), href: '/case-studies' },
        ],
        [t('footer.company')]: [
            { label: t('nav.contact'), href: '/contact' },
            { label: t('demo.badge'), href: '/demo' },
            { label: t('nav.login'), href: '/login' },
        ],
    };

    return (
        <footer className="cta-dark">
            <div className="container-wide section-padding">
                {/* Top section */}
                <div className="py-16 lg:py-20 grid grid-cols-2 md:grid-cols-3 gap-10 lg:gap-8">
                    {/* Brand column */}
                    <div className="col-span-2 md:col-span-1 mb-4 lg:mb-0">
                        <Link href="/" className="inline-flex items-center gap-2 mb-4">
                            <Image src="/logo.png" alt="Searchora" width={28} height={32} className="invert" />
                            <span className="text-lg font-bold tracking-tight [font-family:var(--font-display)]">Searchora</span>
                        </Link>
                        <p className="text-sm text-white/60 leading-relaxed max-w-xs mt-3">
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="[font-family:var(--font-mono)] text-[12px] uppercase tracking-[.12em] text-white/50 mb-4 font-normal">{category}</h4>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-white/60 hover:text-white"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="[font-family:var(--font-mono)] text-[11px] tracking-[.1em] uppercase text-white/40">
                        {t('footer.copyright')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
