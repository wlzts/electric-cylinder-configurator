import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-ink text-white hover:bg-ink/90 active:bg-ink/80 shadow-sm disabled:bg-ink/30',
  secondary:
    'bg-accent text-white hover:bg-accent-deep active:bg-accent-deep/90 shadow-sm disabled:bg-accent/30',
  ghost: 'bg-transparent text-ink hover:bg-ink/5 disabled:text-ink/30',
  outline:
    'bg-transparent border border-line text-ink hover:border-ink/40 hover:bg-ink/[0.02] disabled:border-line/50 disabled:text-ink/30',
  danger: 'bg-bad text-white hover:bg-bad/90 disabled:bg-bad/30',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ease-smooth disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
