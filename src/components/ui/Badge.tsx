import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { CompatibilityStatus } from '@/types';

type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'bad' | CompatibilityStatus;

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-ink/5 text-ink/70 border-ink/10',
  accent: 'bg-accent/10 text-accent-deep border-accent/20',
  ok: 'bg-ok/10 text-ok border-ok/20',
  warn: 'bg-warn/10 text-warn border-warn/20',
  bad: 'bg-bad/10 text-bad border-bad/20',
  recommended: 'bg-ok/10 text-ok border-ok/20',
  compatible: 'bg-ink/5 text-ink/70 border-ink/10',
  warning: 'bg-warn/10 text-warn border-warn/20',
  incompatible: 'bg-bad/10 text-bad border-bad/20',
};

const statusLabel: Record<CompatibilityStatus, string> = {
  recommended: 'Recommended',
  compatible: 'Compatible',
  warning: 'Warning',
  incompatible: 'Not Compatible',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-medium uppercase tracking-wider',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: CompatibilityStatus }) {
  return <Badge tone={status}>{statusLabel[status]}</Badge>;
}
