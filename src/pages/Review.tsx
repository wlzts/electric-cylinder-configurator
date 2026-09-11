import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download, Copy, FileJson, FileSpreadsheet, Printer, Package, Cpu,
  AlertTriangle, CheckCircle2, XCircle, RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { ProductVisualizer } from '@/components/visualizer/ProductVisualizer';
import { PerformanceCard } from '@/components/ui/PerformanceCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { generateConfigurationCode, generateConfigurationId } from '@/lib/codeGenerator';
import { generateBOM, bomToCSV } from '@/lib/bom';
import { calculatePerformance, ENGINEERING_CONFIG } from '@/engineering';
import { evaluateConfiguration } from '@/compatibility';
import { cylinderSeries, motors, ballScrews, timingBelts, drives, encoders, protocols, sensors, accessories, transmissions } from '@/data';
import { copyToClipboard, downloadFile, formatNumber } from '@/lib/utils';

export function Review() {
  const { configuration, requirements, resetConfiguration } = useConfiguratorStore();
  const [copied, setCopied] = useState(false);
  const [configId] = useState(() => generateConfigurationId());

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
  const transmission = transmissions.find((t) => t.kind === configuration.transmission);

  const handleCopyCode = async () => {
    await copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadJSON = () => {
    const data = {
      configurationId: configId,
      configurationCode: code,
      configuration,
      applicationRequirements: requirements,
      performance: perf,
      bom,
      compatibility: compat,
      exportedAt: new Date().toISOString(),
      notice: 'Demo engineering data. Final values subject to verified product specifications.',
    };
    downloadFile(`${code || 'configuration'}.json`, JSON.stringify(data, null, 2), 'application/json');
  };

  const handleDownloadBOM = () => {
    downloadFile(`${code || 'configuration'}-BOM.csv`, bomToCSV(bom), 'text/csv');
  };

  const handlePrint = () => window.print();

  const handleReset = () => {
    if (window.confirm('Reset configuration? This will clear all selections.')) {
      resetConfiguration();
    }
  };

  const sections = [
    {
      label: 'Mechanical',
      items: [
        ['Cylinder Series', cyl ? `${cyl.model} — ${cyl.positioning}` : 'Not configured'],
        ['Stroke', `${formatNumber(configuration.stroke)} mm`],
        ['Max Payload', cyl ? `${cyl.maxPayload} kg` : '—'],
        ['Protection', cyl?.protection ?? '—'],
      ],
    },
    {
      label: 'Transmission',
      items: [
        ['Type', transmission?.name ?? '—'],
        ['Details', screw ? `Ø${screw.diameter} × Lead ${screw.lead} mm, ${screw.accuracy}, ${screw.preload} preload` : belt ? `${belt.series} ${belt.pitch}, ${belt.width}mm ${belt.material}, ${belt.cord} cord` : '—'],
        ['Max Stroke (element)', screw ? `${formatNumber(screw.maxStroke)} mm` : belt ? '—' : '—'],
      ],
    },
    {
      label: 'Motor',
      items: [
        ['Motor', motor ? `${motor.brand} ${motor.model} — ${motor.name}` : 'Not configured'],
        ['Power', motor ? `${motor.power} W` : '—'],
        ['Rated / Peak Torque', motor ? `${motor.ratedTorque} / ${motor.peakTorque} Nm` : '—'],
        ['Rated / Max RPM', motor ? `${formatNumber(motor.ratedRPM)} / ${formatNumber(motor.maxRPM)}` : '—'],
        ['Brake', configuration.brake ? 'With Brake' : 'No Brake'],
      ],
    },
    {
      label: 'Drive & Communication',
      items: [
        ['Drive', drive ? `${drive.brand} ${drive.model} — ${drive.name}` : 'Not configured'],
        ['Voltage', drive?.voltage ?? '—'],
        ['Control Modes', drive ? drive.controlModes.join(', ') : '—'],
        ['Communication', proto?.name ?? '—'],
      ],
    },
    {
      label: 'Encoder & Sensors',
      items: [
        ['Encoder', encoder ? `${encoder.name} (${encoder.resolution})` : '—'],
        ['Power-off Retention', encoder ? (encoder.powerOffRetention ? 'Yes' : 'No') : '—'],
        ['Sensors', configuration.sensors.length > 0 ? configuration.sensors.map((id) => sensors.find((s) => s.id === id)?.name ?? id).join(', ') : 'None'],
      ],
    },
    {
      label: 'Accessories',
      items: configuration.accessories.length > 0
        ? configuration.accessories.map((id, i) => [`Accessory ${i + 1}`, accessories.find((a) => a.id === id)?.name ?? id])
        : [['Accessories', 'None']],
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-label">Your Configuration</p>
            <h1 className="mt-1 num text-3xl font-semibold tracking-tight">{code || 'Configuration incomplete'}</h1>
            <p className="mt-1 text-xs text-muted">Configuration ID: {configId}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={compat.status}>{compat.status}</Badge>
            <Button variant="outline" size="sm" onClick={handleCopyCode}>
              <Copy size={12} /> {copied ? 'Copied' : 'Copy Code'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw size={12} /> Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Visual + performance */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <ProductVisualizer config={configuration} />
        </div>
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Cpu size={14} className="text-muted" />
              Real-time Performance
              <span className="ml-auto rounded bg-accent/10 px-1.5 py-0.5 text-2xs text-accent-deep">Demo</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <PerformanceCard label="Rated Thrust" value={perf.ratedThrust} unit="N" />
              <PerformanceCard label="Peak Thrust" value={perf.peakThrust} unit="N" />
              <PerformanceCard label="Max Speed" value={perf.maxSpeed} unit="mm/s" />
              <PerformanceCard label="Repeatability" value={perf.repeatability} unit="mm" digits={3} />
              <PerformanceCard label="Motor RPM" value={perf.motorRPM} unit="rpm" />
              <PerformanceCard label="Motor Torque" value={perf.motorTorque} unit="Nm" digits={2} />
              <PerformanceCard
                label="Safety Factor"
                value={perf.safetyFactor}
                digits={2}
                tone={perf.safetyFactor && perf.safetyFactor >= ENGINEERING_CONFIG.safetyFactor.recommended ? 'ok' : perf.safetyFactor && perf.safetyFactor >= ENGINEERING_CONFIG.safetyFactor.acceptable ? 'warn' : 'bad'}
                note={perf.safetyFactor ? (perf.safetyFactor >= ENGINEERING_CONFIG.safetyFactor.recommended ? 'Recommended' : perf.safetyFactor >= ENGINEERING_CONFIG.safetyFactor.acceptable ? 'Acceptable' : 'Risk') : undefined}
              />
              <PerformanceCard label="Est. Life" value={perf.estimatedLife} unit="h" />
            </div>
          </div>

          {/* Downloads */}
          <div className="card p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Package size={14} className="text-muted" />
              Downloads
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadJSON}>
                <FileJson size={12} /> Config JSON
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadBOM}>
                <FileSpreadsheet size={12} /> BOM CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer size={12} /> Print / PDF
              </Button>
              <Button variant="outline" size="sm" disabled title="CAD integration will be available after product data service is connected.">
                <Download size={12} /> CAD / STEP
              </Button>
            </div>
            <p className="mt-2 text-2xs text-muted">CAD / STEP files require product data service connection.</p>
          </div>
        </div>
      </div>

      {/* Configuration details */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold">Configuration Details</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, i) => (
            <motion.div
              key={section.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-4"
            >
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{section.label}</h3>
              <dl className="space-y-1.5">
                {section.items.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-2 text-xs">
                    <dt className="text-muted shrink-0">{label}</dt>
                    <dd className="text-right font-medium text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          ))}
        </div>
      </div>

      {/* BOM */}
      <div className="mt-6 card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-ink/[0.02] px-5 py-3">
          <h3 className="text-sm font-semibold">Bill of Materials ({bom.length} items)</h3>
          <Button variant="ghost" size="sm" onClick={handleDownloadBOM}>
            <Download size={12} /> Export CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="px-5 py-2 font-medium">Part Number</th>
                <th className="px-5 py-2 font-medium">Description</th>
                <th className="px-5 py-2 font-medium">Brand</th>
                <th className="px-5 py-2 font-medium text-center">Qty</th>
                <th className="px-5 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {bom.map((item) => (
                <tr key={item.partNumber} className="hover:bg-ink/[0.02]">
                  <td className="num px-5 py-2 font-mono font-medium">{item.partNumber}</td>
                  <td className="px-5 py-2">{item.description}</td>
                  <td className="px-5 py-2 text-muted">{item.brand}</td>
                  <td className="num px-5 py-2 text-center">{item.qty}</td>
                  <td className="px-5 py-2">
                    <span className={`rounded px-1.5 py-0.5 text-2xs ${item.status === 'included' ? 'bg-ok/10 text-ok' : 'bg-warn/10 text-warn'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engineering status */}
      <div className={`mt-6 card p-5 ${compat.status === 'incompatible' ? 'ring-1 ring-bad/30' : ''}`}>
        <div className="flex items-center gap-3">
          {compat.status === 'recommended' || compat.status === 'compatible' ? (
            <CheckCircle2 size={20} className="text-ok" />
          ) : compat.status === 'warning' ? (
            <AlertTriangle size={20} className="text-warn" />
          ) : (
            <XCircle size={20} className="text-bad" />
          )}
          <div>
            <h3 className="text-sm font-semibold">
              {compat.status === 'recommended' || compat.status === 'compatible' ? 'Configuration Valid' : compat.status === 'warning' ? 'Configuration Requires Attention' : 'Configuration Not Valid'}
            </h3>
            <p className="text-xs text-muted">{compat.reasons[0] ?? 'All checks passed.'}</p>
          </div>
        </div>
        {compat.reasons.length > 1 && (
          <ul className="mt-3 space-y-1">
            {compat.reasons.slice(1).map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 text-2xs text-muted">
                <span className="mt-0.5">•</span> {r}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <Link to="/configurator">
          <Button variant="ghost">← Back to Configurator</Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadJSON}>
            <FileJson size={14} /> Download JSON
          </Button>
          <Link to="/quote">
            <Button variant="secondary" size="lg">
              Request Engineering Quote →
            </Button>
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-2xs text-muted">
        Demo engineering data. Final values are subject to verified product specifications. Configuration is stored locally in your browser.
      </p>
    </div>
  );
}
