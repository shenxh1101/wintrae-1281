import React from 'react';
import { cn } from '@/lib/utils';
import type { StepType } from '@/types';
import { STEP_LABELS } from '@/types';
import {
  Upload,
  Search,
  CheckCircle2,
  Mail,
  Eye,
} from 'lucide-react';

interface TabsProps {
  currentStep: StepType;
  onStepChange: (step: StepType) => void;
  completedSteps: StepType[];
}

const stepIcons: Record<StepType, React.ReactNode> = {
  import: <Upload size={18} />,
  parse: <Search size={18} />,
  verify: <CheckCircle2 size={18} />,
  generate: <Mail size={18} />,
  review: <Eye size={18} />,
};

const steps: StepType[] = ['import', 'parse', 'verify', 'generate', 'review'];

export const Tabs: React.FC<TabsProps> = ({ currentStep, onStepChange, completedSteps }) => {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex space-x-1" aria-label="Progress">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step);
            const isCurrent = currentStep === step;
            const isPast = completedSteps.includes(step) || steps.indexOf(currentStep) > index;

            return (
              <button
                key={step}
                onClick={() => onStepChange(step)}
                className={cn(
                  'group relative flex items-center px-4 py-4 text-sm font-medium transition-colors duration-200 border-b-2 -mb-px',
                  isCurrent
                    ? 'border-blue-600 text-blue-600'
                    : isPast
                    ? 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    : 'border-transparent text-slate-400 cursor-not-allowed'
                )}
                disabled={!isPast && !isCurrent}
              >
                <span
                  className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-full mr-2',
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5">
                  {stepIcons[step]}
                  {STEP_LABELS[step]}
                </span>
                <span className="sm:hidden">{index + 1}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
