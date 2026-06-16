import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './Header';
import { Tabs } from '@/components/ui/Tabs';
import type { StepType } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { ImportModule } from '@/modules/ImportModule';
import { ParseModule } from '@/modules/ParseModule';
import { VerifyModule } from '@/modules/VerifyModule';
import { GenerateModule } from '@/modules/GenerateModule';
import { ReviewModule } from '@/modules/ReviewModule';

export const MainLayout: React.FC = () => {
  const { currentStep, setCurrentStep, importStatus, schedules, generatedEmails } = useAppStore();
  const [localStep, setLocalStep] = useState<StepType>(currentStep);

  useEffect(() => {
    setLocalStep(currentStep);
  }, [currentStep]);

  const completedSteps = useMemo<StepType[]>(() => {
    const completed: StepType[] = [];
    if (importStatus.candidates === 'success' && importStatus.interviewers === 'success') {
      completed.push('import');
    }
    if (schedules.length > 0) {
      completed.push('parse');
    }
    if (schedules.some((s) => s.conflicts.length > 0)) {
      completed.push('verify');
    }
    if (generatedEmails.length > 0) {
      completed.push('generate');
    }
    return completed;
  }, [importStatus, schedules, generatedEmails]);

  const handleStepChange = (step: StepType) => {
    setLocalStep(step);
    setCurrentStep(step);
  };

  const renderModule = () => {
    switch (localStep) {
      case 'import':
        return <ImportModule />;
      case 'parse':
        return <ParseModule />;
      case 'verify':
        return <VerifyModule />;
      case 'generate':
        return <GenerateModule />;
      case 'review':
        return <ReviewModule />;
      default:
        return <ImportModule />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <Tabs
        currentStep={localStep}
        onStepChange={handleStepChange}
        completedSteps={completedSteps}
      />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div
          key={localStep}
          className="animate-fadeIn"
          style={{
            animation: 'fadeInUp 0.3s ease-out',
          }}
        >
          {renderModule()}
        </div>
      </main>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
