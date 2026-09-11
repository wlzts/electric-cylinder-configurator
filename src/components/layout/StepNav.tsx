import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CONFIG_STEPS } from '@/features/configurator/steps';

interface StepNavProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  completedSteps: number[];
}

export function StepNav({ currentStep, onStepClick, completedSteps }: StepNavProps) {
  return (
    <div className="sticky top-14 z-30 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto max-w-[1600px] px-4 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto py-2.5 no-scrollbar">
          {CONFIG_STEPS.map((step, idx) => {
            const isActive = step.id === currentStep;
            const isCompleted = completedSteps.includes(step.id);
            const isClickable = isCompleted || step.id <= currentStep;
            return (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all',
                    isActive && 'bg-ink text-white shadow-sm',
                    !isActive && isClickable && 'text-ink hover:bg-ink/5',
                    !isClickable && 'text-muted/50 cursor-not-allowed',
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-full text-2xs font-semibold',
                      isActive ? 'bg-white/20 text-white' : isCompleted ? 'bg-ok/15 text-ok' : 'bg-ink/10 text-muted',
                    )}
                  >
                    {isCompleted ? <Check size={10} strokeWidth={3} /> : step.id + 1}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.short}</span>
                </button>
                {idx < CONFIG_STEPS.length - 1 && (
                  <span className="mx-0.5 h-px w-3 bg-line shrink-0" aria-hidden />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
