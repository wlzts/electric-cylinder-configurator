import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Gauge, Wind } from 'lucide-react';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { transmissions } from '@/data';
import { checkTransmission } from '@/compatibility';
import { OptionCard } from '@/components/ui/OptionCard';
import { useI18n } from '@/i18n';
import type { TransmissionKind } from '@/types';

const icons: Record<TransmissionKind, typeof Zap> = {
  ball_screw: Gauge,
  lead_screw: Zap,
  timing_belt: Wind,
};

export function TransmissionStep() {
  const { t } = useI18n();
  const { configuration, requirements, setConfiguration } = useConfiguratorStore();

  const results = useMemo(
    () => transmissions.map((tr) => ({ tr, result: checkTransmission(tr.kind, configuration, requirements) })),
    [configuration, requirements],
  );

  return (
    <div>
      <p className="mb-4 text-xs text-muted">{t('trans_subtitle')}</p>
      <div className="grid gap-4 md:grid-cols-3">
        {results.map(({ tr, result }, i) => {
          const Icon = icons[tr.kind];
          const selected = configuration.transmission === tr.kind;
          return (
            <motion.div
              key={tr.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <OptionCard
                selected={selected}
                status={result.status}
                onClick={() => setConfiguration({ transmission: tr.kind, screwId: null, beltId: null })}
                title={tr.name}
                subtitle={tr.tagline}
                whyUnavailable={result.reasons[0]}
                className="min-h-[280px]"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-ink/5">
                  <Icon size={18} className="text-ink" />
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-2xs font-medium uppercase tracking-wider text-muted">{t('trans_advantages')}</p>
                    <ul className="mt-1 space-y-0.5">
                      {tr.advantages.slice(0, 3).map((a, idx) => (
                        <li key={idx} className="text-2xs text-ink/80">• {a}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-2xs font-medium uppercase tracking-wider text-muted">{t('trans_limitations')}</p>
                    <ul className="mt-1 space-y-0.5">
                      {tr.limitations.slice(0, 2).map((l, idx) => (
                        <li key={idx} className="text-2xs text-muted">• {l}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="mt-3 rounded bg-ink/[0.03] px-2 py-1.5 text-2xs text-muted">{tr.recommendedFor}</p>
              </OptionCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
