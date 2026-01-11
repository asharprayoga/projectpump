'use client';

import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';

export default function InternalPage() {
    const stats = [
        { label: 'Total Proyek', value: '—', desc: 'Di browser ini' },
        { label: 'Proyek Bulan Ini', value: '—', desc: 'Aktif' },
        { label: 'Most Used Standard', value: 'API 610', desc: 'Centrifugal' },
    ];

    const recentUpdates = [
        { date: 'Jan 2025', title: 'Rules Engine', desc: 'Assisted selection dengan scoring model' },
        { date: 'Jan 2025', title: 'PDF/Excel Export', desc: 'Export laporan lengkap' },
        { date: 'Jan 2025', title: 'Fase 2 & 3', desc: 'Step 3-10 lengkap' },
        { date: 'Dec 2024', title: 'Initial Release', desc: 'Wizard dasar, TDH, NPSH, Power' },
    ];

    const devNotes = [
        'Data proyek disimpan di localStorage browser (client-side)',
        'Untuk backup, selalu ekspor proyek penting ke Excel',
        'Clear browser data = hapus semua proyek tersimpan',
        'Kriteria (NPSH margin, driver margin) menggunakan placeholder — perlu dikonfigurasi formal',
        'Rules Engine threshold dapat disesuaikan di companyCriteria.ts',
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Internal RE</h1>
                <p className="text-gray-600 mb-8">Dashboard internal untuk administrator dan developer</p>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="card text-center">
                            <p className="text-3xl font-bold text-re-blue">{stat.value}</p>
                            <p className="font-medium text-gray-900">{stat.label}</p>
                            <p className="text-sm text-gray-500">{stat.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Recent Updates */}
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold text-re-blue mb-4">Update Terbaru</h2>

                    <div className="space-y-3">
                        {recentUpdates.map((update, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                                <span className="text-xs text-gray-500 whitespace-nowrap min-w-[60px]">{update.date}</span>
                                <div>
                                    <p className="font-medium text-gray-900">{update.title}</p>
                                    <p className="text-sm text-gray-600">{update.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Developer Notes */}
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold text-re-blue mb-4">Developer Notes</h2>

                    <ul className="space-y-2">
                        {devNotes.map((note, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                <span className="text-re-yellow">⚠</span>
                                {note}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Admin Actions */}
                <div className="card bg-gray-100 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => {
                                if (confirm('Yakin hapus semua proyek tersimpan? Aksi ini tidak dapat dibatalkan.')) {
                                    localStorage.removeItem('pumpcalc_projects');
                                    alert('Semua proyek dihapus.');
                                    window.location.reload();
                                }
                            }}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                            🗑 Hapus Semua Proyek
                        </button>

                        <button
                            onClick={() => {
                                const data = localStorage.getItem('pumpcalc_projects');
                                if (data) {
                                    const blob = new Blob([data], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'pumpcalc_backup.json';
                                    a.click();
                                } else {
                                    alert('Tidak ada data untuk di-export.');
                                }
                            }}
                            className="px-4 py-2 bg-re-blue-light text-re-blue rounded-lg text-sm font-medium hover:bg-re-blue/10 transition-colors"
                        >
                            📥 Export All Data (JSON)
                        </button>
                    </div>
                </div>

                {/* Tech Info */}
                <div className="card bg-re-blue-light border-re-blue/20">
                    <h2 className="text-lg font-semibold text-re-blue mb-2">Technical Info</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Framework</p>
                            <p className="font-medium">Next.js 14.2.11</p>
                        </div>
                        <div>
                            <p className="text-gray-500">React</p>
                            <p className="font-medium">18.3.1</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Storage</p>
                            <p className="font-medium">localStorage</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Criteria Version</p>
                            <p className="font-medium">1.0.0-placeholder</p>
                        </div>
                    </div>
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
