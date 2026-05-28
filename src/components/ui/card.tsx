import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isGlass?: boolean;
  glow?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', isGlass = true, glow = false, children, ...props }, ref) => {
    const baseStyles = 'rounded-2xl overflow-hidden transition-all duration-300 card-hover';
    const glassStyles = 'glass-panel';
    const standardStyles = 'bg-slate-900/80 border border-slate-800 shadow-xl';
    const glowStyles = glow ? 'glow-border-indigo animate-glow-pulse' : '';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${isGlass ? glassStyles : standardStyles} ${glowStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`px-6 py-4 border-b border-white/[0.06] ${className}`} {...props}>
    {children}
  </div>
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-base font-semibold tracking-tight text-slate-100 ${className}`} {...props}>
    {children}
  </h3>
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-slate-400 ${className}`} {...props}>
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
  <div className={`px-6 py-4 border-t border-white/[0.06] bg-slate-950/20 ${className}`} {...props}>
    {children}
  </div>
);
CardFooter.displayName = 'CardFooter';
