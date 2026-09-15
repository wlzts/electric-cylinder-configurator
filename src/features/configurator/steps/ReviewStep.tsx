import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, ClipboardList } from 'lucide-react';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { generateConfigurationCode } from '@/lib/codeGenerator';
import { generateBOM } from '@/lib/bom';
import { calculatePerformance } from '@/engineering';
import { evaluateConfiguration } from '@/compatibility';
import { cylinderSeries, motors, ballScrews, timingBelts, drives, encoders, protocols, sensors, accessories } from '@/data';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/i18n';
import { formatNumber } from '@/lib/utils';

export function ReviewStep() {
  const { t } = useI18n();
  const { configuration, requirements } = useConfiguratorStore();
  const code = useMemo(() => generateConfigurationCode(configuration), [configuration]);
  const bom = useMemo(() => generateBOM(configuration), [configuration]);
  const perf = useMemo(() => calculatePerformance(requirements, configuration), [requirements, configuration]);
  const compat = useMemo(() => evaluateConfiguration(configuration, requirements), [configuration, requirements]);

  const cyl = cylinderSeries.find((c) => c.id === configuration.cylinderId);
  const motor = motors.find((m) => m.id === configuration.motorId);
  const screw = ballScrews.find((s) => s.id === configuration.screwId);
  const belt = timingBelts.find((b) => b.id === configuration.beltId);
  const drive = drives.find((d) => d.id === configuration.driveId);
  const encoder = encoders.find((e) => e.id === configuration.encoderId);
  const proto = protocols.find((p) => p.id === configuration.communicationId);

  const groups = [
    { label: t('review_mechanical'), items: [[t('smart_platform'), cyl?.model ?? '—'], [t('cfg_stroke'), `${formatNumber(configuration.stroke)} mm`], [t('platform_protection'), cyl?.protection ?? '—']] },
    { label: t('review_transmission'), items: [[t('review_type'), configuration.transmission?.replace('_', ' ') ?? '—'], [t('review_details'), screw ? `Ø${screw.diameter} L${screw.lead} ${screw.accuracy}` : belt ? `${belt.series} ${belt.pitch} ${belt.width}mm` : '—']] },
    { label: t('review_motor'), items: [[t('review_motor'), motor?.name ?? '—'], [t('review_power'), motor ? `${motor.power}W` : '—'], [t('review_brake'), configuration.brake ? t('cfg_with_brake') : t('cfg_no_brake')]] },
    { label: t('review_drive_comm'), items: [[t('cfg_drive'), drive?.name ?? '—'], [t('cfg_encoder'), encoder?.name ?? '—'], [t('cfg_comm'), proto?.name ?? '—']] },
    { label: t('review_enc_sensors'), items: configuration.sensors.length > 0 ? configuration.sensors.map((id, i) => [`${t('review_enc_sensors')} ${i + 1}`, sensors.find((s) => s.id === id)?.name ?? id]) : [[t('review_enc_sensors'), t('review_none')]] },
    { label: t('review_accessories'), items: configuration.accessories.length > 0 ? configuration.accessories.map((id, i) => [`${t('review_accessories')} ${i + 1}`, accessories.find((a) => a.id === id)?.name ?? id]) : [[t('review_accessories'), t('review_none')]] },
  ];

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-label">{t('review_config_code')}</p>
            <h2 className="mt-1 num text-2xl font-semibold tracking-tight">{code || '—'}</h2>
            <p className="mt-1 text-xs text-muted">{t('review_auto_gen')}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge tone={compat.status}>{t(`st_${compat.status}` as const)}</Badge>
            <div className="flex gap-2">
              <Link to="/review"><Button variant="primary" size="sm"><FileText size={12} /> {t('review_full')}</Button></Link>
              <Link to="/quote"><Button variant="secondary" size="sm"><ClipboardList size={12} /> {t('review_request_quote')}</Button></Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group.label} className="card p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{group.label}</h3>
            <dl className="space-y-1.5">
              {group.items.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2 text-xs">
                  <dt className="text-muted shrink-0">{label}</dt>
                  <dd className="text-right font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h3 className="mb-3 text-sm font-semibold">{t('perf_summary')} <span className="ml-1 text-2xs font-normal text-muted">({t('common_demo')})</span></h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Perf label={t('perf_rated_thrust')} value={perf.ratedThrust} unit="N" />
          <Perf label={t('perf_max_speed')} value={perf.maxSpeed} unit="mm/s" />
          <Perf label={t('perf_safety')} value={perf.safetyFactor} digits={2} />
          <Perf label={t('perf_life')} value={perf.estimatedLife} unit="h" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-ink/[0.02] px-5 py-3">
          <h3 className="text-sm font-semibold">{t('review_bom')} ({bom.length} {t('review_items')})</h3>
          <Link to="/review"><span className="text-xs font-medium text-accent hover:underline">{t('review_view_full_bom')} <ArrowRight size={10} className="inline" /></span></Link>
        </div>
        <div className="divide-y divide-line max-h-64 overflow-y-auto">
          {bom.map((item) => (
            <div key={item.partNumber} className="flex items-center justify-between px-5 py-2 text-xs">
              <div>
                <span className="num font-mono font-medium text-ink">{item.partNumber}</span>
                <span className="ml-2 text-muted">{item.description}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted">×{item.qty}</span>
                <span className={`rounded px-1.5 py-0.5 text-2xs ${item.status === 'included' ? 'bg-ok/10 text-ok' : 'bg-warn/10 text-warn'}`}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Link to="/quote">
          <Button variant="secondary" size="lg">
            {t('cfg_quote_btn')} <ArrowRight size={16} />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Perf({ label, value, unit, digits = 0 }: { label: string; value: number | null; unit?: string; digits?: number }) {
  return (
    <div>
      <p className="text-2xs uppercase tracking-wider text-muted">{label}</p>
      <p className="num mt-0.5 text-xl font-semibold">
        {value === null || !Number.isFinite(value) ? '—' : formatNumber(value, digits)}
        {unit && <span className="ml-1 text-xs font-normal text-muted">{unit}</span>}
      </p>
    </div>
  );
}
