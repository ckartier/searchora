'use client';

export function SectionLabel({ children, className = '' }) {
    return (
        <span
            className={`inline-block text-xs font-semibold uppercase tracking-widest text-brand ${className}`}
        >
            {children}
        </span>
    );
}

export function SectionTitle({ children, className = '' }) {
    return (
        <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary leading-tight tracking-tight ${className}`}
        >
            {children}
        </h2>
    );
}

export function SectionDescription({ children, className = '' }) {
    return (
        <p
            className={`text-lg text-text-secondary leading-relaxed max-w-2xl ${className}`}
        >
            {children}
        </p>
    );
}

export function Section({ children, className = '', id, background = 'white' }) {
    const bgClasses = {
        white: 'bg-white',
        gray: 'bg-surface-secondary',
        dark: 'bg-dark text-white',
    };

    return (
        <section
            id={id}
            className={`py-20 lg:py-28 section-padding ${bgClasses[background]} ${className}`}
        >
            <div className="container-wide">{children}</div>
        </section>
    );
}
