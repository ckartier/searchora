'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, BarChart3, Globe, FileText, Target, Settings,
    LogOut, Zap, Bell, Plus,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import Button from '@/components/ui/Button';

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth();
    const { t } = useI18n();
    const [indicatorStyle, setIndicatorStyle] = useState({});
    const navRef = useRef(null);

    const navItems = [
        { label: t('dashboard.overview'), href: '/dashboard', icon: LayoutDashboard },
        { label: t('dashboard.audits'), href: '/dashboard/audits', icon: BarChart3 },
        { label: t('dashboard.websites'), href: '/dashboard/websites', icon: Globe },
        { label: t('dashboard.reports'), href: '/dashboard/reports', icon: FileText },
        { label: t('dashboard.competitors'), href: '/dashboard/competitors', icon: Target },
        { label: t('dashboard.settings'), href: '/dashboard/settings', icon: Settings },
    ];

    // Animate the active indicator pill
    useEffect(() => {
        if (!navRef.current) return;
        const activeIdx = navItems.findIndex((n) =>
            n.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(n.href)
        );
        const buttons = navRef.current.querySelectorAll('[data-nav-btn]');
        if (buttons[activeIdx]) {
            const btn = buttons[activeIdx];
            const container = navRef.current;
            setIndicatorStyle({
                width: btn.offsetWidth,
                left: btn.offsetLeft - container.offsetLeft,
                opacity: 1,
            });
        }
    }, [pathname]);

    const handleSignOut = async () => {
        try { await signOut(); router.push('/'); } catch (err) { console.error(err); }
    };

    const isActive = (href) =>
        href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

    // Don't show this layout for the audit wizard page
    if (pathname === '/dashboard/audit') {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-surface-secondary -mt-16 lg:-mt-20 pt-16 lg:pt-20">

            {/* ===== Top bar ===== */}
            <div className="bg-white border-b border-border sticky top-16 lg:top-20 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left — user greeting */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center">
                                <span className="text-sm font-bold text-brand">
                                    {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-semibold text-text-primary leading-tight">
                                    {user?.displayName || 'User'}
                                </p>
                                <p className="text-[11px] text-text-muted">{user?.email}</p>
                            </div>
                        </div>

                        {/* Right — actions */}
                        <div className="flex items-center gap-2">
                            <button className="relative p-2.5 rounded-xl text-text-muted hover:bg-surface-secondary hover:text-text-primary transition-all duration-200 cursor-pointer">
                                <Bell className="w-[18px] h-[18px]" />
                                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand rounded-full" />
                            </button>
                            <Link href="/dashboard/audit">
                                <Button size="sm" icon={Zap} className="shadow-[0_2px_8px_rgba(249,115,22,0.25)]">
                                    {t('dashboard.runNewAudit')}
                                </Button>
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="p-2.5 rounded-xl text-text-muted hover:bg-red-50 hover:text-red-500 transition-all duration-200 cursor-pointer"
                                title={t('dashboard.signOut')}
                            >
                                <LogOut className="w-[18px] h-[18px]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Navigation pills ===== */}
            <div className="bg-white border-b border-border/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative py-3" ref={navRef}>
                        {/* Animated active indicator */}
                        <div
                            className="absolute top-3 h-[calc(100%-24px)] bg-brand/[0.08] rounded-xl transition-all duration-300 ease-out"
                            style={{
                                width: indicatorStyle.width || 0,
                                left: indicatorStyle.left || 0,
                                opacity: indicatorStyle.opacity || 0,
                            }}
                        />

                        {/* Nav buttons */}
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                            {navItems.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        data-nav-btn
                                        className={`
                      relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-200 whitespace-nowrap cursor-pointer
                      ${active
                                                ? 'text-brand'
                                                : 'text-text-muted hover:text-text-primary hover:bg-surface-secondary/60'
                                            }
                    `}
                                    >
                                        <item.icon className={`w-4 h-4 transition-colors duration-200 ${active ? 'text-brand' : ''}`} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Page content ===== */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-fade-in">
                    {children}
                </div>
            </div>
        </div>
    );
}
