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
import type { QuoteRequest } from '@/types';
import { cylinderSeries, motors } from '@/data';

interface QuoteForm {
  company: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  application: string;
  projectQuantity: number;
  expectedDeliveryDate: string;
  message: string;
}

export function Quote() {
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
      customer: {
        company: data.company,
        name: data.name,
        email: data.email,
        phone: data.phone,
        country: data.country,
      },
      application: data.application,
      projectQuantity: data.projectQuantity,
      expectedDeliveryDate: data.expectedDeliveryDate,
      message: data.message,
      applicationRequirements: requirements,
      configuration,
      performance: perf,
      bom,
      configurationCode: code,
      createdAt: new Date().toISOString(),
    };
    setQuoteData(quote);
    setSubmitted(true);
  };

  const handleCopyJSON = async () => {
    if (!quoteData) return;
    await copyToClipboard(JSON.stringify(quoteData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadJSON = () => {
    if (!quoteData) return;
    downloadFile(`quote-${code}.json`, JSON.stringify(quoteData, null, 2), 'application/json');
  };

  if (submitted && quoteData) {
    return (
      <div className="mx-auto max-w-2xl px-4 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok/10">
            <CheckCircle2 size={32} className="text-ok" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Request Prepared</h1>
          <p className="mt-2 text-sm text-muted">
            Your engineering quote request has been assembled. This is a demo submission — backend integration is required for production delivery.
          </p>

          <div className="mt-6 rounded-lg border border-line bg-bg p-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-2xs uppercase tracking-wider text-muted">Configuration Code</span>
              <Badge tone="ok">Prepared</Badge>
            </div>
            <p className="num mt-1 text-lg font-semibold">{code}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted">Customer:</span> <span className="font-medium">{quoteData.customer.name}</span></div>
              <div><span className="text-muted">Company:</span> <span className="font-medium">{quoteData.customer.company}</span></div>
              <div><span className="text-muted">Quantity:</span> <span className="num font-medium">{quoteData.projectQuantity}</span></div>
              <div><span className="text-muted">BOM Items:</span> <span className="num font-medium">{bom.length}</span></div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="primary" onClick={handleCopyJSON}>
              <Copy size={14} /> {copied ? 'Copied!' : 'Copy Request JSON'}
            </Button>
            <Button variant="outline" onClick={handleDownloadJSON}>
              <FileJson size={14} /> Download JSON
            </Button>
            <Button variant="ghost" onClick={() => setSubmitted(false)}>
              Edit Request
            </Button>
          </div>

          <p className="mt-6 rounded-lg bg-warn/5 px-3 py-2 text-2xs text-warn">
            Demo submission — backend integration required for production. No data was sent to a server.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} className="text-accent" />
          <h1 className="text-2xl font-semibold tracking-tight">Request Engineering Quote</h1>
        </div>
        <p className="mt-1 text-sm text-muted">Submit your configuration for a formal engineering quote. Demo mode — no backend integration.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold">Contact Information</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Company" error={errors.company?.message}>
              <input {...register('company', { required: 'Company is required' })} className="form-input" placeholder="Acme Corp" />
            </FormField>
            <FormField label="Name" error={errors.name?.message}>
              <input {...register('name', { required: 'Name is required' })} className="form-input" placeholder="John Smith" />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <input type="email" {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} className="form-input" placeholder="john@acme.com" />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <input {...register('phone')} className="form-input" placeholder="+1 555 0100" />
            </FormField>
            <FormField label="Country" error={errors.country?.message}>
              <input {...register('country', { required: 'Country is required' })} className="form-input" placeholder="United States" />
            </FormField>
            <FormField label="Project Quantity" error={errors.projectQuantity?.message}>
              <input type="number" min="1" {...register('projectQuantity', { required: true, min: 1 })} className="form-input num" />
            </FormField>
          </div>

          <h2 className="pt-2 text-sm font-semibold">Project Details</h2>
          <FormField label="Application Description" error={errors.application?.message}>
            <textarea {...register('application', { required: 'Application description is required' })} className="form-input min-h-[80px] resize-y" placeholder="Describe your application and how the cylinder will be used..." />
          </FormField>
          <FormField label="Expected Delivery Date">
            <input type="date" {...register('expectedDeliveryDate')} className="form-input" />
          </FormField>
          <FormField label="Additional Message">
            <textarea {...register('message')} className="form-input min-h-[60px] resize-y" placeholder="Any special requirements or questions..." />
          </FormField>

          <div className="flex items-center justify-between border-t border-line pt-4">
            <p className="text-2xs text-muted">Demo submission — no data sent to server.</p>
            <Button type="submit" variant="secondary" size="lg">
              <Send size={14} /> Submit Quote Request
            </Button>
          </div>
        </form>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold">Selected Configuration</h3>
            <div className="rounded-lg border border-line bg-bg p-3">
              <p className="text-2xs uppercase tracking-wider text-muted">Configuration Code</p>
              <p className="num mt-0.5 text-base font-semibold">{code || '—'}</p>
            </div>
            <dl className="mt-3 space-y-1.5 text-xs">
              <Row label="Platform" value={cyl?.model ?? '—'} />
              <Row label="Stroke" value={`${formatNumber(configuration.stroke)} mm`} />
              <Row label="Motor" value={motor?.name ?? '—'} />
              <Row label="Brake" value={configuration.brake ? 'With Brake' : 'No Brake'} />
              <Row label="BOM Items" value={`${bom.length}`} />
              <Row label="Rated Thrust" value={perf.ratedThrust ? `${formatNumber(perf.ratedThrust)} N` : '—'} />
              <Row label="Safety Factor" value={perf.safetyFactor ? perf.safetyFactor.toFixed(2) : '—'} />
            </dl>
          </div>

          <div className="card p-5">
            <h3 className="mb-2 text-sm font-semibold">What happens next</h3>
            <ol className="space-y-2 text-xs text-muted">
              <li className="flex gap-2"><span className="num font-semibold text-ink">1.</span> Engineering team reviews your configuration and requirements.</li>
              <li className="flex gap-2"><span className="num font-semibold text-ink">2.</span> Compatibility and performance are verified against certified product data.</li>
              <li className="flex gap-2"><span className="num font-semibold text-ink">3.</span> Formal quote with pricing and lead time is prepared.</li>
              <li className="flex gap-2"><span className="num font-semibold text-ink">4.</span> Quote sent to your email within 2 business days.</li>
            </ol>
          </div>

          <p className="rounded-lg bg-accent/5 px-3 py-2 text-2xs text-muted">
            Demo engineering data. Final values are subject to verified product specifications. Quote submission requires backend integration for production.
          </p>
        </div>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #E4E4E1;
          background: #FFFFFF;
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          transition: border-color 0.15s;
        }
        .form-input:focus {
          outline: none;
          border-color: #111111;
        }
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
