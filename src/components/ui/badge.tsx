import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  isPill?: boolean;
  dot?: boolean;
}

export const Badge = ({
  className = '',
  variant = 'primary',
  isPill = true,
  dot = false,
  children,
  ...props
}: BadgeProps) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-semibold text-xs transition-all duration-200';

  const shapes = isPill ? 'rounded-full px-2.5 py-0.5' : 'rounded-lg px-2 py-0.5';

  const variants = {
    primary:
      'bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 shadow-[0_0_8px_rgba(99,102,241,0.1)]',
    secondary:
      'bg-slate-800/80 text-slate-300 border border-slate-700/60',
    success:
      'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.1)]',
    warning:
      'bg-amber-500/10 text-amber-300 border border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.1)]',
    danger:
      'bg-rose-500/10 text-rose-300 border border-rose-500/25 shadow-[0_0_8px_rgba(239,68,68,0.1)]',
    info:
      'bg-sky-500/10 text-sky-300 border border-sky-500/25 shadow-[0_0_8px_rgba(56,189,248,0.1)]',
    outline:
      'bg-transparent text-slate-300 border border-slate-600',
  };

  const dotColors: Record<string, string> = {
    primary: 'bg-indigo-400',
    secondary: 'bg-slate-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-sky-400',
    outline: 'bg-slate-400',
  };

  return (
    <span
      className={`${baseStyles} ${shapes} ${variants[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
Badge.displayName = 'Badge';
