'use client';

export default function Card({
    children,
    className = '',
    hover = true,
    padding = 'p-8',
    ...props
}) {
    return (
        <div
            className={`
        group bg-white rounded-[14px] border border-line
        ${hover ? 'transition-all duration-300 [transition-timing-function:var(--ease)] hover:border-blue hover:-translate-y-1 hover:shadow-[0_20px_40px_-22px_rgba(21,104,223,0.35)]' : ''}
        ${padding}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
}
