import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { encoders, sensors, motors } from '@/data';
import { checkEncoder } from '@/compatibility';
import { OptionCard } from '@/components/ui/OptionCard';
import { Badge } from '@/components/ui/Badge';

export function EncoderSensorStep() {
  const { configuration, requirements, setConfiguration } = useConfiguratorStore();
  const motor = motors.find((m) => m.id === configuration.motorId);

  const encoderResults = useMemo(
    () => encoders.map((e) => ({ e, result: checkEncoder(e, configuration) })),
    [configuration],
  );

  const toggleSensor = (id: string) => {
    const has = configuration.sensors.includes(id);
    setConfiguration({
      sensors: has ? configuration.sensors.filter((s) => s !== id) : [...configuration.sensors, id],
    });
  };

  const sensorGroups = [
    { type: 'home' as const, label: 'Home Sensor', options: sensors.filter((s) => s.type === 'home') },
    { type: 'positive_limit' as const, label: 'Positive Limit', options: sensors.filter((s) => s.type === 'positive_limit') },
    { type: 'negative_limit' as const, label: 'Negative Limit', options: sensors.filter((s) => s.type === 'negative_limit') },
  ];

  return (
    <div className="space-y-8">
      {/* Encoder */}
      <div>
        <h3 className="mb-1 text-sm font-semibold">Encoder</h3>
        <p className="mb-4 text-xs text-muted">
          {motor ? `Available on ${motor.name}: ${motor.encoderOptions.length} options.` : 'Select a motor first to see available encoders.'}
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {encoderResults.map(({ e, result }, i) => {
            const selected = configuration.encoderId === e.id;
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <OptionCard
                  selected={selected}
                  status={result.status}
                  onClick={() => setConfiguration({ encoderId: e.id })}
                  title={e.name}
                  subtitle={e.resolution}
                  whyUnavailable={result.reasons[0]}
                >
                  <div className="space-y-1 text-2xs">
                    <div className="flex items-center gap-1.5">
                      <span className={e.powerOffRetention ? 'text-ok' : 'text-muted'}>{e.powerOffRetention ? '✓' : '—'}</span>
                      <span className="text-muted">Power-off position retention</span>
                    </div>
                    <p className="text-muted">{e.recommendedFor}</p>
                  </div>
                </OptionCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Brake */}
      <div>
        <h3 className="mb-1 text-sm font-semibold">Brake</h3>
        <p className="mb-4 text-xs text-muted">Holding brake for vertical applications or power-loss safety.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <OptionCard
            selected={!configuration.brake}
            status="compatible"
            onClick={() => setConfiguration({ brake: false })}
            title="No Brake"
            subtitle="Standard configuration"
          >
            <p className="text-2xs text-muted">Lower cost, lighter motor. Suitable for horizontal applications.</p>
          </OptionCard>
          <OptionCard
            selected={configuration.brake}
            status={motor?.brakeAvailable ? 'recommended' : 'incompatible'}
            onClick={() => motor?.brakeAvailable && setConfiguration({ brake: true })}
            title="With Brake"
            subtitle={motor?.brakeAvailable ? 'Electromagnetic holding brake' : 'Not available on selected motor'}
            whyUnavailable={motor?.brakeAvailable ? undefined : 'Selected motor does not support brake.'}
          >
            <p className="text-2xs text-muted">Holds load position on power loss. {requirements.orientation === 'vertical' && 'Recommended for vertical installation.'}</p>
            {requirements.orientation === 'vertical' && !configuration.brake && (
              <div className="mt-2"><Badge tone="warn">Recommended for vertical</Badge></div>
            )}
          </OptionCard>
        </div>
      </div>

      {/* Sensors */}
      <div>
        <h3 className="mb-1 text-sm font-semibold">Sensors</h3>
        <p className="mb-4 text-xs text-muted">Configure home and limit sensors. Select output type (NPN/PNP) and logic (NO/NC).</p>
        <div className="space-y-4">
          {sensorGroups.map((group) => (
            <div key={group.type}>
              <h4 className="mb-2 text-xs font-semibold text-muted">{group.label}</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.options.map((s) => {
                  const selected = configuration.sensors.includes(s.id);
                  return (
                    <OptionCard
                      key={s.id}
                      selected={selected}
                      status={selected ? 'recommended' : 'compatible'}
                      onClick={() => toggleSensor(s.id)}
                      title={s.name}
                      subtitle={`${s.output} · ${s.logic}`}
                      className="py-3"
                    >
                      <p className="text-2xs text-muted">{s.description}</p>
                    </OptionCard>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
