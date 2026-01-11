'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WIZARD_STEPS } from '@/types';

interface WizardStepperProps {
    projectId: string;
    currentStep: number;
    completedSteps: number[];
}

export default function WizardStepper({ projectId, currentStep, completedSteps }: WizardStepperProps) {
    const pathname = usePathname();

    return (
        <nav className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
            <div className="p-4">
                <h2 className="font-semibold text-gray-900 mb-4">Langkah Wizard</h2>

                <div className="space-y-1">
                    {WIZARD_STEPS.map((step) => {
                        const isActive = currentStep === step.id;
                        const isCompleted = completedSteps.includes(step.id);
                        const isPlanned = step.status === 'Planned';

                        const statusLabel = step.status === 'In progress' ? 'Dalam Proses' :
                            step.status === 'Planned' ? 'Direncanakan' : '';

                        return (
                            <Link
                                key={step.id}
                                href={isPlanned ? '#' : `/pumpcalc/project/${projectId}?step=${step.id}`}
                                className={`
                  flex items-start gap-3 p-3 rounded-lg transition-all duration-200
                  ${isActive
                                        ? 'bg-re-blue-light border-l-4 border-re-blue'
                                        : 'hover:bg-gray-50'}
                  ${isPlanned ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                                onClick={(e) => isPlanned && e.preventDefault()}
                            >
                                {/* Step Number/Status */}
                                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0
                  ${isCompleted
                                        ? 'bg-re-green text-white'
                                        : isActive
                                            ? 'bg-re-blue text-white'
                                            : 'bg-gray-200 text-gray-600'}
                `}>
                                    {isCompleted ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        step.id
                                    )}
                                </div>

                                {/* Step Info */}
                                <div className="flex-1 min-w-0">
                                    <div className={`
                    text-sm font-medium truncate
                    ${isActive ? 'text-re-blue' : 'text-gray-900'}
                  `}>
                                        {step.shortName}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {step.description}
                                    </div>

                                    {/* Status Badge for non-available */}
                                    {step.status !== 'Available' && (
                                        <span className={`
                      inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full
                      ${step.status === 'In progress'
                                                ? 'bg-re-yellow-light text-re-yellow'
                                                : 'bg-gray-100 text-gray-500'}
                    `}>
                                            {statusLabel}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
