import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { ballScrews, timingBelts } from '@/data';
import { checkScrew, checkBelt } from '@/compatibility';
import { OptionCard } from '@/components/ui/OptionCard';
import { InfoIcon } from '@/components/ui/Tooltip';
import { formatNumber } from '@/lib/utils';

export function ScrewBeltStep() {
  const { configuration, advancedMode } = useConfiguratorStore();

  if (configuration.transmission === 'timing_belt') {
    return <BeltSelector />;
  }
  return <ScrewSelector advanced={advancedMode} />;
}

function ScrewSelector({ advanced }: { advanced: boolean }) {
  const { configuration, requirements, setConfiguration } = useConfiguratorStore();

  const results = useMemo(
    () => ballScrews.map((s) => ({ s, result: checkScrew(s, configuration, requirements) })),
    [configuration, requirements],
  );

  // Group by diameter for cleaner UI
  const diameters = [...new Set(ballScrews.map((s) => s.diameter))].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted">Select ball screw diameter and lead. Higher lead increases speed but reduces force multiplication.</p>
        <InfoIcon text="Higher lead generally increases linear speed for a given motor RPM, while reducing mechanical force multiplication." />
      </div>

      {diameters.map((d) => {
        const group = results.filter(({ s }) => s.diameter === d);
        if (group.length === 0) return null;
        return (
          <div key={d}>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              Ø{d} mm
              <span className="text-2xs font-normal text-muted">({group.length} leads available)</span>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.map(({ s, result }, i) => {
                const selected = configuration.screwId === s.id;
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <OptionCard
                      selected={selected}
                      status={result.status}
                      onClick={() => setConfiguration({ screwId: s.id })}
                      title={`Lead ${s.lead} mm`}
                      subtitle={`${s.accuracy} · ${s.preload} preload`}
                      whyUnavailable={result.reasons[0]}
                    >
                      <div className="grid grid-cols-2 gap-1 text-2xs">
                        <div className="flex justify-between"><span className="text-muted">Max RPM</span><span className="num font-medium">{formatNumber(s.maxRPM)}</span></div>
                        <div className="flex justify-between"><span className="text-muted">Dynamic Load</span><span className="num font-medium">{formatNumber(s.dynamicLoad)} N</span></div>
                        <div className="flex justify-between"><span className="text-muted">Static Load</span><span className="num font-medium">{formatNumber(s.staticLoad)} N</span></div>
                        <div className="flex justify-between"><span className="text-muted">Max Stroke</span><span className="num font-medium">{formatNumber(s.maxStroke)} mm</span></div>
                      </div>
                      {advanced && (
                        <div className="mt-2 rounded bg-ink/[0.03] px-2 py-1.5 text-2xs text-muted">
                          Critical speed at {configuration.stroke}mm stroke: ~{Math.round((1.5e7 * s.diameter) / Math.pow(Math.max(100, configuration.stroke + 200), 2))} RPM (demo)
                        </div>
                      )}
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

function BeltSelector() {
  const { configuration, requirements, setConfiguration } = useConfiguratorStore();

  const results = useMemo(
    () => timingBelts.map((b) => ({ b, result: checkBelt(b, configuration, requirements) })),
    [configuration, requirements],
  );

  return (
    <div>
      <p className="mb-4 text-xs text-muted">Select timing belt series, pitch, and width. Wider belts carry more load; larger pitches handle higher speeds.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {results.map(({ b, result }, i) => {
          const selected = configuration.beltId === b.id;
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <OptionCard
                selected={selected}
                status={result.status}
                onClick={() => setConfiguration({ beltId: b.id })}
                title={`${b.series} ${b.pitch}`}
                subtitle={`${b.width}mm · ${b.material} · ${b.cord} cord`}
                whyUnavailable={result.reasons[0]}
              >
                <div className="space-y-1 text-2xs">
                  <div className="flex justify-between"><span className="text-muted">Max Speed</span><span className="num font-medium">{formatNumber(b.maxSpeed)} mm/s</span></div>
                  <div className="flex justify-between"><span className="text-muted">Rated Load</span><span className="num font-medium">{formatNumber(b.ratedLoad)} N</span></div>
                  <div className="flex justify-between"><span className="text-muted">Pitch</span><span className="num font-medium">{b.pitchMm} mm</span></div>
                </div>
              </OptionCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
