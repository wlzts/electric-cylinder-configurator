import { useMemo, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings2,
  RotateCcw,
  Copy,
  Link2,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Gauge,
} from 'lucide-react';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { calculatePerformance, ENGINEERING_CONFIG } from '@/engineering';
import { evaluateConfiguration } from '@/compatibility';
import { cylinderSeries, motors, drives, encoders, protocols, ballScrews, timingBelts } from '@/data';
import { generateConfigurationCode } from '@/lib/codeGenerator';
import { buildShareLink } from '@/lib/share';
import { copyToClipboard, formatNumber, cn } from '@/lib/utils';
import { PerformanceCard } from '@/components/ui/PerformanceCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export function CurrentConfiguration({ compact = false }: { compact?: boolean }) {
  const { configuration, requirements, resetConfiguration } = useConfiguratorStore();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(!compact);

  const performance = useMemo(
    () => calculatePerformance(requirements, configuration),
    [requirements, configuration],
  );
  const compat = useMemo(
    () => evaluateConfiguration(configuration, requirements),
    [configuration, requirements],
  );
  const code = useMemo(() => generateConfigurationCode(configuration), [configuration]);

  const cyl = cylinderSeries.find((c) => c.id === configuration.cylinderId);
  const motor = motors.find((m) => m.id === configuration.motorId);
  const drive = drives.find((d) => d.id === configuration.driveId);
  const encoder = encoders.find((e) => e.id === configuration.encoderId);
  const proto = protocols.find((p) => p.id === configuration.communicationId);
  const screw = ballScrews.find((s) => s.id === configuration.screwId);
  const belt = timingBelts.find((b) => b.id === configuration.beltId);

  const sf = performance.safetyFactor;
  const sfTone =
    sf === null ? 'default' : sf >= ENGINEERING_CONFIG.safetyFactor.recommended ? 'ok' : sf >= ENGINEERING_CONFIG.safetyFactor.acceptable ? 'warn' : 'bad';
  const sfLabel = sf === null ? '—' : sf >= ENGINEERING_CONFIG.safetyFactor.recommended ? 'Recommended' : sf >= ENGINEERING_CONFIG.safetyFactor.acceptable ? 'Acceptable' : 'Risk';

  const handleCopy = async () => {
    await copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShare = async () => {
    const link = buildShareLink(configuration);
    await copyToClipboard(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    if (window.confirm('Reset current configuration? This cannot be undone.')) {
      resetConfiguration();
    }
  };

  const statusIcon =
    compat.status === 'recommended' || compat.status === 'compatible' ? (
      <CheckCircle2 size={14} className="text-ok" />
    ) : compat.status === 'warning' ? (
      <AlertTriangle size={14} className="text-warn" />
    ) : (
      <XCircle size={14} className="text-bad" />
    );

  if (compact) {
    return (
      <div className="rounded-card border border-line bg-surface p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 size={14} className="text-muted" />
            <span className="text-xs font-semibold">Current Configuration</span>
            <Badge tone={compat.status}>{compat.status}</Badge>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded p-1 text-muted hover:bg-ink/5"
            aria-label="Toggle configuration details"
          >
            <ChevronDown size={14} className={cn('transition-transform', expanded && 'rotate-180')} />
          </button>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <ConfigSummary
                cyl={cyl?.name}
                transmission={configuration.transmission}
                screw={screw ? `Ø${screw.diameter} L${screw.lead}` : belt ? `${belt.pitch} ${belt.width}mm` : undefined}
                stroke={configuration.stroke}
                motor={motor?.name}
                drive={drive?.name}
                encoder={encoder?.name}
                brake={configuration.brake}
                proto={proto?.name}
                code={code}
                performance={performance}
                sfTone={sfTone}
                sfLabel={sfLabel}
                onCopy={handleCopy}
                onShare={handleShare}
                onReset={handleReset}
                copied={copied}
                statusIcon={statusIcon}
                compatReasons={compat.reasons}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <aside className="sticky top-[7.5rem] hidden lg:block w-[340px] shrink-0 self-start">
      <div className="rounded-card border border-line bg-surface shadow-card overflow-hidden">
        <div className="border-b border-line bg-ink/[0.02] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 size={15} className="text-muted" />
              <h2 className="text-sm font-semibold">Current Configuration</h2>
            </div>
            <Badge tone={compat.status}>{compat.status}</Badge>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-2xs text-muted">
            {statusIcon}
            <span>{compat.reasons[0] ?? 'Configuration valid.'}</span>
          </div>
        </div>

        <div className="max-h-[calc(100vh-22rem)] overflow-y-auto p-4">
          <ConfigSummary
            cyl={cyl?.name}
            transmission={configuration.transmission}
            screw={screw ? `Ø${screw.diameter} L${screw.lead}` : belt ? `${belt.pitch} ${belt.width}mm` : undefined}
            stroke={configuration.stroke}
            motor={motor?.name}
            drive={drive?.name}
            encoder={encoder?.name}
            brake={configuration.brake}
            proto={proto?.name}
            code={code}
            performance={performance}
            sfTone={sfTone}
            sfLabel={sfLabel}
            onCopy={handleCopy}
            onShare={handleShare}
            onReset={handleReset}
            copied={copied}
            statusIcon={statusIcon}
            compatReasons={compat.reasons}
          />
        </div>

        <div className="border-t border-line p-3 space-y-2">
          <Link to="/review" className="block">
            <Button variant="primary" size="sm" className="w-full">
              Review Configuration
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleReset}>
              <RotateCcw size={12} /> Reset
            </Button>
            <Button variant="ghost" size="sm" className="flex-1" onClick={handleShare}>
              <Link2 size={12} /> Share
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
interface ConfigSummaryProps {
  cyl?: string;
  transmission: string | null;
  screw?: string;
  stroke: number;
  motor?: string;
  drive?: string;
  encoder?: string;
  brake: boolean;
  proto?: string;
  code: string;
  performance: ReturnType<typeof calculatePerformance>;
  sfTone: 'default' | 'ok' | 'warn' | 'bad';
  sfLabel: string;
  onCopy: () => void;
  onShare: () => void;
  onReset: () => void;
  copied: boolean;
  statusIcon: ReactNode;
  compatReasons: string[];
}

function ConfigSummary(props: ConfigSummaryProps) {
  const rows: { label: string; value: string }[] = [
    { label: 'Platform', value: props.cyl ?? 'Not configured' },
    { label: 'Transmission', value: props.transmission ? props.transmission.replace('_', ' ') : 'Not configured' },
    { label: 'Screw / Belt', value: props.screw ?? 'Not configured' },
    { label: 'Stroke', value: `${formatNumber(props.stroke)} mm` },
    { label: 'Motor', value: props.motor ?? 'Not configured' },
    { label: 'Drive', value: props.drive ?? 'Not configured' },
    { label: 'Encoder', value: props.encoder ?? 'Not configured' },
    { label: 'Brake', value: props.brake ? 'With Brake' : 'No Brake' },
    { label: 'Communication', value: props.proto ?? 'Not configured' },
  ];

  return (
    <div className="space-y-4">
      {/* Model code */}
      <div className="rounded-lg border border-line bg-bg p-2.5">
        <div className="flex items-center justify-between">
          <span className="text-2xs uppercase tracking-wider text-muted">Model Code</span>
          <button
            type="button"
            onClick={props.onCopy}
            className="flex items-center gap-1 text-2xs text-accent hover:underline"
            aria-label="Copy model code"
          >
            <Copy size={10} /> {props.copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="mt-1 num text-sm font-semibold tracking-tight text-ink break-all">
          {props.code || '—'}
        </p>
      </div>

      {/* Config rows */}
      <dl className="space-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-2 text-xs">
            <dt className="text-muted shrink-0">{row.label}</dt>
            <dd className="text-right font-medium text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      {/* Performance */}
      <div>
        <div className="mb-2 flex items-center gap-1.5">
          <Gauge size={12} className="text-muted" />
          <span className="text-2xs uppercase tracking-wider text-muted">Real-time Performance</span>
          <span className="rounded bg-accent/10 px-1 py-0.5 text-2xs text-accent-deep">Demo</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <PerformanceCard label="Rated Thrust" value={props.performance.ratedThrust} unit="N" />
          <PerformanceCard label="Peak Thrust" value={props.performance.peakThrust} unit="N" />
          <PerformanceCard label="Max Speed" value={props.performance.maxSpeed} unit="mm/s" />
          <PerformanceCard label="Repeatability" value={props.performance.repeatability} unit="mm" digits={3} />
          <PerformanceCard label="Motor RPM" value={props.performance.motorRPM} unit="rpm" />
          <PerformanceCard label="Motor Torque" value={props.performance.motorTorque} unit="Nm" digits={2} />
          <PerformanceCard label="Safety Factor" value={props.performance.safetyFactor} digits={2} tone={props.sfTone} note={props.sfLabel} />
          <PerformanceCard label="Est. Life" value={props.performance.estimatedLife} unit="h" />
        </div>
      </div>

      {/* Compatibility notes */}
      {props.compatReasons.length > 1 && (
        <div className="rounded-lg border border-warn/20 bg-warn/5 p-2.5">
          <p className="text-2xs font-medium text-warn mb-1">Engineering Notes</p>
          <ul className="space-y-1">
            {props.compatReasons.slice(0, 3).map((r, i) => (
              <li key={i} className="text-2xs leading-relaxed text-muted">{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
