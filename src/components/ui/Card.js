'use client';

export default function Card({
    children,
    className = '',
    hover = true,
    padding = 'p-6',
    ...props
}) {
    return (
        <div
            className={`
        bg-white rounded-2xl border border-border
        shadow-[0_1px_3px_rgba(0,0,0,0.04)]
        ${hover ? 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 ease-out' : ''}
        ${padding}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
}
