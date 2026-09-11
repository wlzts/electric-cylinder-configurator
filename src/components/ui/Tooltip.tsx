import { useState, type ReactNode } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-xs leading-relaxed text-white shadow-lg"
        >
          {content}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-ink" />
        </span>
      )}
    </span>
  );
}

export function InfoIcon({ text, className }: { text: string; className?: string }) {
  return (
    <Tooltip content={text}>
      <button
        type="button"
        aria-label={`Info: ${text}`}
        className={cn('inline-flex text-muted hover:text-ink transition-colors', className)}
        tabIndex={0}
      >
        <Info size={14} />
      </button>
    </Tooltip>
  );
}
