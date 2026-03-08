'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ variant = 'default' }) {
    const { lang, switchLanguage, languages } = useI18n();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const current = languages.find((l) => l.code === lang) || languages[0];

    const baseClasses =
        variant === 'compact'
            ? 'flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg border border-border hover:bg-surface-secondary transition-colors cursor-pointer'
            : 'flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border border-border hover:bg-surface-secondary transition-colors cursor-pointer';

    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen(!open)} className={baseClasses} aria-label="Change language">
                <Globe className={variant === 'compact' ? 'w-3 h-3 text-text-muted' : 'w-3.5 h-3.5 text-text-muted'} />
                <span>{current.flag}</span>
                <span className="text-text-secondary">{current.label}</span>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px]">
                    {languages.map((l) => (
                        <button
                            key={l.code}
                            onClick={() => { switchLanguage(l.code); setOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors cursor-pointer ${l.code === lang
                                    ? 'bg-brand-50 text-brand font-medium'
                                    : 'text-text-secondary hover:bg-surface-secondary'
                                }`}
                        >
                            <span>{l.flag}</span>
                            <span>{l.name}</span>
                            {l.code === lang && (
                                <span className="ml-auto text-brand">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
