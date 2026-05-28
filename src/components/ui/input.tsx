import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, type = 'text', id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={`
            w-full px-3.5 py-2 text-sm rounded-lg bg-white/50 dark:bg-slate-900/40 
            border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100
            placeholder-slate-400 dark:placeholder-slate-500
            transition-all duration-200 backdrop-blur-sm
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
            disabled:opacity-50 disabled:bg-slate-100/50 dark:disabled:bg-slate-950/20
            ${error ? 'border-danger focus:ring-danger/20 focus:border-danger' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-danger font-medium flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-danger"></span>
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
