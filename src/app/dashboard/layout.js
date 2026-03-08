'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BarChart3,
    Globe,
    FileText,
    Target,
    Settings,
    LogOut,
    Menu,
    X,
    Zap,
    Bell,
    Search,
    ChevronDown,
    Plus,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';

const sidebarLinks = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Audits', href: '/dashboard/audits', icon: BarChart3 },
    { label: 'Websites', href: '/dashboard/websites', icon: Globe },
    { label: 'Reports', href: '/dashboard/reports', icon: FileText },
    { label: 'Competitors', href: '/dashboard/competitors', icon: Target },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (err) {
            console.error('Sign out error:', err);
        }
    };

    return (
        <div className="flex h-screen bg-surface-secondary overflow-hidden -mt-16 lg:-mt-20 pt-0">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Sidebar header */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-border">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">S</span>
                        </div>
                        <span className="text-lg font-bold text-text-primary tracking-tight">
                            Searchora
                        </span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg text-text-muted hover:bg-surface-secondary cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                                        ? 'bg-brand-50 text-brand'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                                    }`}
                            >
                                <link.icon className={`w-4.5 h-4.5 ${isActive ? 'text-brand' : ''}`} />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar footer */}
                <div className="p-4 border-t border-border">
                    <Link href="/dashboard/audit">
                        <Button size="sm" className="w-full" icon={Plus}>
                            Run New Audit
                        </Button>
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-3 py-2.5 mt-2 text-sm text-text-muted hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top navbar */}
                <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-text-muted hover:bg-surface-secondary cursor-pointer"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Search */}
                        <div className="hidden sm:flex items-center gap-2 bg-surface-secondary rounded-xl px-3 py-2 w-64">
                            <Search className="w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent text-sm text-text-primary placeholder:text-text-muted border-none outline-none w-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <button className="relative p-2 rounded-lg text-text-muted hover:bg-surface-secondary transition-colors cursor-pointer">
                            <Bell className="w-5 h-5" />
                            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full" />
                        </button>

                        {/* User */}
                        <div className="flex items-center gap-2 pl-3 border-l border-border">
                            <div className="w-8 h-8 bg-brand-50 rounded-full flex items-center justify-center">
                                <span className="text-xs font-semibold text-brand">
                                    {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium text-text-primary leading-tight">
                                    {user?.displayName || 'User'}
                                </p>
                                <p className="text-[10px] text-text-muted">
                                    {user?.email || 'user@company.com'}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
