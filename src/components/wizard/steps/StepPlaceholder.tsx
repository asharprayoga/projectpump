'use client';

import Button from '@/components/ui/Button';
import StatusPill from '@/components/ui/StatusPill';

interface StepPlaceholderProps {
    stepName: string;
    stepNumber: number;
    status: 'Available' | 'In progress' | 'Planned';
}

export default function StepPlaceholder({ stepName, stepNumber, status }: StepPlaceholderProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-gray-400">{stepNumber}</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Step {stepNumber}: {stepName}</h1>

            <div className="mb-6">
                <StatusPill status={status} />
            </div>

            <p className="text-gray-600 max-w-md mb-8">
                {status === 'Planned'
                    ? 'Modul ini direncanakan untuk pengembangan di masa depan. Cek roadmap untuk update.'
                    : 'Modul ini sedang dalam pengembangan. Beberapa fungsionalitas mungkin terbatas.'}
            </p>

            <div className="flex gap-4">
                <Button variant="secondary" href="/pumpcalc">
                    ← Kembali ke Beranda
                </Button>
                <Button variant="outline" href="/pumpcalc/roadmap">
                    Lihat Roadmap
                </Button>
            </div>
        </div>
    );
}
