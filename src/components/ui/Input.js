'use client';

import { forwardRef } from 'react';

const Input = forwardRef(function Input(
    {
        label,
        error,
        helperText,
        icon: Icon,
        className = '',
        containerClassName = '',
        ...props
    },
    ref
) {
    return (
        <div className={`space-y-1.5 ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-medium text-text-primary">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Icon className="w-4 h-4 text-text-muted" />
                    </div>
                )}
                <input
                    ref={ref}
                    className={`
            w-full px-4 py-2.5 
            bg-white border border-border rounded-xl
            text-sm text-text-primary placeholder:text-text-muted
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand
            hover:border-gray-300
            disabled:opacity-50 disabled:bg-surface-secondary
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            {helperText && !error && (
                <p className="text-xs text-text-muted">{helperText}</p>
            )}
        </div>
    );
});

export default Input;
