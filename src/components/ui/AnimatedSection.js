'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Scroll reveal per design system: IntersectionObserver threshold .12,
 * translateY(24px) -> 0 + fade, ease cubic-bezier(.2,.8,.2,1).
 * `stagger` adds a 90ms delay per direct child (grids, steps, stats).
 * prefers-reduced-motion: everything visible immediately.
 */
export default function AnimatedSection({ children, className = '', delay = 0, stagger = false }) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setIsVisible(true);
            return;
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => setIsVisible(true), delay);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.12 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [delay]);

    if (stagger) {
        return (
            <div ref={ref} className={className} data-revealed={isVisible || undefined}>
                {Array.isArray(children) ? children.map((child, i) => (
                    <div
                        key={i}
                        className="transition-all duration-700 [transition-timing-function:var(--ease)]"
                        style={{
                            opacity: isVisible ? 1 : 0,
                            transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
                            transitionDelay: `${i * 90}ms`,
                        }}
                    >
                        {child}
                    </div>
                )) : children}
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 [transition-timing-function:var(--ease)] ${isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
                } ${className}`}
        >
            {children}
        </div>
    );
}
