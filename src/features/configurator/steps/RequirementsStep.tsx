import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import type { ApplicationRequirement } from '@/types';
import { protocols } from '@/data';
import { useI18n } from '@/i18n';

export function RequirementsStep() {
  const { t } = useI18n();
  const { requirements, setRequirements } = useConfiguratorStore();
  const update = (patch: Partial<ApplicationRequirement>) => setRequirements(patch);

  return (
    <div className="card p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold mb-3">{t('req_motion_profile')}</h3>
          <div className="space-y-3">
            <Segmented
              label={t('req_orientation')}
              options={['horizontal', 'vertical']}
              labels={[t('req_horizontal'), t('req_vertical')]}
              value={requirements.orientation}
              onChange={(v) => update({ orientation: v as ApplicationRequirement['orientation'] })}
            />
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label={t('req_payload')} unit="kg" value={requirements.payload} onChange={(v) => update({ payload: v })} />
              <NumberInput label={t('cfg_stroke')} unit="mm" value={requirements.stroke} onChange={(v) => update({ stroke: v })} />
              <NumberInput label={t('req_speed')} unit="mm/s" value={requirements.targetSpeed} onChange={(v) => update({ targetSpeed: v })} />
              <NumberInput label={t('req_accel')} unit="mm/s²" value={requirements.acceleration} onChange={(v) => update({ acceleration: v })} />
              <NumberInput label={t('req_thrust')} unit="N" value={requirements.targetThrust} onChange={(v) => update({ targetThrust: v })} />
              <NumberInput label={t('req_repeatability')} unit="±mm" value={requirements.repeatability} onChange={(v) => update({ repeatability: v })} step={0.001} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">{t('req_operating')}</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label={t('req_daily_hours')} unit="h" value={requirements.dailyHours} onChange={(v) => update({ dailyHours: v })} />
              <NumberInput label={t('req_cycles')} unit="cpm" value={requirements.cyclesPerMin} onChange={(v) => update({ cyclesPerMin: v })} />
            </div>
            <Segmented
              label={t('req_environment')}
              options={['normal', 'dusty', 'cleanroom']}
              labels={[t('req_normal'), t('req_dusty'), t('req_cleanroom')]}
              value={requirements.environment}
              onChange={(v) => update({ environment: v as ApplicationRequirement['environment'] })}
            />
            <Segmented
              label={t('req_control_mode')}
              options={['position', 'velocity', 'torque']}
              labels={[t('req_position'), t('req_velocity'), t('req_torque')]}
              value={requirements.controlMode}
              onChange={(v) => update({ controlMode: v as ApplicationRequirement['controlMode'] })}
            />
            <div>
              <label className="mb-1.5 block text-2xs font-medium uppercase tracking-wider text-muted">{t('req_communication')}</label>
              <select value={requirements.communication} onChange={(e) => update({ communication: e.target.value })}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs focus:border-ink">
                {protocols.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
              <input type="checkbox" checked={requirements.brakeRequired} onChange={(e) => update({ brakeRequired: e.target.checked })} className="rounded border-line" />
              {t('req_brake')}
            </label>
          </div>
        </div>
      </div>
      <p className="mt-5 rounded-lg bg-accent/5 px-3 py-2 text-2xs text-muted">{t('req_demo_note')}</p>
    </div>
  );
}

function Segmented({ label, options, labels, value, onChange }: {
  label: string; options: string[]; labels: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-2xs font-medium uppercase tracking-wider text-muted">{label}</label>
      <div className="flex gap-1 rounded-lg border border-line bg-bg p-1">
        {options.map((o, i) => (
          <button key={o} type="button" onClick={() => onChange(o)}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors ${value === o ? 'bg-ink text-white shadow-sm' : 'text-muted hover:text-ink'}`}>
            {labels[i]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function NumberInput({ label, unit, value, onChange, step = 1 }: {
  label: string; unit: string; value: number; onChange: (v: number) => void; step?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-2xs font-medium uppercase tracking-wider text-muted">{label}</label>
      <div className="relative">
        <input type="number" value={value} step={step} onChange={(e) => onChange(Number(e.target.value))}
          className="num w-full rounded-lg border border-line bg-surface px-3 py-2 pr-10 text-xs focus:border-ink" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-muted">{unit}</span>
      </div>
    </div>
  );
}
