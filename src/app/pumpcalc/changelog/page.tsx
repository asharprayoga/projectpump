'use client';

import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';

export default function ChangelogPage() {
    const releases = [
        {
            version: 'v0.1.0',
            date: '11 Januari 2026',
            type: 'Rilis Awal',
            changes: [
                'Inisiasi Proyek (Step 0) - metadata, standar, mode workflow',
                'Data Servis/Proses (Step 1) - input fluida multi-kasus dengan warning',
                'System Hydraulics (Step 2) - kalkulasi TDH dengan breakdown',
                'NPSH Verification (Step 5) - kalkulasi NPSHa, cek margin',
                'Power & Driver Sizing (Step 6) - rekomendasi sizing motor',
                'Hasil & Laporan (Step 11) - ringkasan dengan governing cases',
                'Halaman Proyek Tersimpan dengan operasi CRUD',
                'Persistensi LocalStorage',
                'Interface dalam Bahasa Indonesia',
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <a href="/pumpcalc" className="hover:text-re-blue">PumpCalc</a>
                    <span>/</span>
                    <span className="text-gray-900">Changelog</span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Changelog</h1>
                <p className="text-gray-600 mb-8">Riwayat versi dan catatan rilis</p>

                <div className="space-y-6">
                    {releases.map((release, idx) => (
                        <div key={idx} className="card">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="px-3 py-1 bg-re-blue text-white text-lg font-bold rounded-lg">
                                    {release.version}
                                </span>
                                <span className="text-gray-500">{release.date}</span>
                                <span className="px-2 py-0.5 bg-re-green-light text-re-green text-sm font-medium rounded">
                                    {release.type}
                                </span>
                            </div>

                            <ul className="space-y-2">
                                {release.changes.map((change, changeIdx) => (
                                    <li key={changeIdx} className="flex items-start gap-2 text-gray-700">
                                        <span className="text-re-green mt-1">✓</span>
                                        <span>{change}</span>
                                    </li>
                                ))}
                            </ul>
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
