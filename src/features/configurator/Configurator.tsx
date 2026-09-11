import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { StepNav } from '@/components/layout/StepNav';
import { CONFIG_STEPS } from './steps';
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

  const compat = useMemo(() => evaluateConfiguration(configuration, requirements), [configuration, requirements]);

  // Determine completed steps (simplified: all steps before current are complete)
  const completedSteps = useMemo(() => {
    const completed: number[] = [];
    for (let i = 0; i < currentStep; i++) completed.push(i);
    return completed;
  }, [currentStep]);

  const StepComponent = STEP_COMPONENTS[currentStep];
  const isLast = currentStep === CONFIG_STEPS.length - 1;
  const canProceed = currentStep < CONFIG_STEPS.length - 1;

  const handleNext = () => {
    if (canProceed) setStep(currentStep + 1);
  };
  const handlePrev = () => {
    if (currentStep > 0) setStep(currentStep - 1);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <StepNav currentStep={currentStep} onStepClick={setStep} completedSteps={completedSteps} />

      <div className="mx-auto max-w-[1600px] px-4 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Step header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="num text-2xs font-semibold text-accent">
                    {String(currentStep + 1).padStart(2, '0')} / {String(CONFIG_STEPS.length).padStart(2, '0')}
                  </span>
                  <h1 className="text-xl font-semibold tracking-tight">{CONFIG_STEPS[currentStep].label}</h1>
                </div>
                <p className="mt-0.5 text-xs text-muted">{stepDescriptions[currentStep]}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={compat.status}>{compat.status}</Badge>
                <button
                  type="button"
                  onClick={toggleAdvanced}
                  className={`rounded-lg border px-2.5 py-1 text-2xs font-medium transition-colors ${advancedMode ? 'border-ink bg-ink text-white' : 'border-line text-muted hover:border-ink/40'}`}
                >
                  {advancedMode ? 'Advanced' : 'Basic'}
                </button>
              </div>
            </div>

            {/* Product visualizer */}
            <div className="mb-5">
              <ProductVisualizer config={configuration} />
            </div>

            {/* Step content */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <StepComponent />
            </motion.div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
              <Button variant="ghost" onClick={handlePrev} disabled={currentStep === 0}>
                <ArrowLeft size={14} /> Back
              </Button>
              <div className="flex items-center gap-2 text-2xs text-muted">
                <CheckCircle2 size={12} className="text-ok" />
                <span>Auto-saved to local storage</span>
              </div>
              {isLast ? (
                <Link to="/review">
                  <Button variant="secondary">
                    Go to Review <ArrowRight size={14} />
                  </Button>
                </Link>
              ) : (
                <Button variant="primary" onClick={handleNext}>
                  Continue <ArrowRight size={14} />
                </Button>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <CurrentConfiguration />
        </div>
      </div>

      {/* Mobile bottom bar */}
      <MobileConfigBar />
    </div>
  );
}

const stepDescriptions = [
  'Define your application requirements — load, stroke, speed, environment.',
  'Select the cylinder platform that matches your force and payload needs.',
  'Choose the transmission technology: ball screw, lead screw, or timing belt.',
  'Configure the screw diameter/lead or belt pitch/width for your speed and force.',
  'Select the motor — servo, stepper, or closed-loop stepper.',
  'Choose a compatible drive and communication protocol.',
  'Configure encoder resolution and sensor types (home, limits).',
  'Add mounting, coupling, protection, and cable management accessories.',
  'Review engineering validation — thrust, torque, critical speed, safety factor.',
  'Final review of your complete configuration before requesting a quote.',
];

function MobileConfigBar() {
  const { configuration } = useConfiguratorStore();
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
          <span className="text-xs font-semibold">Current Configuration</span>
          <span className="num rounded-full bg-ink/5 px-2 py-0.5 text-2xs text-muted">{itemCount} items</span>
        </div>
        <Link to="/review" className="text-xs font-medium text-accent hover:underline">
          View →
        </Link>
      </div>
    </div>
  );
}
