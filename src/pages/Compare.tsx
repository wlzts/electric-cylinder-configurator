import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, X, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { cylinderSeries } from '@/data';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatNumber } from '@/lib/utils';

export function Compare() {
  const { compareIds, toggleCompare, clearCompare, applyRecommendation } = useConfiguratorStore();

  const selected = useMemo(
    () => compareIds.map((id) => cylinderSeries.find((c) => c.id === id)).filter(Boolean) as typeof cylinderSeries,
    [compareIds],
  );

  const allSeries = cylinderSeries;

  const rows: { label: string; key: keyof (typeof cylinderSeries)[number]; format?: (v: number) => string }[] = [
    { label: 'Max Force', key: 'maxThrust', format: (v) => `${formatNumber(v)} N` },
    { label: 'Max Payload', key: 'maxPayload', format: (v) => `${v} kg` },
    { label: 'Max Speed', key: 'maxSpeed', format: (v) => `${formatNumber(v)} mm/s` },
    { label: 'Max Stroke', key: 'maxStroke', format: (v) => `${formatNumber(v)} mm` },
    { label: 'Repeatability', key: 'repeatability', format: (v) => `±${v} mm` },
    { label: 'Weight', key: 'weight', format: (v) => `${v} kg` },
  ];

  const handleSelect = (cylId: string) => {
    const cyl = cylinderSeries.find((c) => c.id === cylId);
    if (!cyl) return;
    // Apply a basic configuration with this cylinder
    applyRecommendation({
      cylinderId: cylId,
      transmission: cyl.compatibleTransmissions[0],
      screwId: null,
      beltId: null,
      motorId: null,
      driveId: null,
      encoderId: null,
      brake: false,
      sensors: [],
      accessories: [],
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
            <h1 className="text-2xl font-semibold tracking-tight">Compare Platforms</h1>
          </div>
          <p className="mt-1 text-sm text-muted">Compare up to 3 cylinder series side by side. {selected.length}/3 selected.</p>
        </div>
        {selected.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCompare}>
            <X size={12} /> Clear All
          </Button>
        )}
      </div>

      {/* Selection chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {allSeries.map((cyl) => {
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
          <h3 className="mt-4 text-base font-semibold">No platforms selected</h3>
          <p className="mt-1 max-w-sm text-sm text-muted">Select up to 3 cylinder series above to compare their specifications.</p>
          <Link to="/configurator" className="mt-4">
            <Button variant="outline" size="sm">Go to Configurator</Button>
          </Link>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-ink/[0.02]">
                  <th className="sticky left-0 bg-ink/[0.02] px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">
                    Specification
                  </th>
                  {selected.map((cyl) => (
                    <th key={cyl.id} className="px-5 py-3 text-left min-w-[180px]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="num text-base font-semibold text-ink">{cyl.model}</p>
                          <p className="text-2xs text-muted">{cyl.positioning}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCompare(cyl.id)}
                          className="rounded p-1 text-muted hover:bg-ink/10 hover:text-ink"
                          aria-label={`Remove ${cyl.model} from comparison`}
                        >
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
                          {isBest && <Badge tone="ok" className="ml-2">Best</Badge>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="hover:bg-ink/[0.02]">
                  <td className="sticky left-0 bg-surface px-5 py-3 text-xs font-medium text-muted">Protection</td>
                  {selected.map((cyl) => (
                    <td key={cyl.id} className="px-5 py-3 font-medium">{cyl.protection}</td>
                  ))}
                </tr>
                <tr className="hover:bg-ink/[0.02]">
                  <td className="sticky left-0 bg-surface px-5 py-3 text-xs font-medium text-muted">Compatible Transmissions</td>
                  {selected.map((cyl) => (
                    <td key={cyl.id} className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {cyl.compatibleTransmissions.map((t) => (
                          <span key={t} className="rounded bg-ink/5 px-1.5 py-0.5 text-2xs text-muted capitalize">{t.replace('_', ' ')}</span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-ink/[0.02]">
                  <td className="sticky left-0 bg-surface px-5 py-3 text-xs font-medium text-muted">Recommended Application</td>
                  {selected.map((cyl) => (
                    <td key={cyl.id} className="px-5 py-3 text-xs text-muted">{cyl.recommendedApplication}</td>
                  ))}
                </tr>
                <tr>
                  <td className="sticky left-0 bg-surface px-5 py-3"></td>
                  {selected.map((cyl) => (
                    <td key={cyl.id} className="px-5 py-3">
                      <Button variant="primary" size="sm" className="w-full" onClick={() => handleSelect(cyl.id)}>
                        Use {cyl.model} <ArrowRight size={12} />
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <p className="mt-4 text-center text-2xs text-muted">
        Demo engineering data. Final values are subject to verified product specifications.
      </p>
    </div>
  );
}
