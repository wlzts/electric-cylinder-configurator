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

function preloadLabel(p: string): string {
  if (p === 'standard') return '标准预压';
  if (p === 'light') return '轻预压';
  if (p === 'heavy') return '重预压';
  return p;
}

function materialLabel(m: string): string {
  if (m === 'Rubber') return '橡胶';
  if (m === 'PU') return '聚氨酯';
  return m;
}

function cordLabel(c: string): string {
  if (c === 'Fiberglass') return '玻纤线绳';
  if (c === 'Steel') return '钢丝线绳';
  if (c === 'Aramid') return '芳纶线绳';
  return c;
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
        <p className="text-xs text-muted">选择滚珠丝杠的直径与导程。导程越大，同等转速下直线速度越快，但推力换算比例越小。</p>
        <InfoIcon text="在相同电机转速下，导程越大直线速度越快，但机械推力放缩比相应降低。" />
      </div>

      {diameters.map((d) => {
        const group = results.filter(({ s }) => s.diameter === d);
        if (group.length === 0) return null;
        return (
          <div key={d}>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              Ø{d} mm
              <span className="text-2xs font-normal text-muted">（{group.length} 种导程可选）</span>
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
                      title={`导程 ${s.lead} mm`}
                      subtitle={`${s.accuracy} 级 · ${preloadLabel(s.preload)}`}
                      whyUnavailable={result.reasons[0]}
                    >
                      <div className="grid grid-cols-2 gap-1 text-2xs">
                        <div className="flex justify-between"><span className="text-muted">最高转速</span><span className="num font-medium">{formatNumber(s.maxRPM)}</span></div>
                        <div className="flex justify-between"><span className="text-muted">动载荷</span><span className="num font-medium">{formatNumber(s.dynamicLoad)} N</span></div>
                        <div className="flex justify-between"><span className="text-muted">静载荷</span><span className="num font-medium">{formatNumber(s.staticLoad)} N</span></div>
                        <div className="flex justify-between"><span className="text-muted">最大行程</span><span className="num font-medium">{formatNumber(s.maxStroke)} mm</span></div>
                      </div>
                      {advanced && (
                        <div className="mt-2 rounded bg-ink/[0.03] px-2 py-1.5 text-2xs text-muted">
                          行程 {configuration.stroke}mm 下临界转速：约 {Math.round((1.5e7 * s.diameter) / Math.pow(Math.max(100, configuration.stroke + 200), 2))} RPM（演示值）
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
      <p className="mb-4 text-xs text-muted">选择同步带系列、节距与宽度。带宽越大承载越高，节距越大适应转速越高。</p>
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
                subtitle={`宽 ${b.width}mm · ${materialLabel(b.material)} · ${cordLabel(b.cord)}`}
                whyUnavailable={result.reasons[0]}
              >
                <div className="space-y-1 text-2xs">
                  <div className="flex justify-between"><span className="text-muted">最大线速度</span><span className="num font-medium">{formatNumber(b.maxSpeed)} mm/s</span></div>
                  <div className="flex justify-between"><span className="text-muted">额定载荷</span><span className="num font-medium">{formatNumber(b.ratedLoad)} N</span></div>
                  <div className="flex justify-between"><span className="text-muted">节距</span><span className="num font-medium">{b.pitchMm} mm</span></div>
                </div>
              </OptionCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
