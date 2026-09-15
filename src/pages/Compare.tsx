import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, X, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { cylinderSeries } from '@/data';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/i18n';
import { formatNumber } from '@/lib/utils';

export function Compare() {
  const { compareIds, toggleCompare, clearCompare, applyRecommendation } = useConfiguratorStore();
  const { t } = useI18n();

  const selected = useMemo(
    () => compareIds.map((id) => cylinderSeries.find((c) => c.id === id)).filter(Boolean) as typeof cylinderSeries,
    [compareIds],
  );

  const rows: { label: string; key: keyof (typeof cylinderSeries)[number]; format?: (v: number) => string }[] = [
    { label: t('platform_max_thrust'), key: 'maxThrust', format: (v) => `${formatNumber(v)} N` },
    { label: t('platform_max_payload'), key: 'maxPayload', format: (v) => `${v} kg` },
    { label: t('platform_max_speed'), key: 'maxSpeed', format: (v) => `${formatNumber(v)} mm/s` },
    { label: t('platform_max_stroke'), key: 'maxStroke', format: (v) => `${formatNumber(v)} mm` },
    { label: t('platform_repeatability'), key: 'repeatability', format: (v) => `±${v} mm` },
    { label: 'Weight', key: 'weight', format: (v) => `${v} kg` },
  ];

  const handleSelect = (cylId: string) => {
    const cyl = cylinderSeries.find((c) => c.id === cylId);
    if (!cyl) return;
    applyRecommendation({
      cylinderId: cylId,
      transmission: cyl.compatibleTransmissions[0],
      screwId: null, beltId: null, motorId: null, driveId: null,
      encoderId: null, brake: false, sensors: [], accessories: [],
      communicationId: 'ETHERCAT',
      stroke: Math.min(500, cyl.maxStroke),
    });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 lg:px-8 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare size={18} className="text-accent" />
            <h1 className="text-2xl font-semibold tracking-tight">{t('compare_title')}</h1>
          </div>
          <p className="mt-1 text-sm text-muted">{t('compare_subtitle')} {selected.length}/3 {t('compare_selected')}.</p>
        </div>
        {selected.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCompare}>
            <X size={12} /> {t('compare_clear')}
          </Button>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {cylinderSeries.map((cyl) => {
          const active = compareIds.includes(cyl.id);
          return (
            <button
              key={cyl.id}
              type="button"
              onClick={() => toggleCompare(cyl.id)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${active ? 'border-ink bg-ink text-white' : 'border-line text-muted hover:border-ink/40 hover:text-ink'}`}
            >
              {active && <Check size={12} />}
              {cyl.model}
            </button>
          );
        })}
      </div>

      {selected.length === 0 ? (
        <div className="card flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5">
            <GitCompare size={24} className="text-muted" />
          </div>
          <h3 className="mt-4 text-base font-semibold">{t('compare_none_title')}</h3>
          <p className="mt-1 max-w-sm text-sm text-muted">{t('compare_none_desc')}</p>
          <Link to="/configurator" className="mt-4">
            <Button variant="outline" size="sm">{t('compare_go_cfg')}</Button>
          </Link>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-ink/[0.02]">
                  <th className="sticky left-0 bg-ink/[0.02] px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                    {t('compare_spec')}
                  </th>
                  {selected.map((cyl) => (
                    <th key={cyl.id} className="px-5 py-3 text-left min-w-[180px]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="num text-base font-semibold text-ink">{cyl.model}</p>
                          <p className="text-2xs text-muted">{cyl.positioning}</p>
                        </div>
                        <button type="button" onClick={() => toggleCompare(cyl.id)} className="rounded p-1 text-muted hover:bg-ink/10 hover:text-ink" aria-label={`Remove ${cyl.model}`}>
                          <X size={14} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) => (
                  <tr key={row.key} className="hover:bg-ink/[0.02]">
                    <td className="sticky left-0 bg-surface px-5 py-3 text-xs font-medium text-muted">{row.label}</td>
                    {selected.map((cyl) => {
                      const val = cyl[row.key] as number;
                      const maxVal = Math.max(...selected.map((c) => c[row.key] as number));
                      const isBest = val === maxVal;
                      return (
                        <td key={cyl.id} className="px-5 py-3">
                          <span className={`num font-medium ${isBest ? 'text-ok' : 'text-ink'}`}>
                            {row.format ? row.format(val) : val}
                          </span>
                          {isBest && <Badge tone="ok" className="ml-2">{t('st_best')}</Badge>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="hover:bg-ink/[0.02]">
                  <td className="sticky left-0 bg-surface px-5 py-3 text-xs font-medium text-muted">{t('compare_protection')}</td>
                  {selected.map((cyl) => (
                    <td key={cyl.id} className="px-5 py-3 font-medium">{cyl.protection}</td>
                  ))}
                </tr>
                <tr className="hover:bg-ink/[0.02]">
                  <td className="sticky left-0 bg-surface px-5 py-3 text-xs font-medium text-muted">{t('compare_transmissions')}</td>
                  {selected.map((cyl) => (
                    <td key={cyl.id} className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {cyl.compatibleTransmissions.map((tr) => (
                          <span key={tr} className="rounded bg-ink/5 px-1.5 py-0.5 text-2xs text-muted capitalize">{tr.replace('_', ' ')}</span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-ink/[0.02]">
                  <td className="sticky left-0 bg-surface px-5 py-3 text-xs font-medium text-muted">{t('compare_application')}</td>
                  {selected.map((cyl) => (
                    <td key={cyl.id} className="px-5 py-3 text-xs text-muted">{cyl.recommendedApplication}</td>
                  ))}
                </tr>
                <tr>
                  <td className="sticky left-0 bg-surface px-5 py-3"></td>
                  {selected.map((cyl) => (
                    <td key={cyl.id} className="px-5 py-3">
                      <Button variant="primary" size="sm" className="w-full" onClick={() => handleSelect(cyl.id)}>
                        {t('btn_use')} {cyl.model} <ArrowRight size={12} />
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <p className="mt-4 text-center text-2xs text-muted">{t('common_demo_notice')}</p>
    </div>
  );
}
