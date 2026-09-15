import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, Check } from 'lucide-react';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { cylinderSeries } from '@/data';
import { checkCylinder } from '@/compatibility';
import { OptionCard } from '@/components/ui/OptionCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/i18n';
import { Link } from 'react-router-dom';
import { formatNumber } from '@/lib/utils';

export function PlatformStep() {
  const { t } = useI18n();
  const { configuration, requirements, setConfiguration, compareIds, toggleCompare } = useConfiguratorStore();

  const results = useMemo(
    () => cylinderSeries.map((cyl) => ({ cyl, result: checkCylinder(cyl, requirements) })),
    [requirements],
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-muted">{t('platform_subtitle')}</p>
        {compareIds.length > 0 && (
          <Link to="/compare">
            <Button variant="outline" size="sm">
              <GitCompare size={12} /> {t('nav_compare')} ({compareIds.length})
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {results.map(({ cyl, result }, i) => {
          const selected = configuration.cylinderId === cyl.id;
          const inCompare = compareIds.includes(cyl.id);
          return (
            <motion.div key={cyl.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <OptionCard
                selected={selected}
                status={result.status}
                onClick={() => setConfiguration({ cylinderId: cyl.id, stroke: Math.min(requirements.stroke, cyl.maxStroke) })}
                title={cyl.model}
                subtitle={cyl.positioning}
                whyUnavailable={result.reasons[0]}
              >
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-2xs">
                  <Spec label={t('platform_max_thrust')} value={`${formatNumber(cyl.maxThrust)} N`} />
                  <Spec label={t('platform_max_payload')} value={`${cyl.maxPayload} kg`} />
                  <Spec label={t('platform_max_speed')} value={`${formatNumber(cyl.maxSpeed)} mm/s`} />
                  <Spec label={t('platform_max_stroke')} value={`${formatNumber(cyl.maxStroke)} mm`} />
                  <Spec label={t('platform_repeatability')} value={`±${cyl.repeatability} mm`} />
                  <Spec label={t('platform_protection')} value={cyl.protection} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {cyl.compatibleTransmissions.map((tr) => (
                    <span key={tr} className="rounded bg-ink/5 px-1.5 py-0.5 text-2xs text-muted capitalize">
                      {tr.replace('_', ' ')}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleCompare(cyl.id); }}
                  className={`mt-3 flex items-center gap-1 rounded-md border px-2 py-1 text-2xs font-medium transition-colors ${inCompare ? 'border-accent bg-accent/10 text-accent' : 'border-line text-muted hover:border-ink/40'}`}
                >
                  {inCompare ? <Check size={10} /> : <GitCompare size={10} />}
                  {inCompare ? t('st_in_compare') : t('st_add_compare')}
                </button>
              </OptionCard>
              {result.status === 'recommended' && (
                <div className="mt-1.5 flex justify-center">
                  <Badge tone="ok">{t('st_best_match')}</Badge>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="num font-medium text-ink">{value}</span>
    </div>
  );
}
