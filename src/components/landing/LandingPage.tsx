'use client';

import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';
import StepCard from '@/components/ui/StepCard';
import ModuleItem from '@/components/ui/ModuleItem';

export default function LandingPage() {
    const stepCards = [
        { number: '01', title: 'Inisiasi Proyek', description: 'Nama proyek, unit, tekanan/vakum, temperatur' },
        { number: '02', title: 'Data Servis & Kasus', description: 'Data fluida, kasus Min/Normal/Max' },
        { number: '03', title: 'Hidraulik & Verifikasi', description: 'TDH, NPSH, Power per kasus, governing case' },
        { number: '04', title: 'Hasil & Laporan', description: 'Ringkasan, datasheet, ekspor PDF/Excel' },
    ];

    const modules = [
        { name: 'Inisiasi Proyek (Step 0)', status: 'Available' as const },
        { name: 'Data Servis / Proses (Step 1)', status: 'Available' as const },
        { name: 'System Hydraulics (Step 2)', status: 'Available' as const },
        { name: 'Pump Type & Configuration (Step 3)', status: 'Available' as const },
        { name: 'Preliminary Sizing (Step 4)', status: 'Available' as const },
        { name: 'NPSH Verification (Step 5)', status: 'Available' as const },
        { name: 'Power & Driver Sizing (Step 6)', status: 'Available' as const },
        { name: 'API 610 Compliance (Step 7)', status: 'Available' as const },
        { name: 'Seal System — API 682 (Step 8)', status: 'Available' as const },
        { name: 'Auxiliaries & Instrumentation (Step 9)', status: 'Available' as const },
        { name: 'Test & Documentation (Step 10)', status: 'Available' as const },
        { name: 'Hasil & Laporan (Step 11)', status: 'Available' as const },
        { name: 'Ekspor PDF/Excel', status: 'Available' as const },
        { name: 'Rules Engine (Assisted Selection)', status: 'Available' as const },
    ];

    const roadmap = [
        { name: 'Vendor Curve Interpolation', status: 'In progress' as const },
        { name: 'System Curve Visualization', status: 'Planned' as const },
        { name: 'Multi-Pump Configuration', status: 'Planned' as const },
        { name: 'API 674/675/676 Compliance Matrix', status: 'Planned' as const },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                    {/* Left Panel - Hero Section */}
                    <div className="lg:col-span-7 re-card rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
                        {/* Decorative blurs */}
                        <div className="pointer-events-none absolute -top-24 -right-28 h-64 w-64 rounded-full bg-re-blue/10 blur-2xl" />
                        <div className="pointer-events-none absolute -bottom-24 -left-28 h-64 w-64 rounded-full bg-re-green/10 blur-2xl" />

                        {/* Subtitle */}
                        <p className="text-xs md:text-sm re-muted">Spesifikasi & verifikasi pompa</p>

                        {/* Main Title with animated gradient */}
                        <h1 className="mt-3 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.03]">
                            <span className="re-animated-gradient">PumpCalc</span>{" "}
                            <span className="text-gray-900">Web App</span>
                        </h1>

                        {/* Description */}
                        <p className="mt-6 text-gray-700 text-lg leading-relaxed max-w-xl">
                            Platform internal Rekayasa Engineering untuk{' '}
                            <span className="text-re-blue font-semibold">spesifikasi & verifikasi pompa</span>
                            {' '}berbasis{' '}
                            <span className="text-re-orange font-semibold">API 610 / API 674 / API 675 / API 676</span>.
                            {' '}Input dibuat ringkas, workflow berbentuk wizard, dan output disajikan untuk{' '}
                            <span className="text-re-green font-semibold">review cepat</span>
                            {' '}(per kasus, governing case, OK/NOT OK).
                        </p>

                        {/* Step Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 mb-8">
                            {stepCards.map((card) => (
                                <StepCard
                                    key={card.number}
                                    number={card.number}
                                    title={card.title}
                                    description={card.description}
                                />
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex items-center gap-4 mb-6">
                            <Button href="/pumpcalc/new" variant="primary">
                                Mulai Proyek Baru
                            </Button>
                            <Button href="/pumpcalc/saved" variant="secondary">
                                Proyek Tersimpan
                            </Button>
                        </div>

                        {/* Quick Links */}
                        <div className="flex flex-wrap gap-3">
                            <a href="/pumpcalc/quick" className="text-re-blue hover:underline font-medium text-sm">
                                Kalkulator Cepat
                            </a>
                            <span className="text-gray-300">|</span>
                            <a href="/pumpcalc/about" className="text-re-blue hover:underline font-medium text-sm">
                                Tentang
                            </a>
                            <span className="text-gray-300">|</span>
                            <a href="/pumpcalc/internal" className="text-re-blue hover:underline font-medium text-sm">
                                Internal RE
                            </a>
                        </div>
                    </div>

                    {/* Right Panel - Scope & Development */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Module Status Card */}
                        <div className="re-card p-6 rounded-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Status modul</p>
                                    <h2 className="text-xl font-semibold text-re-blue">Fitur Tersedia</h2>
                                </div>
                                <span className="status-available">Modular</span>
                            </div>

                            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                                {modules.map((module) => (
                                    <ModuleItem
                                        key={module.name}
                                        name={module.name}
                                        status={module.status}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Roadmap Card */}
                        <div className="re-card p-6 rounded-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Roadmap</p>
                                    <h2 className="text-xl font-semibold text-re-yellow">Dalam Pengembangan</h2>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {roadmap.map((item) => (
                                    <ModuleItem
                                        key={item.name}
                                        name={item.name}
                                        status={item.status}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Action Links */}
                        <div className="flex flex-wrap gap-2">
                            <Button href="/pumpcalc/docs" variant="outline">
                                Dokumentasi Teknis
                            </Button>
                            <Button href="/pumpcalc/help" variant="outline">
                                Bantuan & Dukungan
                            </Button>
                        </div>

                        {/* Info Box */}
                        <div className="bg-re-blue-light rounded-xl p-4 text-sm text-gray-700">
                            <p>
                                Target utama UI ini: engineer bisa bikin proyek, isi input minimal,
                                dan dapat hasil yang bisa langsung dipakai untuk{' '}
                                <span className="text-re-blue font-medium">review internal</span>
                                {' '}(traceable & konsisten).
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
