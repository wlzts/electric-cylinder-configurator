import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, Check } from 'lucide-react';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { cylinderSeries } from '@/data';
import { checkCylinder } from '@/compatibility';
import { OptionCard } from '@/components/ui/OptionCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { formatNumber } from '@/lib/utils';

export function PlatformStep() {
  const { configuration, requirements, setConfiguration, compareIds, toggleCompare } = useConfiguratorStore();

  const results = useMemo(
    () => cylinderSeries.map((cyl) => ({ cyl, result: checkCylinder(cyl, requirements) })),
    [requirements],
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-muted">Select a cylinder platform. Incompatible options remain visible with reasons.</p>
        {compareIds.length > 0 && (
          <Link to="/compare">
            <Button variant="outline" size="sm">
              <GitCompare size={12} /> Compare ({compareIds.length})
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {results.map(({ cyl, result }, i) => {
          const selected = configuration.cylinderId === cyl.id;
          const inCompare = compareIds.includes(cyl.id);
          return (
            <motion.div
              key={cyl.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <OptionCard
                selected={selected}
                status={result.status}
                onClick={() => setConfiguration({ cylinderId: cyl.id, stroke: Math.min(requirements.stroke, cyl.maxStroke) })}
                title={cyl.model}
                subtitle={cyl.positioning}
                whyUnavailable={result.reasons[0]}
              >
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-2xs">
                  <Spec label="Max Thrust" value={`${formatNumber(cyl.maxThrust)} N`} />
                  <Spec label="Max Payload" value={`${cyl.maxPayload} kg`} />
                  <Spec label="Max Speed" value={`${formatNumber(cyl.maxSpeed)} mm/s`} />
                  <Spec label="Max Stroke" value={`${formatNumber(cyl.maxStroke)} mm`} />
                  <Spec label="Repeatability" value={`±${cyl.repeatability} mm`} />
                  <Spec label="Protection" value={cyl.protection} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {cyl.compatibleTransmissions.map((t) => (
                    <span key={t} className="rounded bg-ink/5 px-1.5 py-0.5 text-2xs text-muted capitalize">
                      {t.replace('_', ' ')}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCompare(cyl.id);
                  }}
                  className={`mt-3 flex items-center gap-1 rounded-md border px-2 py-1 text-2xs font-medium transition-colors ${inCompare ? 'border-accent bg-accent/10 text-accent' : 'border-line text-muted hover:border-ink/40'}`}
                >
                  {inCompare ? <Check size={10} /> : <GitCompare size={10} />}
                  {inCompare ? 'In Compare' : 'Add to Compare'}
                </button>
              </OptionCard>
              {result.status === 'recommended' && (
                <div className="mt-1.5 flex justify-center">
                  <Badge tone="ok">Best match</Badge>
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
