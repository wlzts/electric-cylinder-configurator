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
import { formatNumber } from '@/lib/utils';

export function ReviewStep() {
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
    { label: 'Mechanical', items: [['Platform', cyl?.model ?? '—'], ['Stroke', `${formatNumber(configuration.stroke)} mm`], ['Protection', cyl?.protection ?? '—']] },
    { label: 'Transmission', items: [['Type', configuration.transmission?.replace('_', ' ') ?? '—'], ['Screw/Belt', screw ? `Ø${screw.diameter} L${screw.lead} ${screw.accuracy}` : belt ? `${belt.series} ${belt.pitch} ${belt.width}mm` : '—']] },
    { label: 'Motor', items: [['Motor', motor?.name ?? '—'], ['Power', motor ? `${motor.power}W` : '—'], ['Brake', configuration.brake ? 'With Brake' : 'No Brake']] },
    { label: 'Drive & Control', items: [['Drive', drive?.name ?? '—'], ['Encoder', encoder?.name ?? '—'], ['Communication', proto?.name ?? '—']] },
    { label: 'Sensors', items: configuration.sensors.length > 0 ? configuration.sensors.map((id, i) => [`Sensor ${i + 1}`, sensors.find((s) => s.id === id)?.name ?? id]) : [['Sensors', 'None']] },
    { label: 'Accessories', items: configuration.accessories.length > 0 ? configuration.accessories.map((id, i) => [`Accessory ${i + 1}`, accessories.find((a) => a.id === id)?.name ?? id]) : [['Accessories', 'None']] },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-label">Configuration Code</p>
            <h2 className="mt-1 num text-2xl font-semibold tracking-tight">{code || '—'}</h2>
            <p className="mt-1 text-xs text-muted">Generated automatically from your selections.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge tone={compat.status}>{compat.status}</Badge>
            <div className="flex gap-2">
              <Link to="/review"><Button variant="primary" size="sm"><FileText size={12} /> Full Review</Button></Link>
              <Link to="/quote"><Button variant="secondary" size="sm"><ClipboardList size={12} /> Request Quote</Button></Link>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration groups */}
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

      {/* Performance */}
      <div className="card p-5">
        <h3 className="mb-3 text-sm font-semibold">Performance Summary <span className="ml-1 text-2xs font-normal text-muted">(Demo)</span></h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Perf label="Rated Thrust" value={perf.ratedThrust} unit="N" />
          <Perf label="Max Speed" value={perf.maxSpeed} unit="mm/s" />
          <Perf label="Safety Factor" value={perf.safetyFactor} digits={2} />
          <Perf label="Est. Life" value={perf.estimatedLife} unit="h" />
        </div>
      </div>

      {/* BOM preview */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-ink/[0.02] px-5 py-3">
          <h3 className="text-sm font-semibold">Bill of Materials ({bom.length} items)</h3>
          <Link to="/review"><span className="text-xs font-medium text-accent hover:underline">View full BOM <ArrowRight size={10} className="inline" /></span></Link>
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
            Request Engineering Quote <ArrowRight size={16} />
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
