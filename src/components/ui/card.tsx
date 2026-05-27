import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isGlass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', isGlass = true, children, ...props }, ref) => {
    const baseStyles = 'rounded-xl overflow-hidden transition-all duration-300';
    const glassStyles = 'glass-panel';
    const standardStyles = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md';
    
    return (
      <div
        ref={ref}
        className={`${baseStyles} ${isGlass ? glassStyles : standardStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 border-b border-card-border/50 ${className}`} {...props}>
    {children}
  </div>
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 ${className}`} {...props}>
    {children}
  </h3>
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-slate-500 dark:text-slate-400 ${className}`} {...props}>
    {children}
  </p>
);
CardDescription.displayName = 'CardDescription';

export const CardContent = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);
CardContent.displayName = 'CardContent';

export const CardFooter = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 border-t border-card-border/50 bg-slate-50/30 dark:bg-slate-950/20 ${className}`} {...props}>
    {children}
  </div>
);
CardFooter.displayName = 'CardFooter';
