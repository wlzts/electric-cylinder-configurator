import { useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Copy, CheckCircle2, Send, FileJson } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { generateConfigurationCode } from '@/lib/codeGenerator';
import { generateBOM } from '@/lib/bom';
import { calculatePerformance } from '@/engineering';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { copyToClipboard, downloadFile, formatNumber } from '@/lib/utils';
import { useI18n } from '@/i18n';
import type { QuoteRequest } from '@/types';
import { cylinderSeries, motors } from '@/data';

interface QuoteForm {
  company: string; name: string; email: string; phone: string;
  country: string; application: string; projectQuantity: number;
  expectedDeliveryDate: string; message: string;
}

export function Quote() {
  const { t } = useI18n();
  const { configuration, requirements } = useConfiguratorStore();
  const [submitted, setSubmitted] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteRequest | null>(null);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<QuoteForm>({
    defaultValues: { projectQuantity: 1 },
  });

  const code = useMemo(() => generateConfigurationCode(configuration), [configuration]);
  const bom = useMemo(() => generateBOM(configuration), [configuration]);
  const perf = useMemo(() => calculatePerformance(requirements, configuration), [requirements, configuration]);
  const cyl = cylinderSeries.find((c) => c.id === configuration.cylinderId);
  const motor = motors.find((m) => m.id === configuration.motorId);

  const onSubmit = (data: QuoteForm) => {
    const quote: QuoteRequest = {
      customer: { company: data.company, name: data.name, email: data.email, phone: data.phone, country: data.country },
      application: data.application,
      projectQuantity: data.projectQuantity,
      expectedDeliveryDate: data.expectedDeliveryDate,
      message: data.message,
      applicationRequirements: requirements, configuration, performance: perf, bom,
      configurationCode: code, createdAt: new Date().toISOString(),
    };
    setQuoteData(quote);
    setSubmitted(true);
  };

  const handleCopyJSON = async () => { if (!quoteData) return; await copyToClipboard(JSON.stringify(quoteData, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const handleDownloadJSON = () => { if (!quoteData) return; downloadFile(`quote-${code}.json`, JSON.stringify(quoteData, null, 2), 'application/json'); };

  if (submitted && quoteData) {
    return (
      <div className="mx-auto max-w-2xl px-4 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok/10">
            <CheckCircle2 size={32} className="text-ok" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">{t('quote_success')}</h1>
          <p className="mt-2 text-sm text-muted">{t('quote_demo_note')}</p>
          <div className="mt-6 rounded-lg border border-line bg-bg p-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-2xs uppercase tracking-wider text-muted">{t('quote_config_code')}</span>
              <Badge tone="ok">{t('quote_prepared')}</Badge>
            </div>
            <p className="num mt-1 text-lg font-semibold">{code}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted">{t('quote_customer')}:</span> <span className="font-medium">{quoteData.customer.name}</span></div>
              <div><span className="text-muted">{t('quote_company2')}:</span> <span className="font-medium">{quoteData.customer.company}</span></div>
              <div><span className="text-muted">{t('quote_qty')}:</span> <span className="num font-medium">{quoteData.projectQuantity}</span></div>
              <div><span className="text-muted">{t('quote_bom_items')}:</span> <span className="num font-medium">{bom.length}</span></div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="primary" onClick={handleCopyJSON}>
              <Copy size={14} /> {copied ? t('btn_copied') : t('quote_copy_json')}
            </Button>
            <Button variant="outline" onClick={handleDownloadJSON}>
              <FileJson size={14} /> {t('btn_download')} JSON
            </Button>
            <Button variant="ghost" onClick={() => setSubmitted(false)}>
              {t('btn_edit')}
            </Button>
          </div>
          <p className="mt-6 rounded-lg bg-warn/5 px-3 py-2 text-2xs text-warn">{t('quote_no_data')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} className="text-accent" />
          <h1 className="text-2xl font-semibold tracking-tight">{t('quote_title')}</h1>
        </div>
        <p className="mt-1 text-sm text-muted">{t('quote_demo_note')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold">{t('quote_contact')}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label={t('quote_company')} error={errors.company?.message}>
              <input {...register('company', { required: true })} className="form-input" placeholder="Acme Corp" />
            </FormField>
            <FormField label={t('quote_name')} error={errors.name?.message}>
              <input {...register('name', { required: true })} className="form-input" placeholder="John Smith" />
            </FormField>
            <FormField label={t('quote_email')} error={errors.email?.message}>
              <input type="email" {...register('email', { required: true, pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} className="form-input" placeholder="john@acme.com" />
            </FormField>
            <FormField label={t('quote_phone')} error={errors.phone?.message}>
              <input {...register('phone')} className="form-input" placeholder="+1 555 0100" />
            </FormField>
            <FormField label={t('quote_country')} error={errors.country?.message}>
              <input {...register('country', { required: true })} className="form-input" placeholder="United States" />
            </FormField>
            <FormField label={t('quote_quantity')} error={errors.projectQuantity?.message}>
              <input type="number" min="1" {...register('projectQuantity', { required: true, min: 1 })} className="form-input num" />
            </FormField>
          </div>

          <h2 className="pt-2 text-sm font-semibold">{t('quote_project')}</h2>
          <FormField label={t('quote_app_desc')} error={errors.application?.message}>
            <textarea {...register('application', { required: true })} className="form-input min-h-[80px] resize-y" />
          </FormField>
          <FormField label={t('quote_delivery')}>
            <input type="date" {...register('expectedDeliveryDate')} className="form-input" />
          </FormField>
          <FormField label={t('quote_additional')}>
            <textarea {...register('message')} className="form-input min-h-[60px] resize-y" />
          </FormField>

          <div className="flex items-center justify-between border-t border-line pt-4">
            <p className="text-2xs text-muted">{t('quote_demo_no_send')}</p>
            <Button type="submit" variant="secondary" size="lg">
              <Send size={14} /> {t('quote_submit')}
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold">{t('quote_selected')}</h3>
            <div className="rounded-lg border border-line bg-bg p-3">
              <p className="text-2xs uppercase tracking-wider text-muted">{t('quote_config_code')}</p>
              <p className="num mt-0.5 text-base font-semibold">{code || '—'}</p>
            </div>
            <dl className="mt-3 space-y-1.5 text-xs">
              <Row label={t('cfg_platform')} value={cyl?.model ?? '—'} />
              <Row label={t('cfg_stroke')} value={`${formatNumber(configuration.stroke)} mm`} />
              <Row label={t('cfg_motor')} value={motor?.name ?? '—'} />
              <Row label={t('cfg_brake')} value={configuration.brake ? t('cfg_with_brake') : t('cfg_no_brake')} />
              <Row label={t('quote_bom_items')} value={`${bom.length}`} />
              <Row label={t('perf_rated_thrust')} value={perf.ratedThrust ? `${formatNumber(perf.ratedThrust)} N` : '—'} />
              <Row label={t('perf_safety')} value={perf.safetyFactor ? perf.safetyFactor.toFixed(2) : '—'} />
            </dl>
          </div>

          <div className="card p-5">
            <h3 className="mb-2 text-sm font-semibold">{t('quote_next')}</h3>
            <ol className="space-y-2 text-xs text-muted">
              <li className="flex gap-2"><span className="num font-semibold text-ink">1.</span> {t('quote_next_1')}</li>
              <li className="flex gap-2"><span className="num font-semibold text-ink">2.</span> {t('quote_next_2')}</li>
              <li className="flex gap-2"><span className="num font-semibold text-ink">3.</span> {t('quote_next_3')}</li>
              <li className="flex gap-2"><span className="num font-semibold text-ink">4.</span> {t('quote_next_4')}</li>
            </ol>
          </div>

          <p className="rounded-lg bg-accent/5 px-3 py-2 text-2xs text-muted">{t('common_demo_notice')}</p>
        </div>
      </div>

      <style>{`
        .form-input { width: 100%; border-radius: 0.5rem; border: 1px solid #E4E4E1; background: #FFFFFF; padding: 0.5rem 0.75rem; font-size: 0.75rem; transition: border-color 0.15s; }
        .form-input:focus { outline: none; border-color: #111111; }
      `}</style>
    </div>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-2xs font-medium uppercase tracking-wider text-muted">{label}</label>
      {children}
      {error && <p className="mt-1 text-2xs text-bad">{error}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted shrink-0">{label}</dt>
      <dd className="num text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
