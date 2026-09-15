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
import { useI18n } from '@/i18n';

export function Review() {
  const { t } = useI18n();
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
  const transmission = transmissions.find((tr) => tr.kind === configuration.transmission);

  const handleCopyCode = async () => { await copyToClipboard(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const handleDownloadJSON = () => {
    const data = { configurationId: configId, configurationCode: code, configuration, applicationRequirements: requirements, performance: perf, bom, compatibility: compat, exportedAt: new Date().toISOString(), notice: t('common_demo_notice') };
    downloadFile(`${code || 'configuration'}.json`, JSON.stringify(data, null, 2), 'application/json');
  };
  const handleDownloadBOM = () => { downloadFile(`${code || 'configuration'}-BOM.csv`, bomToCSV(bom), 'text/csv'); };
  const handlePrint = () => window.print();
  const handleReset = () => { if (window.confirm(t('review_reset_confirm'))) resetConfiguration(); };

  const sections = [
    { label: t('review_mechanical'), items: [
      [t('review_cylinder'), cyl ? `${cyl.model} — ${cyl.positioning}` : t('common_not_configured')],
      [t('cfg_stroke'), `${formatNumber(configuration.stroke)} mm`],
      [t('review_max_payload'), cyl ? `${cyl.maxPayload} kg` : '—'],
      [t('platform_protection'), cyl?.protection ?? '—'],
    ]},
    { label: t('review_transmission'), items: [
      [t('review_type'), transmission?.name ?? '—'],
      [t('review_details'), screw ? `Ø${screw.diameter} × Lead ${screw.lead} mm, ${screw.accuracy}, ${screw.preload}` : belt ? `${belt.series} ${belt.pitch}, ${belt.width}mm` : '—'],
      [t('platform_max_stroke'), screw ? `${formatNumber(screw.maxStroke)} mm` : '—'],
    ]},
    { label: t('review_motor'), items: [
      [t('review_motor'), motor ? `${motor.brand} ${motor.model}` : t('common_not_configured')],
      [t('review_power'), motor ? `${motor.power} W` : '—'],
      [t('review_torque'), motor ? `${motor.ratedTorque} / ${motor.peakTorque} Nm` : '—'],
      [t('review_rpm'), motor ? `${formatNumber(motor.ratedRPM)} / ${formatNumber(motor.maxRPM)}` : '—'],
      [t('review_brake'), configuration.brake ? t('cfg_with_brake') : t('cfg_no_brake')],
    ]},
    { label: t('review_drive_comm'), items: [
      [t('cfg_drive'), drive ? `${drive.brand} ${drive.model}` : t('common_not_configured')],
      [t('review_voltage'), drive?.voltage ?? '—'],
      [t('review_control'), drive ? drive.controlModes.join(', ') : '—'],
      [t('cfg_comm'), proto?.name ?? '—'],
    ]},
    { label: t('review_enc_sensors'), items: [
      [t('cfg_encoder'), encoder ? `${encoder.name} (${encoder.resolution})` : '—'],
      [t('review_retention'), encoder ? (encoder.powerOffRetention ? t('enc_yes') : t('enc_no')) : '—'],
      [t('review_sensors'), configuration.sensors.length > 0 ? configuration.sensors.map((id) => sensors.find((s) => s.id === id)?.name ?? id).join(', ') : t('review_none')],
    ]},
    { label: t('review_accessories'), items: configuration.accessories.length > 0
      ? configuration.accessories.map((id, i) => [`${t('review_accessories')} ${i + 1}`, accessories.find((a) => a.id === id)?.name ?? id])
      : [[t('review_accessories'), t('review_none')]],
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-label">{t('review_your_config')}</p>
            <h1 className="mt-1 num text-3xl font-semibold tracking-tight">{code || t('review_incomplete')}</h1>
            <p className="mt-1 text-xs text-muted">{t('review_config_id')}: {configId}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={compat.status}>{t(`st_${compat.status}` as const)}</Badge>
            <Button variant="outline" size="sm" onClick={handleCopyCode}>
              <Copy size={12} /> {copied ? t('btn_copied') : t('btn_copy')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw size={12} /> {t('btn_reset')}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <ProductVisualizer config={configuration} />
        </div>
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Cpu size={14} className="text-muted" />
              {t('cfg_performance')}
              <span className="ml-auto rounded bg-accent/10 px-1.5 py-0.5 text-2xs text-accent-deep">{t('common_demo')}</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <PerformanceCard label={t('perf_rated_thrust')} value={perf.ratedThrust} unit="N" />
              <PerformanceCard label={t('perf_peak_thrust')} value={perf.peakThrust} unit="N" />
              <PerformanceCard label={t('perf_max_speed')} value={perf.maxSpeed} unit="mm/s" />
              <PerformanceCard label={t('perf_repeatability')} value={perf.repeatability} unit="mm" digits={3} />
              <PerformanceCard label={t('perf_motor_rpm')} value={perf.motorRPM} unit="rpm" />
              <PerformanceCard label={t('perf_motor_torque')} value={perf.motorTorque} unit="Nm" digits={2} />
              <PerformanceCard
                label={t('perf_safety')} value={perf.safetyFactor} digits={2}
                tone={perf.safetyFactor && perf.safetyFactor >= ENGINEERING_CONFIG.safetyFactor.recommended ? 'ok' : perf.safetyFactor && perf.safetyFactor >= ENGINEERING_CONFIG.safetyFactor.acceptable ? 'warn' : 'bad'}
                note={perf.safetyFactor ? (perf.safetyFactor >= ENGINEERING_CONFIG.safetyFactor.recommended ? t('st_recommended_sf') : perf.safetyFactor >= ENGINEERING_CONFIG.safetyFactor.acceptable ? t('st_acceptable') : t('st_risk')) : undefined}
              />
              <PerformanceCard label={t('perf_life')} value={perf.estimatedLife} unit="h" />
            </div>
          </div>

          <div className="card p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Package size={14} className="text-muted" /> {t('review_downloads')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadJSON}><FileJson size={12} /> {t('review_config_json')}</Button>
              <Button variant="outline" size="sm" onClick={handleDownloadBOM}><FileSpreadsheet size={12} /> {t('review_bom_csv')}</Button>
              <Button variant="outline" size="sm" onClick={handlePrint}><Printer size={12} /> {t('review_print')}</Button>
              <Button variant="outline" size="sm" disabled title={t('review_cad_disabled')}>
                <Download size={12} /> {t('review_cad')}
              </Button>
            </div>
            <p className="mt-2 text-2xs text-muted">{t('review_cad_note')}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold">{t('review_config_details')}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, i) => (
            <motion.div key={section.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-4">
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

      <div className="mt-6 card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-ink/[0.02] px-5 py-3">
          <h3 className="text-sm font-semibold">{t('review_bom')} ({bom.length} {t('review_items')})</h3>
          <Button variant="ghost" size="sm" onClick={handleDownloadBOM}>
            <Download size={12} /> CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="px-5 py-2 font-medium">{t('review_part_no')}</th>
                <th className="px-5 py-2 font-medium">{t('review_description')}</th>
                <th className="px-5 py-2 font-medium">{t('review_brand')}</th>
                <th className="px-5 py-2 font-medium text-center">{t('review_qty')}</th>
                <th className="px-5 py-2 font-medium">{t('review_status')}</th>
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
              {compat.status === 'recommended' || compat.status === 'compatible' ? t('eng_valid') : compat.status === 'warning' ? t('eng_attention') : t('eng_invalid')}
            </h3>
            <p className="text-xs text-muted">{compat.reasons[0] ?? t('review_all_pass')}</p>
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

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <Link to="/configurator">
          <Button variant="ghost">{t('review_back_cfg')}</Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadJSON}>
            <FileJson size={14} /> {t('btn_download')} JSON
          </Button>
          <Link to="/quote">
            <Button variant="secondary" size="lg">{t('cfg_quote_btn')} →</Button>
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-2xs text-muted">{t('common_demo_notice')} {t('review_local_note')}</p>
    </div>
  );
}
