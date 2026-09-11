import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { motors } from '@/data';
import { checkMotor } from '@/compatibility';
import { OptionCard } from '@/components/ui/OptionCard';
import { Badge } from '@/components/ui/Badge';
import { formatNumber } from '@/lib/utils';
import type { MotorType } from '@/types';

const typeLabels: Record<MotorType, string> = {
  servo: 'Servo',
  stepper: 'Stepper',
  closed_loop_stepper: 'Closed-loop Stepper',
};

export function MotorStep() {
  const { configuration, requirements, setConfiguration, advancedMode } = useConfiguratorStore();

  const results = useMemo(
    () => motors.map((m) => ({ m, result: checkMotor(m, configuration, requirements) })),
    [configuration, requirements],
  );

  const types: MotorType[] = ['servo', 'closed_loop_stepper', 'stepper'];

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted">Select motor type and power. The system validates torque, RPM, and brake availability against your application.</p>

      {types.map((type) => {
        const group = results.filter(({ m }) => m.type === type);
        if (group.length === 0) return null;
        return (
          <div key={type}>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              {typeLabels[type]}
              <Badge tone="neutral">{group.length} options</Badge>
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
                        <div className="flex justify-between"><span className="text-muted">Rated Torque</span><span className="num font-medium">{m.ratedTorque} Nm</span></div>
                        <div className="flex justify-between"><span className="text-muted">Peak Torque</span><span className="num font-medium">{m.peakTorque} Nm</span></div>
                        <div className="flex justify-between"><span className="text-muted">Rated RPM</span><span className="num font-medium">{formatNumber(m.ratedRPM)}</span></div>
                        <div className="flex justify-between"><span className="text-muted">Max RPM</span><span className="num font-medium">{formatNumber(m.maxRPM)}</span></div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {m.brakeAvailable && <span className="rounded bg-ok/10 px-1.5 py-0.5 text-2xs text-ok">Brake</span>}
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
    </div>
  );
}
