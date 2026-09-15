import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Gauge } from 'lucide-react';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import {
  calculatePerformance,
  calculateRequiredThrust,
  calculateMotorTorque,
  calculateMotorRPM,
  calculateScrewCriticalSpeed,
  calculateSafetyFactor,
  ENGINEERING_CONFIG,
} from '@/engineering';
import { evaluateConfiguration } from '@/compatibility';
import { cylinderSeries, motors, ballScrews, drives, protocols, accessories } from '@/data';
import { PerformanceCard } from '@/components/ui/PerformanceCard';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/i18n';
import type { EngineeringCheckItem, EngineeringCheckResult } from '@/types';
import { formatNumber } from '@/lib/utils';

export function EngineeringCheckStep() {
  const { t } = useI18n();
  const { configuration, requirements } = useConfiguratorStore();

  const check = useMemo<EngineeringCheckResult>(() => {
    const items: EngineeringCheckItem[] = [];
    const cyl = cylinderSeries.find((c) => c.id === configuration.cylinderId);
    const motor = motors.find((m) => m.id === configuration.motorId);
    const screw = ballScrews.find((s) => s.id === configuration.screwId);
    const drive = drives.find((d) => d.id === configuration.driveId);

    const requiredThrust = calculateRequiredThrust(requirements);
    const motorTorque = calculateMotorTorque(requirements, configuration);
    const motorRPM = calculateMotorRPM(requirements, configuration);
    const criticalSpeed = configuration.transmission === 'timing_belt' ? null : calculateScrewCriticalSpeed(configuration, configuration.stroke);
    const safetyFactor = calculateSafetyFactor(requirements, configuration);
    const perf = calculatePerformance(requirements, configuration);

    // 1. Required thrust
    if (cyl) {
      items.push({
        id: 'thrust',
        label: 'Required Thrust',
        status: cyl.maxThrust >= requiredThrust ? 'PASS' : 'FAIL',
        explanation: `Required ${Math.round(requiredThrust)} N, available ${cyl.maxThrust} N (${(cyl.maxThrust / requiredThrust).toFixed(2)}×).`,
      });
    }

    // 2. Peak thrust
    if (cyl && perf.peakThrust) {
      items.push({
        id: 'peak_thrust',
        label: 'Peak Thrust Capability',
        status: perf.peakThrust >= requiredThrust * 1.2 ? 'PASS' : 'WARNING',
        explanation: `Peak ${Math.round(perf.peakThrust)} N vs required ${Math.round(requiredThrust * 1.2)} N (with 20% margin).`,
      });
    }

    // 3. Motor torque
    if (motor && motorTorque) {
      items.push({
        id: 'motor_torque',
        label: 'Motor Torque',
        status: motor.ratedTorque >= motorTorque ? 'PASS' : motor.peakTorque >= motorTorque ? 'WARNING' : 'FAIL',
        explanation: `Required ${motorTorque.toFixed(2)} Nm, rated ${motor.ratedTorque} Nm, peak ${motor.peakTorque} Nm.`,
      });
    }

    // 4. Motor speed
    if (motor && motorRPM) {
      items.push({
        id: 'motor_speed',
        label: 'Motor Speed',
        status: motor.maxRPM >= motorRPM ? 'PASS' : 'FAIL',
        explanation: `Required ${Math.round(motorRPM)} RPM, max ${motor.maxRPM} RPM.`,
      });
    }

    // 5. Screw critical speed
    if (criticalSpeed && motorRPM) {
      const margin = ENGINEERING_CONFIG.criticalSpeedMargin;
      items.push({
        id: 'critical_speed',
        label: 'Screw Critical Speed',
        status: motorRPM <= criticalSpeed * margin ? 'PASS' : 'WARNING',
        explanation: `Critical ${Math.round(criticalSpeed)} RPM, operating ${Math.round(motorRPM)} RPM (limit ${Math.round(criticalSpeed * margin)} RPM at ${(margin * 100).toFixed(0)}% margin).`,
      });
    }

    // 6. Stroke limit
    if (cyl) {
      const screwMax = screw?.maxStroke ?? Infinity;
      items.push({
        id: 'stroke',
        label: 'Stroke Limit',
        status: configuration.stroke <= Math.min(cyl.maxStroke, screwMax) ? 'PASS' : 'FAIL',
        explanation: `Configured ${configuration.stroke} mm, cylinder max ${cyl.maxStroke} mm${screw ? `, screw max ${screw.maxStroke} mm` : ''}.`,
      });
    }

    // 7. Cylinder payload
    if (cyl) {
      items.push({
        id: 'payload',
        label: 'Cylinder Payload',
        status: requirements.payload <= cyl.maxPayload ? 'PASS' : 'FAIL',
        explanation: `Required ${requirements.payload} kg, max ${cyl.maxPayload} kg.`,
      });
    }

    // 8. Drive compatibility
    if (drive && motor) {
      items.push({
        id: 'drive',
        label: 'Drive Compatibility',
        status: drive.motorCompatibility.includes(motor.id) ? 'PASS' : 'FAIL',
        explanation: drive.motorCompatibility.includes(motor.id)
          ? `${drive.name} supports ${motor.name}.`
          : `${drive.name} does not support ${motor.name}.`,
      });
    }

    // 9. Brake recommendation
    items.push({
      id: 'brake',
      label: 'Brake Recommendation',
      status: requirements.orientation === 'vertical' && !configuration.brake ? 'WARNING' : 'PASS',
      explanation: requirements.orientation === 'vertical' && !configuration.brake
        ? 'Brake is recommended for vertical applications to reduce risk of load drop during power loss.'
        : configuration.brake ? 'Brake selected.' : 'Brake not required for horizontal installation.',
    });

    // 10. Communication compatibility
    if (drive && configuration.communicationId) {
      const proto = protocols.find((p) => p.id === configuration.communicationId);
      items.push({
        id: 'comm',
        label: 'Communication Compatibility',
        status: drive.communication.includes(configuration.communicationId) ? 'PASS' : 'FAIL',
        explanation: drive.communication.includes(configuration.communicationId)
          ? `${drive.name} supports ${proto?.name ?? configuration.communicationId}.`
          : `${drive.name} does not support ${proto?.name ?? configuration.communicationId}.`,
      });
    }

    // 11. Accessory compatibility
    const accIssues = configuration.accessories.filter((aid) => {
      const acc = accessories.find((a) => a.id === aid);
      return acc && cyl && !acc.compatibleSeries.includes(cyl.id);
    });
    items.push({
      id: 'accessories',
      label: 'Accessory Compatibility',
      status: accIssues.length === 0 ? 'PASS' : 'FAIL',
      explanation: accIssues.length === 0
        ? 'All selected accessories are compatible.'
        : `${accIssues.length} accessory(ies) not compatible with selected cylinder.`,
    });

    // 12. Safety factor
    if (safetyFactor !== null) {
      items.push({
        id: 'safety',
        label: 'Safety Factor',
        status: safetyFactor >= ENGINEERING_CONFIG.safetyFactor.recommended ? 'PASS' : safetyFactor >= ENGINEERING_CONFIG.safetyFactor.acceptable ? 'WARNING' : 'FAIL',
        explanation: `Safety factor ${safetyFactor.toFixed(2)} (recommended ≥${ENGINEERING_CONFIG.safetyFactor.recommended}, acceptable ≥${ENGINEERING_CONFIG.safetyFactor.acceptable}).`,
      });
    }

    const passed = items.filter((i) => i.status === 'PASS').length;
    const warnings = items.filter((i) => i.status === 'WARNING').length;
    const failures = items.filter((i) => i.status === 'FAIL').length;
    const overall: EngineeringCheckResult['overall'] = failures > 0 ? 'invalid' : warnings > 0 ? 'attention' : 'valid';

    return { items, passed, warnings, failures, overall };
  }, [configuration, requirements]);

  const perf = useMemo(() => calculatePerformance(requirements, configuration), [requirements, configuration]);
  const compat = useMemo(() => evaluateConfiguration(configuration, requirements), [configuration, requirements]);

  const overallTone = check.overall === 'valid' ? 'ok' : check.overall === 'attention' ? 'warn' : 'bad';
  const overallLabel = check.overall === 'valid' ? t('eng_valid') : check.overall === 'attention' ? t('eng_attention') : t('eng_invalid');

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className={`card p-5 ${check.overall !== 'invalid' ? '' : 'ring-1 ring-bad/30'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${check.overall === 'valid' ? 'bg-ok/10' : check.overall === 'attention' ? 'bg-warn/10' : 'bg-bad/10'}`}>
              {check.overall === 'valid' ? <CheckCircle2 size={24} className="text-ok" /> : check.overall === 'attention' ? <AlertTriangle size={24} className="text-warn" /> : <XCircle size={24} className="text-bad" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{overallLabel}</h2>
              <p className="text-xs text-muted">
                {t('eng_summary', { passed: check.passed, warnings: check.warnings, failures: check.failures })}
              </p>
            </div>
          </div>
          <Badge tone={overallTone}>{compat.status}</Badge>
        </div>
      </div>

      {/* Performance snapshot */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Gauge size={14} className="text-muted" />
          <h3 className="text-sm font-semibold">{t('eng_perf_snapshot')}</h3>
          <span className="rounded bg-accent/10 px-1.5 py-0.5 text-2xs text-accent-deep">{t('common_demo_calc')}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <PerformanceCard label={t('perf_rated_thrust')} value={perf.ratedThrust} unit="N" />
          <PerformanceCard label={t('perf_max_speed')} value={perf.maxSpeed} unit="mm/s" />
          <PerformanceCard label={t('perf_motor_rpm')} value={perf.motorRPM} unit="rpm" />
          <PerformanceCard label={t('perf_safety')} value={perf.safetyFactor} digits={2} tone={perf.safetyFactor && perf.safetyFactor >= ENGINEERING_CONFIG.safetyFactor.recommended ? 'ok' : perf.safetyFactor && perf.safetyFactor >= ENGINEERING_CONFIG.safetyFactor.acceptable ? 'warn' : 'bad'} />
          <PerformanceCard label={t('perf_life')} value={perf.estimatedLife} unit="h" />
        </div>
      </div>

      {/* Check list */}
      <div className="card overflow-hidden">
        <div className="border-b border-line bg-ink/[0.02] px-5 py-3">
          <h3 className="text-sm font-semibold">{t('eng_checks_title')}</h3>
        </div>
        <div className="divide-y divide-line">
          {check.items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-3 px-5 py-3"
            >
              <span className="mt-0.5 shrink-0">
                {item.status === 'PASS' && <CheckCircle2 size={16} className="text-ok" />}
                {item.status === 'WARNING' && <AlertTriangle size={16} className="text-warn" />}
                {item.status === 'FAIL' && <XCircle size={16} className="text-bad" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{item.label}</span>
                  <span className={`rounded px-1.5 py-0.5 text-2xs font-semibold ${item.status === 'PASS' ? 'bg-ok/10 text-ok' : item.status === 'WARNING' ? 'bg-warn/10 text-warn' : 'bg-bad/10 text-bad'}`}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-0.5 text-2xs text-muted">{item.explanation}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <p className="rounded-lg bg-accent/5 px-3 py-2 text-2xs text-muted">
        {t('eng_demo_note')} Required thrust: {formatNumber(calculateRequiredThrust(requirements))} N.
      </p>
    </div>
  );
}
