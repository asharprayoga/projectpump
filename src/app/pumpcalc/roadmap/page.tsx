'use client';

import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';

export default function RoadmapPage() {
    const phases = [
        {
            phase: 'Fase 1 — MVP (Saat Ini)',
            status: 'Dalam Proses',
            items: [
                { name: 'Inisiasi Proyek (Step 0)', status: 'Selesai' },
                { name: 'Data Servis/Proses (Step 1)', status: 'Selesai' },
                { name: 'System Hydraulics - TDH (Step 2)', status: 'Selesai' },
                { name: 'NPSH Verification (Step 5)', status: 'Selesai' },
                { name: 'Power & Driver Sizing (Step 6)', status: 'Selesai' },
                { name: 'Hasil & Laporan (Step 11)', status: 'Selesai' },
                { name: 'Ekspor PDF/Excel', status: 'Dalam Proses' },
            ],
        },
        {
            phase: 'Fase 2 — Extended Inputs',
            status: 'Direncanakan',
            items: [
                { name: 'Pump Type & Configuration (Step 3)', status: 'Direncanakan' },
                { name: 'Preliminary Sizing Logic (Step 4)', status: 'Direncanakan' },
                { name: 'Input & Interpolasi Kurva Vendor', status: 'Direncanakan' },
                { name: 'Visualisasi System Curve', status: 'Direncanakan' },
            ],
        },
        {
            phase: 'Fase 3 — Compliance & Standards',
            status: 'Direncanakan',
            items: [
                { name: 'API 610 Compliance Matrix (Step 7)', status: 'Direncanakan' },
                { name: 'Seal System - API 682 (Step 8)', status: 'Direncanakan' },
                { name: 'Auxiliaries & Instrumentation (Step 9)', status: 'Direncanakan' },
                { name: 'Test & Documentation (Step 10)', status: 'Direncanakan' },
            ],
        },
        {
            phase: 'Fase 4 — Advanced Features',
            status: 'Masa Depan',
            items: [
                { name: 'API 614 Lube/Seal Oil System', status: 'Masa Depan' },
                { name: 'API 670 Machinery Protection', status: 'Masa Depan' },
                { name: 'Kolaborasi multi-user', status: 'Masa Depan' },
                { name: 'Integrasi database', status: 'Masa Depan' },
            ],
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Selesai': return 'bg-re-green text-white';
            case 'Dalam Proses': return 'bg-re-yellow text-white';
            case 'Direncanakan': return 'bg-gray-300 text-gray-700';
            case 'Masa Depan': return 'bg-gray-200 text-gray-500';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <a href="/pumpcalc" className="hover:text-re-blue">PumpCalc</a>
                    <span>/</span>
                    <span className="text-gray-900">Roadmap</span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Roadmap Pengembangan</h1>
                <p className="text-gray-600 mb-8">Pantau progress pengembangan PumpCalc Web App</p>

                <div className="space-y-8">
                    {phases.map((phase, idx) => (
                        <div key={idx} className="card">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">{phase.phase}</h2>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(phase.status)}`}>
                                    {phase.status}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {phase.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-700">{item.name}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <Button href="/pumpcalc" variant="secondary">
                        ← Kembali ke Beranda
                    </Button>
                </div>
            </main>
        </div>
    );
}
