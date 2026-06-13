'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Globe, Check } from 'lucide-react';

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
            ? 'chip cursor-pointer hover:border-blue'
            : 'chip cursor-pointer hover:border-blue text-sm';

    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen(!open)} className={baseClasses} aria-label="Change language">
                <Globe className="w-3.5 h-3.5" strokeWidth={1.6} />
                <span>{current.label}</span>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-line rounded-[14px] shadow-[0_20px_40px_-22px_rgba(21,104,223,0.35)] overflow-hidden z-50 min-w-[150px]">
                    {languages.map((l) => (
                        <button
                            key={l.code}
                            onClick={() => { switchLanguage(l.code); setOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm cursor-pointer ${l.code === lang
                                ? 'bg-mark-soft text-blue font-medium'
                                : 'text-text-secondary hover:bg-paper-2'
                                }`}
                        >
                            <span>{l.name}</span>
                            {l.code === lang && (
                                <Check className="ml-auto w-3.5 h-3.5 text-blue" strokeWidth={2.4} />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
