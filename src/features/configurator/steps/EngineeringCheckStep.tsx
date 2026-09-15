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
        label: '所需推力',
        status: cyl.maxThrust >= requiredThrust ? 'PASS' : 'FAIL',
        explanation: `需求 ${Math.round(requiredThrust)} N，可用 ${cyl.maxThrust} N（${(cyl.maxThrust / requiredThrust).toFixed(2)} 倍）。`,
      });
    }

    // 2. Peak thrust
    if (cyl && perf.peakThrust) {
      items.push({
        id: 'peak_thrust',
        label: '峰值推力',
        status: perf.peakThrust >= requiredThrust * 1.2 ? 'PASS' : 'WARNING',
        explanation: `峰值 ${Math.round(perf.peakThrust)} N vs 需求 ${Math.round(requiredThrust * 1.2)} N（含20%余量）。`,
      });
    }

    // 3. Motor torque
    if (motor && motorTorque) {
      items.push({
        id: 'motor_torque',
        label: '电机扭矩',
        status: motor.ratedTorque >= motorTorque ? 'PASS' : motor.peakTorque >= motorTorque ? 'WARNING' : 'FAIL',
        explanation: `需求 ${motorTorque.toFixed(2)} Nm，额定 ${motor.ratedTorque} Nm，峰值 ${motor.peakTorque} Nm。`,
      });
    }

    // 4. Motor speed
    if (motor && motorRPM) {
      items.push({
        id: 'motor_speed',
        label: '电机转速',
        status: motor.maxRPM >= motorRPM ? 'PASS' : 'FAIL',
        explanation: `需求 ${Math.round(motorRPM)} RPM，最大 ${motor.maxRPM} RPM。`,
      });
    }

    // 5. Screw critical speed
    if (criticalSpeed && motorRPM) {
      const margin = ENGINEERING_CONFIG.criticalSpeedMargin;
      items.push({
        id: 'critical_speed',
        label: '丝杠临界转速',
        status: motorRPM <= criticalSpeed * margin ? 'PASS' : 'WARNING',
        explanation: `临界转速 ${Math.round(criticalSpeed)} RPM，工作转速 ${Math.round(motorRPM)} RPM（限值 ${Math.round(criticalSpeed * margin)} RPM，余量 ${(margin * 100).toFixed(0)}%）。`,
      });
    }

    // 6. Stroke limit
    if (cyl) {
      const screwMax = screw?.maxStroke ?? Infinity;
      items.push({
        id: 'stroke',
        label: '行程限制',
        status: configuration.stroke <= Math.min(cyl.maxStroke, screwMax) ? 'PASS' : 'FAIL',
        explanation: `配置 ${configuration.stroke} mm，缸筒最大 ${cyl.maxStroke} mm${screw ? `，丝杠最大 ${screw.maxStroke} mm` : ''}。`,
      });
    }

    // 7. Cylinder payload
    if (cyl) {
      items.push({
        id: 'payload',
        label: '负载能力',
        status: requirements.payload <= cyl.maxPayload ? 'PASS' : 'FAIL',
        explanation: `需求 ${requirements.payload} kg，最大 ${cyl.maxPayload} kg。`,
      });
    }

    // 8. Drive compatibility
    if (drive && motor) {
      items.push({
        id: 'drive',
        label: '驱动器兼容性',
        status: drive.motorCompatibility.includes(motor.id) ? 'PASS' : 'FAIL',
        explanation: drive.motorCompatibility.includes(motor.id)
          ? `${drive.name} 支持 ${motor.name}。`
          : `${drive.name} 不支持 ${motor.name}。`,
      });
    }

    // 9. Brake recommendation
    items.push({
      id: 'brake',
      label: '抱闸建议',
      status: requirements.orientation === 'vertical' && !configuration.brake ? 'WARNING' : 'PASS',
      explanation: requirements.orientation === 'vertical' && !configuration.brake
        ? '垂直安装建议使用抱闸，以降低断电时负载坠落风险。'
        : configuration.brake ? '已选择抱闸。' : '水平安装无需抱闸。',
    });

    // 10. Communication compatibility
    if (drive && configuration.communicationId) {
      const proto = protocols.find((p) => p.id === configuration.communicationId);
      items.push({
        id: 'comm',
        label: '通讯兼容性',
        status: drive.communication.includes(configuration.communicationId) ? 'PASS' : 'FAIL',
        explanation: drive.communication.includes(configuration.communicationId)
          ? `${drive.name} 支持 ${proto?.name ?? configuration.communicationId}。`
          : `${drive.name} 不支持 ${proto?.name ?? configuration.communicationId}。`,
      });
    }

    // 11. Accessory compatibility
    const accIssues = configuration.accessories.filter((aid) => {
      const acc = accessories.find((a) => a.id === aid);
      return acc && cyl && !acc.compatibleSeries.includes(cyl.id);
    });
    items.push({
      id: 'accessories',
      label: '附件兼容性',
      status: accIssues.length === 0 ? 'PASS' : 'FAIL',
      explanation: accIssues.length === 0
        ? '所有附件均兼容。'
        : `${accIssues.length} 个附件与所选电缸不兼容。`,
    });

    // 12. Safety factor
    if (safetyFactor !== null) {
      items.push({
        id: 'safety',
        label: '安全系数',
        status: safetyFactor >= ENGINEERING_CONFIG.safetyFactor.recommended ? 'PASS' : safetyFactor >= ENGINEERING_CONFIG.safetyFactor.acceptable ? 'WARNING' : 'FAIL',
        explanation: `安全系数 ${safetyFactor.toFixed(2)}（推荐 ≥${ENGINEERING_CONFIG.safetyFactor.recommended}，可接受 ≥${ENGINEERING_CONFIG.safetyFactor.acceptable}）。`,
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
        {t('eng_demo_note')} 所需推力：{formatNumber(calculateRequiredThrust(requirements))} N。
      </p>
    </div>
  );
}
