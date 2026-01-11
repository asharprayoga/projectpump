'use client';

import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';

export default function DocsPage() {
    const sections = [
        {
            title: 'Pengenalan',
            items: [
                { name: 'Tentang PumpCalc', desc: 'Gambaran umum aplikasi dan tujuan pengembangan' },
                { name: 'Alur Kerja Wizard', desc: 'Panduan step-by-step menggunakan wizard' },
                { name: 'Standar yang Didukung', desc: 'API 610, API 674, API 675, API 676' },
            ]
        },
        {
            title: 'Kalkulasi Teknis',
            items: [
                { name: 'TDH Calculation', desc: 'Rumus dan metodologi Total Dynamic Head' },
                { name: 'NPSHa Calculation', desc: 'Net Positive Suction Head Available' },
                { name: 'Power Calculation', desc: 'Hydraulic power, brake power, motor sizing' },
                { name: 'Governing Case', desc: 'Logika pemilihan kasus kritis' },
            ]
        },
        {
            title: 'Rules Engine',
            items: [
                { name: 'Assisted Selection', desc: 'Cara kerja rekomendasi standar otomatis' },
                { name: 'Scoring Model', desc: 'Rule groups A-F dan bobot scoring' },
                { name: 'Confidence Level', desc: 'High / Medium / Low confidence' },
                { name: 'Override', desc: 'Prosedur override manual dengan traceability' },
            ]
        },
        {
            title: 'API Standards',
            items: [
                { name: 'API 610', desc: 'Centrifugal Pumps for Petroleum & Gas Industry' },
                { name: 'API 674', desc: 'Positive Displacement Pumps — Reciprocating' },
                { name: 'API 675', desc: 'Controlled Volume Metering Pumps' },
                { name: 'API 676', desc: 'Positive Displacement Pumps — Rotary' },
                { name: 'API 682', desc: 'Shaft Sealing Systems for Centrifugal Pumps' },
            ]
        },
        {
            title: 'Referensi',
            items: [
                { name: 'Kriteria Perusahaan', desc: 'NPSH margin, driver margin, dll' },
                { name: 'Unit Conversion', desc: 'SI vs Imperial conversion factors' },
                { name: 'Fluid Properties', desc: 'Database properti fluida standar' },
            ]
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dokumentasi Teknis</h1>
                <p className="text-gray-600 mb-8">Referensi teknis dan panduan penggunaan PumpCalc</p>

                <div className="space-y-8">
                    {sections.map((section) => (
                        <div key={section.title} className="card">
                            <h2 className="text-lg font-semibold text-re-blue mb-4">{section.title}</h2>

                            <div className="space-y-3">
                                {section.items.map((item) => (
                                    <div
                                        key={item.name}
                                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                    >
                                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                                        <p className="text-sm text-gray-600">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Placeholder notice */}
                <div className="mt-8 p-4 bg-re-yellow-light rounded-lg text-sm text-re-yellow border border-re-yellow/20">
                    <strong>⚠️ Catatan:</strong> Dokumentasi lengkap sedang dalam pengembangan.
                    Konten akan ditambahkan secara bertahap seiring dengan pengembangan fitur.
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
