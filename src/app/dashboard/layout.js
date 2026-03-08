'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, BarChart3, Globe, FileText, Target, Settings,
    LogOut, Zap, Bell, Plus, Menu, X, Search, PenTool, Layers,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import Button from '@/components/ui/Button';

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth();
    const { t } = useI18n();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const navItems = [
        { label: t('dashboard.overview'), href: '/dashboard', icon: LayoutDashboard },
        { label: t('dashboard.audits'), href: '/dashboard/audits', icon: BarChart3 },
        { label: t('dashboard.websites'), href: '/dashboard/websites', icon: Globe },
        { label: 'Presence IA', href: '/dashboard/presence', icon: Search },
        { label: 'Content', href: '/dashboard/content', icon: PenTool },
        { label: 'Clusters', href: '/dashboard/clusters', icon: Layers },
        { label: t('dashboard.reports'), href: '/dashboard/reports', icon: FileText },
        { label: t('dashboard.competitors'), href: '/dashboard/competitors', icon: Target },
        { label: t('dashboard.settings'), href: '/dashboard/settings', icon: Settings },
    ];

    const handleSignOut = async () => {
        try { await signOut(); router.push('/'); } catch (err) { console.error(err); }
    };

    const isActive = (href) =>
        href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

    // Get the current page title
    const currentNav = navItems.find((n) => isActive(n.href));
    const pageTitle = currentNav?.label || 'Dashboard';

    return (
        <div className="min-h-screen bg-surface-secondary" style={{ paddingTop: 0 }}>

            {/* ===== Fixed top bar with logo ===== */}
            <div className="bg-white border-b border-border sticky top-0 z-50">
                <div className="w-full px-4 sm:px-6 lg:px-10">
                    <div className="flex items-center justify-between h-16">
                        {/* Left — Logo + mobile toggle */}
                        <div className="flex items-center gap-3">
                            {/* Mobile nav toggle */}
                            <button
                                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                                className="md:hidden p-2 -ml-2 rounded-xl text-text-muted hover:bg-surface-secondary transition-all cursor-pointer"
                            >
                                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>

                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-2.5">
                                <Image src="/logo.png" alt="Searchora" width={32} height={32} />
                                <span className="text-lg font-bold text-text-primary tracking-tight hidden sm:inline">
                                    Searchora
                                </span>
                            </Link>
                        </div>

                        {/* Center — Page title (visible on larger screens) */}
                        <div className="hidden md:block">
                            <h1 className="text-sm font-semibold text-text-primary">{pageTitle}</h1>
                        </div>

                        {/* Right — user + actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button className="relative p-2 rounded-xl text-text-muted hover:bg-surface-secondary hover:text-text-primary transition-all duration-200 cursor-pointer">
                                <Bell className="w-[18px] h-[18px]" />
                                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand rounded-full" />
                            </button>

                            {/* User avatar */}
                            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-border/50">
                                <div className="w-8 h-8 bg-brand/10 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-brand">
                                        {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div className="hidden lg:block">
                                    <p className="text-sm font-medium text-text-primary leading-tight">
                                        {user?.displayName || 'User'}
                                    </p>
                                    <p className="text-[10px] text-text-muted">{user?.email}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleSignOut}
                                className="p-2 rounded-xl text-text-muted hover:bg-red-50 hover:text-red-500 transition-all duration-200 cursor-pointer"
                                title="Sign out"
                            >
                                <LogOut className="w-[17px] h-[17px]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Mobile nav overlay ===== */}
            {mobileNavOpen && (
                <div className="md:hidden fixed inset-0 top-16 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)}>
                    <div className="bg-white m-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-3 space-y-1 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        {navItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileNavOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${active
                                            ? 'bg-brand-50 text-brand'
                                            : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                                        }
                  `}
                                >
                                    <item.icon className={`w-5 h-5 ${active ? 'text-brand' : ''}`} />
                                    {item.label}
                                </Link>
                            );
                        })}
                        <div className="pt-2 mt-2 border-t border-border/50">
                            <Link href="/dashboard/audit" onClick={() => setMobileNavOpen(false)}>
                                <button className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium bg-brand text-white shadow-[0_2px_8px_rgba(249,115,22,0.3)] cursor-pointer">
                                    <Plus className="w-4 h-4" />
                                    {t('dashboard.runNewAudit')}
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Main layout ===== */}
            <div className="w-full px-3 sm:px-4 lg:px-10 py-4 sm:py-6 lg:py-8">
                <div className="flex gap-4 lg:gap-6">

                    {/* === Floating nav buttons — left column (desktop only) === */}
                    <div className="hidden md:flex flex-col gap-1.5 sticky top-20 self-start z-20 w-[200px] lg:w-[220px] shrink-0">
                        {navItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link key={item.href} href={item.href}>
                                    <button
                                        className={`
                      group flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium
                      transition-all duration-300 ease-out cursor-pointer whitespace-nowrap
                      ${active
                                                ? 'bg-white text-brand shadow-[0_2px_12px_rgba(0,0,0,0.08)] scale-[1.02]'
                                                : 'bg-white/60 text-text-muted hover:bg-white hover:text-text-primary hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:scale-[1.01]'
                                            }
                    `}
                                    >
                                        <item.icon className={`w-[18px] h-[18px] transition-colors duration-200 ${active ? 'text-brand' : 'group-hover:text-text-primary'}`} />
                                        {item.label}
                                        {active && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand ml-auto" />
                                        )}
                                    </button>
                                </Link>
                            );
                        })}

                        {/* CTA button */}
                        <div className="mt-3 pt-3 border-t border-border/30">
                            <Link href="/dashboard/audit">
                                <button className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium bg-brand text-white shadow-[0_4px_16px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)] transition-all duration-300 cursor-pointer hover:scale-[1.02]">
                                    <Plus className="w-[18px] h-[18px]" />
                                    {t('dashboard.runNewAudit')}
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* === Page content === */}
                    <div className="flex-1 min-w-0">
                        {/* Mobile page title */}
                        <div className="md:hidden mb-4">
                            <h1 className="text-xl font-bold text-text-primary">{pageTitle}</h1>
                        </div>

                        <div className="animate-fade-in">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
