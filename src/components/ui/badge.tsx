import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  isPill?: boolean;
}

export const Badge = ({
  className = '',
  variant = 'primary',
  isPill = false,
  children,
  ...props
}: BadgeProps) => {
  const baseStyles = 'inline-flex items-center font-semibold text-xs transition-colors duration-200';
  
  const shapes = isPill ? 'rounded-full px-2.5 py-0.5' : 'rounded px-2 py-0.5';
  
  const variants = {
    primary: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50',
    success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50',
    danger: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50',
    info: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50',
    outline: 'bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
  };

  return (
    <span
      className={`${baseStyles} ${shapes} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
Badge.displayName = 'Badge';
