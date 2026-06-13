'use client';

export function SectionLabel({ children, className = '' }) {
    return (
        <span className={`eyebrow ${className}`}>
            {children}
        </span>
    );
}

export function SectionTitle({ children, className = '' }) {
    return (
        <h2 className={`text-text-primary ${className}`}>
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
        white: 'bg-paper',
        gray: 'bg-paper-2',
        dark: 'cta-dark',
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
