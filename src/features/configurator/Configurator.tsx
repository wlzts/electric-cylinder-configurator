import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { StepNav } from '@/components/layout/StepNav';
import { CONFIG_STEPS, STEP_DESC_KEYS } from './steps';
import { CurrentConfiguration } from '@/components/layout/CurrentConfiguration';
import { ProductVisualizer } from '@/components/visualizer/ProductVisualizer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RequirementsStep } from './steps/RequirementsStep';
import { PlatformStep } from './steps/PlatformStep';
import { TransmissionStep } from './steps/TransmissionStep';
import { ScrewBeltStep } from './steps/ScrewBeltStep';
import { MotorStep } from './steps/MotorStep';
import { DriveStep } from './steps/DriveStep';
import { EncoderSensorStep } from './steps/EncoderSensorStep';
import { AccessoryStep } from './steps/AccessoryStep';
import { EngineeringCheckStep } from './steps/EngineeringCheckStep';
import { ReviewStep } from './steps/ReviewStep';
import { evaluateConfiguration } from '@/compatibility';
import { useI18n } from '@/i18n';
import { Link } from 'react-router-dom';

const STEP_COMPONENTS = [
  RequirementsStep,
  PlatformStep,
  TransmissionStep,
  ScrewBeltStep,
  MotorStep,
  DriveStep,
  EncoderSensorStep,
  AccessoryStep,
  EngineeringCheckStep,
  ReviewStep,
];

export function Configurator() {
  const { currentStep, setStep, configuration, requirements, advancedMode, toggleAdvanced } = useConfiguratorStore();
  const { t } = useI18n();

  const compat = useMemo(() => evaluateConfiguration(configuration, requirements), [configuration, requirements]);

  const completedSteps = useMemo(() => {
    const completed: number[] = [];
    for (let i = 0; i < currentStep; i++) completed.push(i);
    return completed;
  }, [currentStep]);

  const StepComponent = STEP_COMPONENTS[currentStep];
  const isLast = currentStep === CONFIG_STEPS.length - 1;
  const canProceed = currentStep < CONFIG_STEPS.length - 1;

  const handleNext = () => { if (canProceed) setStep(currentStep + 1); };
  const handlePrev = () => { if (currentStep > 0) setStep(currentStep - 1); };

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <StepNav currentStep={currentStep} onStepClick={setStep} completedSteps={completedSteps} />

      <div className="mx-auto max-w-[1600px] px-4 lg:px-8 py-6">
        <div className="flex gap-6">
          <div className="min-w-0 flex-1">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="num text-2xs font-semibold text-accent">
                    {String(currentStep + 1).padStart(2, '0')} / {String(CONFIG_STEPS.length).padStart(2, '0')}
                  </span>
                  <h1 className="text-xl font-semibold tracking-tight">{t(CONFIG_STEPS[currentStep].labelKey)}</h1>
                </div>
                <p className="mt-0.5 text-xs text-muted">{t(STEP_DESC_KEYS[currentStep])}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={compat.status}>{t(`st_${compat.status}` as const)}</Badge>
                <button
                  type="button"
                  onClick={toggleAdvanced}
                  className={`rounded-lg border px-2.5 py-1 text-2xs font-medium transition-all ${advancedMode ? 'border-ink bg-ink text-white' : 'border-line text-muted hover:border-ink/40'}`}
                >
                  {advancedMode ? t('common_advanced') : t('common_basic')}
                </button>
              </div>
            </div>

            <div className="mb-5">
              <ProductVisualizer config={configuration} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <StepComponent />
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
              <Button variant="ghost" onClick={handlePrev} disabled={currentStep === 0}>
                <ArrowLeft size={14} /> {t('btn_back')}
              </Button>
              <div className="flex items-center gap-2 text-2xs text-muted">
                <CheckCircle2 size={12} className="text-ok" />
                <span>{t('common_auto_saved')}</span>
              </div>
              {isLast ? (
                <Link to="/review">
                  <Button variant="secondary">
                    {t('btn_review')} <ArrowRight size={14} />
                  </Button>
                </Link>
              ) : (
                <Button variant="primary" onClick={handleNext}>
                  {t('btn_continue')} <ArrowRight size={14} />
                </Button>
              )}
            </div>
          </div>

          <CurrentConfiguration />
        </div>
      </div>

      <MobileConfigBar />
    </div>
  );
}

function MobileConfigBar() {
  const { configuration } = useConfiguratorStore();
  const { t } = useI18n();
  const itemCount = [
    configuration.cylinderId,
    configuration.transmission,
    configuration.screwId ?? configuration.beltId,
    configuration.motorId,
    configuration.driveId,
  ].filter(Boolean).length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">{t('cfg_current')}</span>
          <span className="num rounded-full bg-ink/5 px-2 py-0.5 text-2xs text-muted">{itemCount} {t('cfg_items')}</span>
        </div>
        <Link to="/review" className="text-xs font-medium text-accent hover:underline">
          {t('common_view')}
        </Link>
      </div>
    </div>
  );
}
