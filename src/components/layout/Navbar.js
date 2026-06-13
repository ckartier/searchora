'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useI18n } from '@/lib/i18n';

const navLinks = [
    { key: 'howItWorks', href: '/how-it-works' },
    { key: 'services', href: '/services' },
    { key: 'caseStudies', href: '/case-studies' },
    { key: 'pricing', href: '/pricing' },
    { key: 'contact', href: '/contact' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { t } = useI18n();

    const isDashboard = pathname?.startsWith('/dashboard');
    if (isDashboard) return null;

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-paper/80 backdrop-blur-md border-b border-line/70">
                <div className="container-wide section-padding">
                    <div className="flex items-center justify-between h-16 lg:h-[72px]">
                        {/* Logo */}
                        <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                            <Image src="/logo.png" alt="Searchora" width={28} height={32} />
                            <span className="text-lg font-bold text-text-primary tracking-tight [font-family:var(--font-display)]">
                                Searchora
                            </span>
                        </Link>

                        {/* Desktop nav */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 text-sm font-medium rounded-full ${pathname === link.href
                                        ? 'text-blue bg-mark-soft'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-paper-2'
                                        }`}
                                >
                                    {t(`nav.${link.key}`)}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop CTA + language */}
                        <div className="hidden lg:flex items-center gap-3">
                            <LanguageSwitcher variant="compact" />
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    {t('nav.login')}
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button size="sm" icon={ArrowRight} iconPosition="right">
                                    {t('nav.requestAudit')}
                                </Button>
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="lg:hidden p-2 rounded-full text-text-secondary hover:bg-paper-2"
                            aria-label="Toggle menu"
                            aria-expanded={isOpen}
                        >
                            {isOpen ? <X className="w-5 h-5" strokeWidth={1.6} /> : <Menu className="w-5 h-5" strokeWidth={1.6} />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <div
                    className={`lg:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className="bg-paper border-t border-line section-padding pb-6">
                        <div className="space-y-1 pt-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-4 py-3 text-sm font-medium rounded-[14px] ${pathname === link.href
                                        ? 'text-blue bg-mark-soft'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-paper-2'
                                        }`}
                                >
                                    {t(`nav.${link.key}`)}
                                </Link>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center justify-center">
                            <LanguageSwitcher />
                        </div>
                        <div className="mt-4 pt-4 border-t border-line space-y-3">
                            <Link href="/login" onClick={() => setIsOpen(false)} className="block">
                                <Button variant="secondary" size="md" className="w-full">
                                    {t('nav.login')}
                                </Button>
                            </Link>
                            <Link href="/contact" onClick={() => setIsOpen(false)} className="block">
                                <Button size="md" className="w-full" icon={ArrowRight} iconPosition="right">
                                    {t('nav.requestAudit')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Spacer */}
            <div className="h-16 lg:h-[72px]" />
        </>
    );
}
