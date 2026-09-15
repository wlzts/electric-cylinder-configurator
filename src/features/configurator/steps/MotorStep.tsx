import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { motors, gearboxes } from '@/data';
import { checkMotor } from '@/compatibility';
import { OptionCard } from '@/components/ui/OptionCard';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/i18n';
import { formatNumber } from '@/lib/utils';
import type { MotorType } from '@/types';

const typeLabels: Record<MotorType, string> = {
  servo: '伺服电机',
  stepper: '步进电机',
  closed_loop_stepper: '闭环步进',
};

export function MotorStep() {
  const { t } = useI18n();
  const { configuration, requirements, setConfiguration, advancedMode } = useConfiguratorStore();

  const results = useMemo(
    () => motors.map((m) => ({ m, result: checkMotor(m, configuration, requirements) })),
    [configuration, requirements],
  );

  const types: MotorType[] = ['servo', 'closed_loop_stepper', 'stepper'];

  // Gearbox options: filter by selected motor flange compatibility
  const selectedMotor = motors.find((m) => m.id === configuration.motorId);
  const availableGearboxes = useMemo(() => {
    if (!selectedMotor) return gearboxes;
    // Simple compatibility: smaller motors match smaller gearboxes
    if (selectedMotor.power <= 400) return gearboxes.filter((g) => g.compatibleMotorFlanges.includes('60mm') || g.compatibleMotorFlanges.includes('80mm'));
    if (selectedMotor.power <= 1500) return gearboxes.filter((g) => g.compatibleMotorFlanges.includes('80mm') || g.compatibleMotorFlanges.includes('90mm') || g.compatibleMotorFlanges.includes('110mm'));
    return gearboxes.filter((g) => g.compatibleMotorFlanges.includes('110mm') || g.compatibleMotorFlanges.includes('130mm'));
  }, [selectedMotor]);

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted">{t('motor_subtitle')}</p>

      {types.map((type) => {
        const group = results.filter(({ m }) => m.type === type);
        if (group.length === 0) return null;
        return (
          <div key={type}>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              {typeLabels[type]}
              <Badge tone="neutral">{group.length}</Badge>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.map(({ m, result }, i) => {
                const selected = configuration.motorId === m.id;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <OptionCard
                      selected={selected}
                      status={result.status}
                      onClick={() => setConfiguration({
                        motorId: m.id,
                        driveId: m.compatibleDrives[0] ?? null,
                        encoderId: m.encoderOptions.includes('ENC-23BIT') ? 'ENC-23BIT' : m.encoderOptions[0] ?? null,
                        brake: requirements.brakeRequired || (requirements.orientation === 'vertical' && m.brakeAvailable),
                      })}
                      title={`${m.power}W ${typeLabels[m.type]}`}
                      subtitle={`${m.brand} ${m.model}`}
                      whyUnavailable={result.reasons[0]}
                    >
                      <div className="grid grid-cols-2 gap-1 text-2xs">
                        <div className="flex justify-between"><span className="text-muted">{t('motor_rated_torque')}</span><span className="num font-medium">{m.ratedTorque} Nm</span></div>
                        <div className="flex justify-between"><span className="text-muted">{t('motor_peak_torque')}</span><span className="num font-medium">{m.peakTorque} Nm</span></div>
                        <div className="flex justify-between"><span className="text-muted">{t('motor_rated_rpm')}</span><span className="num font-medium">{formatNumber(m.ratedRPM)}</span></div>
                        <div className="flex justify-between"><span className="text-muted">{t('motor_max_rpm')}</span><span className="num font-medium">{formatNumber(m.maxRPM)}</span></div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {m.brakeAvailable && <span className="rounded bg-ok/10 px-1.5 py-0.5 text-2xs text-ok">{t('motor_brake')}</span>}
                        {advancedMode && <span className="rounded bg-ink/5 px-1.5 py-0.5 text-2xs text-muted">J={m.inertia} kg·cm²</span>}
                      </div>
                    </OptionCard>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Gearbox selector */}
      {selectedMotor && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            {t('motor_gearbox')}
            <Badge tone="neutral">中大力德 ZD</Badge>
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <OptionCard
              selected={!configuration.gearboxId}
              status="compatible"
              onClick={() => setConfiguration({ gearboxId: null })}
              title={t('motor_no_gearbox')}
              subtitle={t('motor_no_gearbox_desc')}
            />
            {availableGearboxes.map((gb, i) => {
              const selected = configuration.gearboxId === gb.id;
              return (
                <motion.div
                  key={gb.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <OptionCard
                    selected={selected}
                    status="compatible"
                    onClick={() => setConfiguration({ gearboxId: gb.id })}
                    title={`${gb.ratio}:1`}
                    subtitle={`${gb.brand} ${gb.model}`}
                  >
                    <div className="grid grid-cols-2 gap-1 text-2xs">
                      <div className="flex justify-between"><span className="text-muted">{t('motor_rated_torque')}</span><span className="num font-medium">{gb.ratedTorque} Nm</span></div>
                      <div className="flex justify-between"><span className="text-muted">{t('motor_backlash')}</span><span className="num font-medium">{gb.backlash}′</span></div>
                    </div>
                  </OptionCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
