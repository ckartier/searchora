'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import translations from './translations';

const I18nContext = createContext({});

const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'fr', label: 'FR', name: 'Français' },
    { code: 'es', label: 'ES', name: 'Español' },
];

export function I18nProvider({ children }) {
    const [lang, setLang] = useState('en');

    // Persist language choice, falling back to the browser language on first visit
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const saved = localStorage.getItem('searchora-lang');
        const detected = (navigator.language || '').slice(0, 2).toLowerCase();
        const initial = (saved && translations[saved] && saved)
            || (translations[detected] && detected)
            || null;
        if (initial) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLang(initial);
            document.documentElement.lang = initial;
        }
    }, []);

    const switchLanguage = useCallback((newLang) => {
        if (translations[newLang]) {
            setLang(newLang);
            document.documentElement.lang = newLang;
            if (typeof window !== 'undefined') {
                localStorage.setItem('searchora-lang', newLang);
            }
        }
    }, []);

    /**
     * Get a translation by dot-separated key path
     * e.g. t('nav.howItWorks') => 'How It Works'
     */
    const t = useCallback(
        (key, fallback) => {
            const keys = key.split('.');
            let value = translations[lang];

            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    // Fallback to English
                    let enValue = translations.en;
                    for (const ek of keys) {
                        if (enValue && typeof enValue === 'object' && ek in enValue) {
                            enValue = enValue[ek];
                        } else {
                            return fallback || key;
                        }
                    }
                    return enValue;
                }
            }

            return value || fallback || key;
        },
        [lang]
    );

    return (
        <I18nContext.Provider value={{ lang, t, switchLanguage, languages: SUPPORTED_LANGUAGES }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context || !context.t) {
        // Return a safe fallback if used outside provider
        return {
            lang: 'en',
            t: (key) => key,
            switchLanguage: () => { },
            languages: SUPPORTED_LANGUAGES,
        };
    }
    return context;
}

export { SUPPORTED_LANGUAGES };
export default I18nContext;
