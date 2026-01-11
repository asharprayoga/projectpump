'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import WizardStepper from '@/components/wizard/WizardStepper';
import { getProject, saveProject } from '@/lib/storage';
import { Project } from '@/types';

// Step Components
import Step1Service from '@/components/wizard/steps/Step1Service';
import Step2Hydraulics from '@/components/wizard/steps/Step2Hydraulics';
import Step3Config from '@/components/wizard/steps/Step3Config';
import Step4Sizing from '@/components/wizard/steps/Step4Sizing';
import Step5NPSH from '@/components/wizard/steps/Step5NPSH';
import Step6Power from '@/components/wizard/steps/Step6Power';
import Step7Compliance from '@/components/wizard/steps/Step7Compliance';
import Step8Seal from '@/components/wizard/steps/Step8Seal';
import Step9Auxiliaries from '@/components/wizard/steps/Step9Auxiliaries';
import Step10TestDoc from '@/components/wizard/steps/Step10TestDoc';
import Step11Results from '@/components/wizard/steps/Step11Results';

export default function ProjectWizardPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const projectId = params.id as string;
    const stepParam = searchParams.get('step');
    const currentStep = stepParam ? parseInt(stepParam, 10) : 1;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadedProject = getProject(projectId);
        if (loadedProject) {
            setProject(loadedProject);
        } else {
            router.push('/pumpcalc');
        }
        setLoading(false);
    }, [projectId, router]);

    const updateProject = (updates: Partial<Project>) => {
        if (!project) return;

        const updatedProject = { ...project, ...updates };
        setProject(updatedProject);
        saveProject(updatedProject);
    };

    const goToStep = (step: number) => {
        router.push(`/pumpcalc/project/${projectId}?step=${step}`);
    };

    const markStepComplete = (step: number) => {
        if (!project) return;

        const completedSteps = project.completedSteps.includes(step)
            ? project.completedSteps
            : [...project.completedSteps, step];

        updateProject({ completedSteps, currentStep: step });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Memuat proyek...</div>
            </div>
        );
    }

    if (!project) {
        return null;
    }

    const renderStep = () => {
        const commonProps = {
            project,
            updateProject,
            goToStep,
            markStepComplete,
        };

        switch (currentStep) {
            case 1:
                return <Step1Service {...commonProps} />;
            case 2:
                return <Step2Hydraulics {...commonProps} />;
            case 3:
                return <Step3Config {...commonProps} />;
            case 4:
                return <Step4Sizing {...commonProps} />;
            case 5:
                return <Step5NPSH {...commonProps} />;
            case 6:
                return <Step6Power {...commonProps} />;
            case 7:
                return <Step7Compliance {...commonProps} />;
            case 8:
                return <Step8Seal {...commonProps} />;
            case 9:
                return <Step9Auxiliaries {...commonProps} />;
            case 10:
                return <Step10TestDoc {...commonProps} />;
            case 11:
                return <Step11Results {...commonProps} />;
            default:
                return <Step1Service {...commonProps} />;
        }
    };

    // Get display standard
    const displayStandard = project.selectedStandard !== 'UNSET'
        ? (project.selectedStandard as string).replace('API', 'API ')
        : project.pumpStandard.replace('API', 'API ');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <div className="flex-1 flex">
                {/* Sidebar Stepper */}
                <WizardStepper
                    projectId={projectId}
                    currentStep={currentStep}
                    completedSteps={project.completedSteps}
                />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto px-6 py-8">
                        {/* Project Info Bar */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold text-gray-900">{project.metadata.projectName}</h2>
                                <p className="text-sm text-gray-500">
                                    {project.metadata.tagNo} • {displayStandard} • {project.units}
                                    {project.selectionSource === 'override' && (
                                        <span className="ml-2 text-re-orange">(Override)</span>
                                    )}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">
                                    Terakhir diubah: {new Date(project.metadata.modifiedDate).toLocaleDateString('id-ID')}
                                </div>
                                {project.recommendationState && project.recommendationState !== 'not_generated' && (
                                    <div className={`text-xs mt-1 ${project.recommendationState === 'accepted' ? 'text-re-green' :
                                            project.recommendationState === 'overridden' ? 'text-re-orange' :
                                                'text-gray-500'
                                        }`}>
                                        {project.recommendationState === 'accepted' ? '✓ Rekomendasi diterima' :
                                            project.recommendationState === 'overridden' ? '⚡ Override' :
                                                project.recommendationState === 'outdated' ? '⚠ Rekomendasi outdated' : ''}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step Content */}
                        {renderStep()}
                    </div>
                </main>
            </div>
        </div>
    );
}
