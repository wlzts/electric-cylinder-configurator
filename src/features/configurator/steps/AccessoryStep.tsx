import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Square, RotateCw, Link, Minus, GitMerge, Circle, Shield, ShieldCheck, Cable,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { accessories } from '@/data';
import { checkAccessory } from '@/compatibility';
import { OptionCard } from '@/components/ui/OptionCard';

const iconMap: Record<string, LucideIcon> = {
  Square, RotateCw, Link, Minus, GitMerge, Circle, Shield, ShieldCheck, Cable,
};

const categoryLabels: Record<string, string> = {
  mounting: 'Mounting',
  coupling: 'Coupling',
  protection: 'Protection',
  cable: 'Cable Management',
};

export function AccessoryStep() {
  const { configuration, setConfiguration } = useConfiguratorStore();

  const results = useMemo(
    () => accessories.map((a) => ({ a, result: checkAccessory(a, configuration) })),
    [configuration],
  );

  const toggle = (id: string) => {
    const has = configuration.accessories.includes(id);
    setConfiguration({
      accessories: has ? configuration.accessories.filter((x) => x !== id) : [...configuration.accessories, id],
    });
  };

  const categories = ['mounting', 'coupling', 'protection', 'cable'];

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted">Optional equipment. Add mounting, coupling, protection, and cable management accessories. Compatibility is validated per cylinder series.</p>

      {categories.map((cat) => {
        const group = results.filter(({ a }) => a.category === cat);
        if (group.length === 0) return null;
        return (
          <div key={cat}>
            <h3 className="mb-2 text-sm font-semibold">{categoryLabels[cat]}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.map(({ a, result }, i) => {
                const Icon = iconMap[a.icon] ?? Square;
                const selected = configuration.accessories.includes(a.id);
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <OptionCard
                      selected={selected}
                      status={selected ? 'recommended' : result.status}
                      onClick={() => toggle(a.id)}
                      title={a.name}
                      subtitle={categoryLabels[a.category]}
                      whyUnavailable={result.reasons[0]}
                      className="py-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink/5">
                          <Icon size={14} className="text-ink" />
                        </div>
                        <p className="text-2xs leading-relaxed text-muted">{a.description}</p>
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
