import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { drives, protocols } from '@/data';
import { checkDrive, checkProtocol } from '@/compatibility';
import { OptionCard } from '@/components/ui/OptionCard';
import { formatNumber } from '@/lib/utils';

export function DriveStep() {
  const { configuration, setConfiguration } = useConfiguratorStore();

  const driveResults = useMemo(
    () => drives.map((d) => ({ d, result: checkDrive(d, configuration) })),
    [configuration],
  );

  const protoResults = useMemo(
    () => protocols.map((p) => ({ p, result: checkProtocol(p, configuration) })),
    [configuration],
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Servo / Stepper Drive</h3>
        <p className="mb-4 text-xs text-muted">Only drives compatible with the selected motor can be chosen. Incompatible drives remain visible but disabled.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {driveResults.map(({ d, result }, i) => {
            const selected = configuration.driveId === d.id;
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <OptionCard
                  selected={selected}
                  status={result.status}
                  onClick={() => {
                    setConfiguration({ driveId: d.id });
                    // Auto-adjust communication if current protocol not supported
                    if (configuration.communicationId && !d.communication.includes(configuration.communicationId)) {
                      setConfiguration({ communicationId: d.communication[0] });
                    }
                  }}
                  title={d.name}
                  subtitle={`${d.brand} ${d.model} · ${d.voltage}`}
                  whyUnavailable={result.reasons[0]}
                >
                  <div className="grid grid-cols-2 gap-1 text-2xs">
                    <div className="flex justify-between"><span className="text-muted">Power</span><span className="num font-medium">{formatNumber(d.power)}W</span></div>
                    <div className="flex justify-between"><span className="text-muted">Voltage</span><span className="font-medium">{d.voltage}</span></div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {d.controlModes.map((m) => (
                      <span key={m} className="rounded bg-ink/5 px-1.5 py-0.5 text-2xs text-muted capitalize">{m}</span>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {d.communication.slice(0, 4).map((c) => {
                      const proto = protocols.find((p) => p.id === c);
                      return <span key={c} className="rounded bg-accent/10 px-1.5 py-0.5 text-2xs text-accent-deep">{proto?.code ?? c}</span>;
                    })}
                  </div>
                </OptionCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Communication Protocol</h3>
        <p className="mb-4 text-xs text-muted">Select the fieldbus protocol. Only protocols supported by the selected drive are available.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {protoResults.map(({ p, result }, i) => {
            const selected = configuration.communicationId === p.id;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <OptionCard
                  selected={selected}
                  status={result.status}
                  onClick={() => setConfiguration({ communicationId: p.id })}
                  title={p.name}
                  subtitle={p.deterministic ? 'Deterministic' : 'Non-deterministic'}
                  whyUnavailable={result.reasons[0]}
                  className="py-3"
                >
                  <p className="text-2xs text-muted">{p.description}</p>
                </OptionCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
