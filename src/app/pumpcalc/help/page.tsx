'use client';

import { useState } from 'react';
import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';

export default function HelpPage() {
    const [activeTab, setActiveTab] = useState('faq');

    const faqs = [
        {
            q: 'Bagaimana cara memulai proyek baru?',
            a: 'Klik tombol "Mulai Proyek Baru" di halaman utama. Isi informasi proyek seperti nama, tag nomor, dan pilih sistem satuan (SI/Imperial). Kemudian ikuti wizard step-by-step.',
        },
        {
            q: 'Apa perbedaan Assisted dan Manual selection?',
            a: 'Assisted selection menggunakan Rules Engine untuk merekomendasikan standar pompa berdasarkan input servis (flow, viscosity, dll). Manual selection memungkinkan Anda memilih standar secara langsung.',
        },
        {
            q: 'Bagaimana cara menginput data untuk beberapa kasus operasi?',
            a: 'Secara default, ada 3 kasus: Min, Normal, dan Max. Anda bisa menambah kasus custom dengan klik "+ Tambah Kasus". Setiap kasus memiliki data fluida dan kondisi operasi tersendiri.',
        },
        {
            q: 'Apa itu Governing Case?',
            a: 'Governing case adalah kasus operasi yang menentukan sizing pompa. Untuk TDH, ini adalah kasus dengan head tertinggi. Untuk NPSH, ini adalah kasus dengan margin NPSH terkecil.',
        },
        {
            q: 'Bagaimana cara ekspor hasil ke PDF/Excel?',
            a: 'Setelah menyelesaikan semua step, navigasi ke Step 11 (Hasil & Laporan). Di sana ada tombol "Ekspor ke PDF" dan "Ekspor ke Excel".',
        },
        {
            q: 'Apakah data saya tersimpan?',
            a: 'Ya, data proyek tersimpan di localStorage browser Anda. Data akan tetap ada selama tidak menghapus data browser. Untuk backup, ekspor proyek ke Excel secara berkala.',
        },
        {
            q: 'Bagaimana jika NPSHa < NPSHr?',
            a: 'Status akan ditampilkan sebagai NOT OK. Anda perlu meninjau ulang desain sistem: naikkan level cairan, kurangi friction losses, atau pilih pompa dengan NPSHr lebih rendah.',
        },
        {
            q: 'Apa itu API 610 Compliance Matrix?',
            a: 'Ini adalah checklist requirement API 610 yang perlu dipenuhi oleh pompa. Anda dapat menandai mana yang applicable, compliant, atau non-compliant untuk dokumentasi.',
        },
    ];

    const shortcuts = [
        { key: 'Ctrl + S', action: 'Simpan progres saat ini' },
        { key: '←', action: 'Kembali ke step sebelumnya' },
        { key: '→', action: 'Lanjut ke step berikutnya' },
        { key: 'Tab', action: 'Pindah antar field input' },
        { key: 'Enter', action: 'Konfirmasi input/dialog' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Bantuan & Dukungan</h1>
                <p className="text-gray-600 mb-8">FAQ, panduan singkat, dan cara mendapatkan bantuan</p>

                {/* Tabs */}
                <div className="flex gap-2 mb-8">
                    {[
                        { id: 'faq', label: 'FAQ' },
                        { id: 'shortcuts', label: 'Keyboard Shortcuts' },
                        { id: 'contact', label: 'Kontak' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-re-blue text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* FAQ */}
                {activeTab === 'faq' && (
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <details key={idx} className="card group">
                                <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                                    {faq.q}
                                    <span className="text-re-blue ml-2 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="mt-3 text-gray-600 text-sm">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                )}

                {/* Shortcuts */}
                {activeTab === 'shortcuts' && (
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Keyboard Shortcuts</h2>

                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 px-3 font-medium text-gray-700">Shortcut</th>
                                    <th className="text-left py-2 px-3 font-medium text-gray-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shortcuts.map((item, idx) => (
                                    <tr key={idx} className="border-b border-gray-100">
                                        <td className="py-2 px-3">
                                            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{item.key}</code>
                                        </td>
                                        <td className="py-2 px-3 text-gray-600">{item.action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Contact */}
                {activeTab === 'contact' && (
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kontak Dukungan</h2>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-medium text-gray-900">📧 Email</h3>
                                <p className="text-gray-600 text-sm mt-1">engineering@rekayasa.co.id</p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-medium text-gray-900">💬 Tim Engineering</h3>
                                <p className="text-gray-600 text-sm mt-1">
                                    Hubungi Lead Engineer untuk pertanyaan teknis atau request fitur baru
                                </p>
                            </div>

                            <div className="p-4 bg-re-blue-light rounded-lg">
                                <h3 className="font-medium text-re-blue">🐛 Lapor Bug</h3>
                                <p className="text-gray-600 text-sm mt-1">
                                    Jika menemukan bug atau error, screenshot halaman dan kirim ke tim IT
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <Button href="/pumpcalc" variant="secondary">
                        ← Kembali ke Beranda
                    </Button>
                </div>
            </main>
        </div>
    );
}
