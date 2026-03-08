'use client';

import { forwardRef } from 'react';

const variants = {
    primary:
        'bg-brand text-white hover:bg-brand-hover shadow-[0_2px_8px_rgba(249,115,22,0.25)] hover:shadow-[0_4px_16px_rgba(249,115,22,0.35)]',
    secondary:
        'bg-white text-text-primary border border-border hover:border-brand hover:text-brand shadow-sm hover:shadow-md',
    ghost:
        'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary',
    outline:
        'bg-transparent text-brand border border-brand hover:bg-brand hover:text-white',
    dark:
        'bg-dark text-white hover:bg-dark-secondary shadow-sm',
};

const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
    xl: 'px-10 py-4 text-lg',
};

const Button = forwardRef(function Button(
    {
        children,
        variant = 'primary',
        size = 'md',
        className = '',
        disabled = false,
        loading = false,
        icon: Icon,
        iconPosition = 'left',
        ...props
    },
    ref
) {
    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={`
        inline-flex items-center justify-center gap-2 
        font-medium rounded-xl 
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-brand/30 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        cursor-pointer
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : Icon && iconPosition === 'left' ? (
                <Icon className="w-4 h-4" />
            ) : null}
            {children}
            {!loading && Icon && iconPosition === 'right' ? <Icon className="w-4 h-4" /> : null}
        </button>
    );
});

export default Button;
