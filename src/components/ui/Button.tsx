import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    let variantStyles = 'bg-[#0070C0] text-white hover:bg-[#005a9c] border-transparent shadow-xs';

    if (variant === 'secondary') {
      variantStyles = 'bg-slate-100 text-[#172B4D] hover:bg-slate-200 border-transparent';
    } else if (variant === 'outline') {
      variantStyles = 'bg-white text-[#172B4D] border-slate-200 hover:bg-slate-50 border shadow-xs';
    } else if (variant === 'danger') {
      variantStyles = 'bg-rose-600 text-white hover:bg-rose-700 border-transparent shadow-xs';
    } else if (variant === 'ghost') {
      variantStyles = 'bg-transparent text-slate-600 hover:text-[#172B4D] hover:bg-slate-100 border-transparent';
    } else if (variant === 'success') {
      variantStyles = 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent shadow-xs';
    }

    let sizeStyles = 'px-3.5 py-2 text-xs font-semibold';
    if (size === 'sm') sizeStyles = 'px-2.5 py-1.5 text-[11px] font-semibold';
    if (size === 'lg') sizeStyles = 'px-5 py-2.5 text-sm font-semibold';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border transition-all duration-150 select-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
