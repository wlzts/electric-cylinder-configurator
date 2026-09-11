import { useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfiguratorStore, DEFAULT_REQUIREMENTS } from '@/store/useConfiguratorStore';
import { recommendConfiguration, calculatePerformance } from '@/engineering';
import { cylinderSeries, motors, ballScrews, timingBelts, drives, protocols } from '@/data';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatNumber } from '@/lib/utils';
import type { ApplicationRequirement, Configuration } from '@/types';

export function SmartSelection() {
  const { requirements, setRequirements, applyRecommendation } = useConfiguratorStore();
  const [local, setLocal] = useState<ApplicationRequirement>(requirements);
  const [generated, setGenerated] = useState(false);

  const recommendations = useMemo(() => {
    if (!generated) return [];
    const configs = recommendConfiguration(local);
    return [
      { tier: 'recommended' as const, label: 'Recommended', config: configs[0], reasons: ['Best balance of performance and cost', 'Safety factor > 2.5', 'Suitable for 24/7 operation'] },
      { tier: 'performance' as const, label: 'Performance', config: configs[1], reasons: ['Higher thrust margin', 'Larger cylinder for future load growth', 'Higher power motor'] },
      { tier: 'economy' as const, label: 'Economy', config: configs[2], reasons: ['Lowest cost platform', 'Sufficient for current requirements', 'Compact footprint'] },
    ];
  }, [generated, local]);

  const update = (patch: Partial<ApplicationRequirement>) => setLocal((l) => ({ ...l, ...patch }));

  const handleGenerate = () => {
    setRequirements(local);
    setGenerated(true);
  };

  const handleApply = (config: Configuration) => {
    applyRecommendation(config);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-accent" />
          <h1 className="text-2xl font-semibold tracking-tight">Smart Selection</h1>
        </div>
        <p className="mt-1 text-sm text-muted">Enter your application requirements. We'll recommend three optimized configurations.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        {/* Requirements form */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold mb-4">Application Requirements</h2>
          <div className="space-y-4">
            <Field label="Installation Orientation">
              <div className="flex gap-2">
                {(['horizontal', 'vertical'] as const).map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => update({ orientation: o })}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors ${local.orientation === o ? 'border-ink bg-ink text-white' : 'border-line text-muted hover:border-ink/40'}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Payload" unit="kg" value={local.payload} onChange={(v) => update({ payload: v })} />
              <NumberField label="Stroke" unit="mm" value={local.stroke} onChange={(v) => update({ stroke: v })} />
              <NumberField label="Target Speed" unit="mm/s" value={local.targetSpeed} onChange={(v) => update({ targetSpeed: v })} />
              <NumberField label="Acceleration" unit="mm/s²" value={local.acceleration} onChange={(v) => update({ acceleration: v })} />
              <NumberField label="Target Thrust" unit="N" value={local.targetThrust} onChange={(v) => update({ targetThrust: v })} />
              <NumberField label="Repeatability" unit="±mm" value={local.repeatability} onChange={(v) => update({ repeatability: v })} step={0.001} />
              <NumberField label="Daily Hours" unit="h" value={local.dailyHours} onChange={(v) => update({ dailyHours: v })} />
              <NumberField label="Cycles/min" unit="cpm" value={local.cyclesPerMin} onChange={(v) => update({ cyclesPerMin: v })} />
            </div>

            <Field label="Environment">
              <div className="flex gap-2">
                {(['normal', 'dusty', 'cleanroom'] as const).map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => update({ environment: e })}
                    className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium capitalize transition-colors ${local.environment === e ? 'border-ink bg-ink text-white' : 'border-line text-muted hover:border-ink/40'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Communication">
              <select
                value={local.communication}
                onChange={(e) => update({ communication: e.target.value })}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs focus:border-ink"
              >
                {protocols.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>

            <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={local.brakeRequired}
                onChange={(e) => update({ brakeRequired: e.target.checked })}
                className="rounded border-line"
              />
              Require brake
            </label>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" className="flex-1" onClick={handleGenerate}>
                <Zap size={14} /> Generate Recommendation
              </Button>
              <Button variant="outline" onClick={() => { setLocal(DEFAULT_REQUIREMENTS); setGenerated(false); }}>
                <RotateCcw size={14} />
              </Button>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          {!generated ? (
            <div className="card flex h-full min-h-[400px] flex-col items-center justify-center p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5">
                <Zap size={24} className="text-muted" />
              </div>
              <h3 className="mt-4 text-base font-semibold">No recommendations yet</h3>
              <p className="mt-1 max-w-xs text-sm text-muted">Fill in your application requirements and click Generate Recommendation to see three optimized configurations.</p>
            </div>
          ) : (
            recommendations.map((rec, idx) => (
              <RecommendationCard
                key={rec.tier}
                tier={rec.tier}
                label={rec.label}
                config={rec.config}
                reasons={rec.reasons}
                requirements={local}
                onApply={() => handleApply(rec.config)}
                delay={idx * 0.1}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({
  tier,
  label,
  config,
  reasons,
  requirements,
  onApply,
  delay,
}: {
  tier: 'recommended' | 'performance' | 'economy';
  label: string;
  config: Configuration;
  reasons: string[];
  requirements: ApplicationRequirement;
  onApply: () => void;
  delay: number;
}) {
  const perf = calculatePerformance(requirements, config);
  const cyl = cylinderSeries.find((c) => c.id === config.cylinderId);
  const motor = motors.find((m) => m.id === config.motorId);
  const screw = ballScrews.find((s) => s.id === config.screwId);
  const belt = timingBelts.find((b) => b.id === config.beltId);
  const drive = drives.find((d) => d.id === config.driveId);
  const proto = protocols.find((p) => p.id === config.communicationId);

  const tone = tier === 'recommended' ? 'accent' : tier === 'performance' ? 'ok' : 'neutral';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`card p-5 ${tier === 'recommended' ? 'ring-1 ring-accent/30' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">{label}</h3>
            <Badge tone={tone}>{tier}</Badge>
          </div>
          <p className="mt-0.5 num text-xs text-muted">{cyl?.model} · {motor?.name} · {config.brake ? 'Brake' : 'No Brake'}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-4">
        <Spec label="Platform" value={cyl?.model ?? '—'} />
        <Spec label="Transmission" value={config.transmission?.replace('_', ' ') ?? '—'} />
        <Spec label="Screw/Belt" value={screw ? `Ø${screw.diameter} L${screw.lead}` : belt ? `${belt.pitch}` : '—'} />
        <Spec label="Motor" value={`${motor?.power ?? 0}W`} />
        <Spec label="Drive" value={drive?.name.split(' ')[0] ?? '—'} />
        <Spec label="Communication" value={proto?.code ?? '—'} />
        <Spec label="Max Thrust" value={`${formatNumber(perf.ratedThrust)} N`} />
        <Spec label="Safety Factor" value={perf.safetyFactor ? perf.safetyFactor.toFixed(2) : '—'} />
      </div>

      <ul className="mt-4 space-y-1">
        {reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-1.5 text-2xs text-muted">
            <Check size={11} className="mt-0.5 shrink-0 text-ok" />
            {r}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex gap-2">
        <Button variant="primary" size="sm" className="flex-1" onClick={onApply}>
          Apply Configuration <ArrowRight size={12} />
        </Button>
        <Link to="/review">
          <Button variant="outline" size="sm">Review</Button>
        </Link>
      </div>
    </motion.div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-2xs uppercase tracking-wider text-muted/70">{label}</dt>
      <dd className="num text-xs font-medium text-ink">{value}</dd>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-2xs font-medium uppercase tracking-wider text-muted">{label}</label>
      {children}
    </div>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-2xs font-medium uppercase tracking-wider text-muted">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="num w-full rounded-lg border border-line bg-surface px-3 py-2 pr-10 text-xs focus:border-ink"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-muted">{unit}</span>
      </div>
    </div>
  );
}
