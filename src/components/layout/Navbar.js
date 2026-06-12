'use client';

import { useState, useEffect } from 'react';
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
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { t } = useI18n();

    const isDashboard = pathname?.startsWith('/dashboard');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (isDashboard) return null;

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-border/50'
                    : 'bg-transparent'
                    }`}
            >
                <div className="container-wide section-padding">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Logo */}
                        <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 group">
                            <Image src="/logo.png" alt="Searchora" width={31} height={36} className="group-hover:scale-105 transition-transform duration-300" />
                            <span className="text-xl font-bold text-text-primary tracking-tight">
                                Searchora
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${pathname === link.href
                                        ? 'text-brand bg-brand-light'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                                        }`}
                                >
                                    {t(`nav.${link.key}`)}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop CTA + Language */}
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
                            className="lg:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`lg:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className="bg-white border-t border-border section-padding pb-6">
                        <div className="space-y-1 pt-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${pathname === link.href
                                        ? 'text-brand bg-brand-light'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                                        }`}
                                >
                                    {t(`nav.${link.key}`)}
                                </Link>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center justify-center">
                            <LanguageSwitcher />
                        </div>
                        <div className="mt-4 pt-4 border-t border-border space-y-3">
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
            <div className="h-16 lg:h-20" />
        </>
    );
}
