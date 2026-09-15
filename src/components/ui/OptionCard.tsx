import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertTriangle, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { CompatibilityStatus } from '@/types';
import { StatusBadge } from './Badge';
import { useI18n } from '@/i18n';

interface OptionCardProps {
  selected: boolean;
  status?: CompatibilityStatus;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  badge?: ReactNode;
  whyUnavailable?: string;
  className?: string;
}

export function OptionCard({
  selected,
  status = 'compatible',
  disabled = false,
  onClick,
  title,
  subtitle,
  children,
  badge,
  whyUnavailable,
  className,
}: OptionCardProps) {
  const isIncompatible = status === 'incompatible' || disabled;

  return (
    <motion.button
      type="button"
      onClick={isIncompatible ? undefined : onClick}
      disabled={isIncompatible}
      whileHover={isIncompatible ? undefined : { y: -2 }}
      whileTap={isIncompatible ? undefined : { scale: 0.99 }}
      className={cn(
        'group relative w-full rounded-card border bg-surface p-4 text-left transition-all duration-300 ease-smooth',
        selected
          ? 'border-ink shadow-card-hover ring-1 ring-ink/10'
          : 'border-line shadow-card hover:shadow-card-hover',
        isIncompatible && 'opacity-50 cursor-not-allowed hover:shadow-card hover:translate-y-0',
        className,
      )}
      aria-pressed={selected}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white"
        >
          <Check size={12} strokeWidth={3} />
        </motion.span>
      )}

      {!selected && status !== 'compatible' && (
        <span className="absolute right-3 top-3">
          {status === 'recommended' && <Check size={14} className="text-ok" />}
          {status === 'warning' && <AlertTriangle size={14} className="text-warn" />}
          {status === 'incompatible' && <X size={14} className="text-bad" />}
        </span>
      )}

      <div className="pr-6">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {badge}
        </div>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>

      {children && <div className="mt-3">{children}</div>}

      {status !== 'compatible' && status !== 'recommended' && (
        <div className="mt-3">
          <StatusBadge status={status} />
        </div>
      )}

      {isIncompatible && whyUnavailable && <WhyUnavailable text={whyUnavailable} />}
    </motion.button>
  );
}

function WhyUnavailable({ text }: { text: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setOpen((v) => !v);
      }}
      className="mt-2 block text-2xs text-bad hover:underline"
    >
      {t('common_why_unavailable')}?
      {open && <p className="mt-1 text-2xs leading-relaxed text-muted">{text}</p>}
    </button>
  );
}
