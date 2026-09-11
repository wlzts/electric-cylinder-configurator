import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn, formatNumber } from '@/lib/utils';

interface PerformanceCardProps {
  label: string;
  value: number | null | undefined;
  unit?: string;
  digits?: number;
  icon?: ReactNode;
  tone?: 'default' | 'ok' | 'warn' | 'bad';
  note?: string;
  className?: string;
}

const toneText: Record<string, string> = {
  default: 'text-ink',
  ok: 'text-ok',
  warn: 'text-warn',
  bad: 'text-bad',
};

export function PerformanceCard({
  label,
  value,
  unit,
  digits = 0,
  icon,
  tone = 'default',
  note,
  className,
}: PerformanceCardProps) {
  const display = value === null || value === undefined || !Number.isFinite(value) ? '—' : formatNumber(value, digits);
  return (
    <div className={cn('rounded-card border border-line bg-surface p-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-2xs uppercase tracking-wider text-muted">{label}</span>
        {icon && <span className="text-muted">{icon}</span>}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <motion.span
          key={display}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={cn('num text-xl font-semibold leading-none', toneText[tone])}
        >
          {display}
        </motion.span>
        {unit && <span className="text-xs text-muted">{unit}</span>}
      </div>
      {note && <p className="mt-1 text-2xs text-muted">{note}</p>}
    </div>
  );
}
