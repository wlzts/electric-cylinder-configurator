import { useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfiguratorStore, DEFAULT_REQUIREMENTS } from '@/store/useConfiguratorStore';
import { recommendConfiguration, calculatePerformance } from '@/engineering';
import { cylinderSeries, motors, ballScrews, timingBelts, drives, protocols } from '@/data';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/i18n';
import { formatNumber } from '@/lib/utils';
import type { ApplicationRequirement, Configuration } from '@/types';

export function SmartSelection() {
  const { t, lang } = useI18n();
  const { requirements, setRequirements, applyRecommendation } = useConfiguratorStore();
  const [local, setLocal] = useState<ApplicationRequirement>(requirements);
  const [generated, setGenerated] = useState(false);

  const recommendations = useMemo(() => {
    if (!generated) return [];
    const configs = recommendConfiguration(local);
    const reasons = lang === 'zh'
      ? {
          recommended: ['性能与成本最佳平衡', '安全系数 > 2.5', '适合 7×24 小时运行'],
          performance: ['更高推力裕量', '更大电缸为未来负载增长预留', '更高功率电机'],
          economy: ['最低成本平台', '满足当前需求', '紧凑占地'],
        }
      : {
          recommended: ['Best balance of performance and cost', 'Safety factor > 2.5', 'Suitable for 24/7 operation'],
          performance: ['Higher thrust margin', 'Larger cylinder for future load growth', 'Higher power motor'],
          economy: ['Lowest cost platform', 'Sufficient for current requirements', 'Compact footprint'],
        };
    return [
      { tier: 'recommended' as const, label: t('smart_tier_recommended'), config: configs[0], reasons: reasons.recommended },
      { tier: 'performance' as const, label: t('smart_tier_performance'), config: configs[1], reasons: reasons.performance },
      { tier: 'economy' as const, label: t('smart_tier_economy'), config: configs[2], reasons: reasons.economy },
    ];
  }, [generated, local, t, lang]);

  const update = (patch: Partial<ApplicationRequirement>) => setLocal((l) => ({ ...l, ...patch }));
  const handleGenerate = () => { setRequirements(local); setGenerated(true); };
  const handleApply = (config: Configuration) => { applyRecommendation(config); };

  return (
    <div className="mx-auto max-w-[1600px] px-4 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-accent" />
          <h1 className="text-2xl font-semibold tracking-tight">{t('smart_title')}</h1>
        </div>
        <p className="mt-1 text-sm text-muted">{t('smart_subtitle')}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="card p-6">
          <h2 className="text-sm font-semibold mb-4">{t('smart_requirements')}</h2>
          <div className="space-y-4">
            <Field label={t('req_orientation')}>
              <div className="flex gap-2">
                {(['horizontal', 'vertical'] as const).map((o) => (
                  <button key={o} type="button" onClick={() => update({ orientation: o })}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors ${local.orientation === o ? 'border-ink bg-ink text-white' : 'border-line text-muted hover:border-ink/40'}`}>
                    {o === 'horizontal' ? t('req_horizontal') : t('req_vertical')}
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <NumberField label={t('req_payload')} unit="kg" value={local.payload} onChange={(v) => update({ payload: v })} />
              <NumberField label={t('cfg_stroke')} unit="mm" value={local.stroke} onChange={(v) => update({ stroke: v })} />
              <NumberField label={t('req_speed')} unit="mm/s" value={local.targetSpeed} onChange={(v) => update({ targetSpeed: v })} />
              <NumberField label={t('req_accel')} unit="mm/s²" value={local.acceleration} onChange={(v) => update({ acceleration: v })} />
              <NumberField label={t('req_thrust')} unit="N" value={local.targetThrust} onChange={(v) => update({ targetThrust: v })} />
              <NumberField label={t('req_repeatability')} unit="±mm" value={local.repeatability} onChange={(v) => update({ repeatability: v })} step={0.001} />
              <NumberField label={t('req_daily_hours')} unit="h" value={local.dailyHours} onChange={(v) => update({ dailyHours: v })} />
              <NumberField label={t('req_cycles')} unit="cpm" value={local.cyclesPerMin} onChange={(v) => update({ cyclesPerMin: v })} />
            </div>

            <Field label={t('req_environment')}>
              <div className="flex gap-2">
                {(['normal', 'dusty', 'cleanroom'] as const).map((e) => (
                  <button key={e} type="button" onClick={() => update({ environment: e })}
                    className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium capitalize transition-colors ${local.environment === e ? 'border-ink bg-ink text-white' : 'border-line text-muted hover:border-ink/40'}`}>
                    {e === 'normal' ? t('req_normal') : e === 'dusty' ? t('req_dusty') : t('req_cleanroom')}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={t('req_communication')}>
              <select value={local.communication} onChange={(e) => update({ communication: e.target.value })}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs focus:border-ink">
                {protocols.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            </Field>

            <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
              <input type="checkbox" checked={local.brakeRequired} onChange={(e) => update({ brakeRequired: e.target.checked })} className="rounded border-line" />
              {t('req_brake')}
            </label>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" className="flex-1" onClick={handleGenerate}>
                <Zap size={14} /> {t('btn_generate')}
              </Button>
              <Button variant="outline" onClick={() => { setLocal(DEFAULT_REQUIREMENTS); setGenerated(false); }}>
                <RotateCcw size={14} />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {!generated ? (
            <div className="card flex h-full min-h-[400px] flex-col items-center justify-center p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5">
                <Zap size={24} className="text-muted" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{t('smart_no_rec')}</h3>
              <p className="mt-1 max-w-xs text-sm text-muted">{t('smart_no_rec_desc')}</p>
            </div>
          ) : (
            recommendations.map((rec, idx) => (
              <RecommendationCard key={rec.tier} tier={rec.tier} label={rec.label} config={rec.config}
                reasons={rec.reasons} requirements={local} onApply={() => handleApply(rec.config)} delay={idx * 0.1} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({ tier, label, config, reasons, requirements, onApply, delay }: {
  tier: 'recommended' | 'performance' | 'economy';
  label: string; config: Configuration; reasons: string[];
  requirements: ApplicationRequirement; onApply: () => void; delay: number;
}) {
  const { t } = useI18n();
  const perf = calculatePerformance(requirements, config);
  const cyl = cylinderSeries.find((c) => c.id === config.cylinderId);
  const motor = motors.find((m) => m.id === config.motorId);
  const screw = ballScrews.find((s) => s.id === config.screwId);
  const belt = timingBelts.find((b) => b.id === config.beltId);
  const drive = drives.find((d) => d.id === config.driveId);
  const proto = protocols.find((p) => p.id === config.communicationId);
  const tone = tier === 'recommended' ? 'accent' : tier === 'performance' ? 'ok' : 'neutral';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      className={`card p-5 ${tier === 'recommended' ? 'ring-1 ring-accent/30' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">{label}</h3>
            <Badge tone={tone}>{tier}</Badge>
          </div>
          <p className="mt-0.5 num text-xs text-muted">{cyl?.model} · {motor?.name} · {config.brake ? t('smart_brake') : t('smart_no_brake')}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-4">
        <Spec label={t('smart_platform')} value={cyl?.model ?? '—'} />
        <Spec label={t('smart_transmission')} value={config.transmission?.replace('_', ' ') ?? '—'} />
        <Spec label={t('smart_screw_belt')} value={screw ? `Ø${screw.diameter} L${screw.lead}` : belt ? `${belt.pitch}` : '—'} />
        <Spec label={t('smart_motor')} value={`${motor?.power ?? 0}W`} />
        <Spec label={t('smart_drive')} value={drive?.name.split(' ')[0] ?? '—'} />
        <Spec label={t('smart_comm')} value={proto?.code ?? '—'} />
        <Spec label={t('smart_max_thrust')} value={`${formatNumber(perf.ratedThrust)} N`} />
        <Spec label={t('smart_safety')} value={perf.safetyFactor ? perf.safetyFactor.toFixed(2) : '—'} />
      </div>
      <ul className="mt-4 space-y-1">
        {reasons.map((r, i) => (
          <li key={i} className="flex items-start gap-1.5 text-2xs text-muted">
            <Check size={11} className="mt-0.5 shrink-0 text-ok" /> {r}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <Button variant="primary" size="sm" className="flex-1" onClick={onApply}>
          {t('smart_apply')} <ArrowRight size={12} />
        </Button>
        <Link to="/review"><Button variant="outline" size="sm">{t('cfg_review')}</Button></Link>
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

function NumberField({ label, unit, value, onChange, step = 1 }: {
  label: string; unit: string; value: number; onChange: (v: number) => void; step?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-2xs font-medium uppercase tracking-wider text-muted">{label}</label>
      <div className="relative">
        <input type="number" value={value} step={step} onChange={(e) => onChange(Number(e.target.value))}
          className="num w-full rounded-lg border border-line bg-surface px-3 py-2 pr-10 text-xs focus:border-ink" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-muted">{unit}</span>
      </div>
    </div>
  );
}
