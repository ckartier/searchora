'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
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
            { label: t('footer.about'), href: '#' },
            { label: t('footer.blog'), href: '#' },
            { label: t('footer.careers'), href: '#' },
            { label: t('nav.contact'), href: '/contact' },
        ],
        [t('footer.legal')]: [
            { label: t('footer.privacy'), href: '#' },
            { label: t('footer.terms'), href: '#' },
        ],
    };

    return (
        <footer className="bg-dark text-white">
            <div className="container-wide section-padding">
                {/* Top section */}
                <div className="py-16 lg:py-20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 lg:gap-8">
                    {/* Brand column */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-1 mb-4 lg:mb-0">
                        <Link href="/" className="inline-flex items-center gap-2 mb-4">
                            <Image src="/logo.png" alt="Searchora" width={32} height={32} className="invert" />
                            <span className="text-lg font-bold tracking-tight">Searchora</span>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed max-w-xs mt-3">
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-gray-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                                        >
                                            {link.label}
                                            {link.href === '#' && (
                                                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="py-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-500">
                        {t('footer.copyright')}
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Twitter</a>
                        <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">LinkedIn</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
