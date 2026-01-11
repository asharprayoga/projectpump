'use client';

import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Tentang PumpCalc</h1>
                <p className="text-gray-600 mb-8">Platform spesifikasi & verifikasi pompa untuk Rekayasa Engineering</p>

                {/* Overview */}
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold text-re-blue mb-4">Gambaran Umum</h2>
                    <p className="text-gray-700 mb-4">
                        <strong>PumpCalc Web App</strong> adalah platform internal Rekayasa Engineering untuk
                        spesifikasi dan verifikasi pompa berbasis standar API (API 610, API 674, API 675, API 676).
                    </p>
                    <p className="text-gray-700">
                        Aplikasi ini dirancang untuk menyederhanakan proses desain pompa dengan workflow wizard
                        yang terstruktur, kalkulasi otomatis, dan output yang siap untuk review internal.
                    </p>
                </div>

                {/* Features */}
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold text-re-blue mb-4">Fitur Utama</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">🧙 Wizard Workflow</h3>
                            <p className="text-sm text-gray-600">
                                11 langkah terstruktur dari inisiasi hingga ekspor laporan
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">🤖 Rules Engine</h3>
                            <p className="text-sm text-gray-600">
                                Rekomendasi otomatis standar pompa berdasarkan input servis
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">📊 Multi-Case Analysis</h3>
                            <p className="text-sm text-gray-600">
                                Analisis Min/Normal/Max dengan governing case detection
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">✅ Compliance Check</h3>
                            <p className="text-sm text-gray-600">
                                Matriks kepatuhan API 610 dan pemilihan seal API 682
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">📄 Export</h3>
                            <p className="text-sm text-gray-600">
                                Ekspor laporan ke PDF dan Excel dengan format profesional
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">🔄 Traceable</h3>
                            <p className="text-sm text-gray-600">
                                Setiap hasil dilengkapi basis, asumsi, dan reasoning
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold text-re-blue mb-4">Technology Stack</h2>

                    <div className="flex flex-wrap gap-2">
                        {['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS', 'jsPDF', 'xlsx'].map(tech => (
                            <span key={tech} className="px-3 py-1 bg-re-blue-light text-re-blue rounded-full text-sm font-medium">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Version */}
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold text-re-blue mb-4">Versi & Update</h2>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="status-available">v1.0</span>
                            <div>
                                <p className="font-medium text-gray-900">Initial Release</p>
                                <p className="text-sm text-gray-600">
                                    Wizard lengkap 11 step, Rules Engine, PDF/Excel export, API 610 compliance
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Credits */}
                <div className="card bg-re-blue-light border-re-blue/20">
                    <h2 className="text-lg font-semibold text-re-blue mb-2">Dikembangkan oleh</h2>
                    <p className="text-gray-700">
                        Tim Engineering Rekayasa Engineering
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        © 2024 Rekayasa Engineering. Internal Use Only.
                    </p>
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
