'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { FormCheckbox } from '@/components/ui/FormInputs';
import { Project } from '@/types';

interface Step10Props {
    project: Project;
    updateProject: (updates: Partial<Project>) => void;
    goToStep: (step: number) => void;
    markStepComplete: (step: number) => void;
}

interface ChecklistItem {
    id: string;
    category: string;
    name: string;
    description: string;
    required: boolean;
    checked: boolean;
    notes: string;
}

const CHECKLIST_ITEMS: Omit<ChecklistItem, 'checked' | 'notes'>[] = [
    // Testing
    { id: 'T1', category: 'Pengujian', name: 'Hydrostatic Test', description: 'Pressure test at 1.5x MAWP per API 610 §8.3.1', required: true },
    { id: 'T2', category: 'Pengujian', name: 'Performance Test', description: 'Factory performance test per HI 14.6', required: true },
    { id: 'T3', category: 'Pengujian', name: 'NPSH Test', description: 'NPSH injection test (jika diperlukan)', required: false },
    { id: 'T4', category: 'Pengujian', name: 'Mechanical Running Test', description: 'Minimum 4 jam running test', required: true },
    { id: 'T5', category: 'Pengujian', name: 'Vibration Test', description: 'Pengukuran vibrasi sesuai API 610 Table 4', required: true },
    { id: 'T6', category: 'Pengujian', name: 'Complete Unit Test', description: 'String test dengan driver aktual', required: false },

    // Inspection
    { id: 'I1', category: 'Inspeksi', name: 'Material Verification', description: 'PMI dan sertifikat material', required: true },
    { id: 'I2', category: 'Inspeksi', name: 'Dimensional Check', description: 'Verifikasi dimensi kritis', required: true },
    { id: 'I3', category: 'Inspeksi', name: 'Surface Finish', description: 'Inspeksi kualitas permukaan', required: false },
    { id: 'I4', category: 'Inspeksi', name: 'Weld Inspection', description: 'NDT untuk pengelasan kritis', required: false },
    { id: 'I5', category: 'Inspeksi', name: 'Balance Check', description: 'Balancing report impeller dan rotor', required: true },
    { id: 'I6', category: 'Inspeksi', name: 'Painting Inspection', description: 'Coating thickness dan adhesion', required: false },

    // Documentation
    { id: 'D1', category: 'Dokumentasi', name: 'Datasheet', description: 'API 610 pump datasheet', required: true },
    { id: 'D2', category: 'Dokumentasi', name: 'GA Drawing', description: 'General arrangement drawing', required: true },
    { id: 'D3', category: 'Dokumentasi', name: 'Sectional Drawing', description: 'Cross-section drawing', required: true },
    { id: 'D4', category: 'Dokumentasi', name: 'Performance Curve', description: 'Certified performance curve', required: true },
    { id: 'D5', category: 'Dokumentasi', name: 'O&M Manual', description: 'Operation & maintenance manual', required: true },
    { id: 'D6', category: 'Dokumentasi', name: 'Spare Parts List', description: 'Recommended spare parts', required: true },
    { id: 'D7', category: 'Dokumentasi', name: 'Material Certificates', description: 'MTR dan sertifikat material', required: true },
    { id: 'D8', category: 'Dokumentasi', name: 'Test Reports', description: 'Hasil pengujian', required: true },
    { id: 'D9', category: 'Dokumentasi', name: 'QA/QC Records', description: 'Catatan quality assurance', required: false },

    // Certification
    { id: 'C1', category: 'Sertifikasi', name: 'ATEX Certificate', description: 'Untuk area berbahaya (jika diperlukan)', required: false },
    { id: 'C2', category: 'Sertifikasi', name: 'API Monogram', description: 'API 610 monogram license', required: false },
    { id: 'C3', category: 'Sertifikasi', name: 'Material Traceability', description: 'Full material traceability', required: false },
];

export default function Step10TestDoc({ project, updateProject, goToStep, markStepComplete }: Step10Props) {
    const [items, setItems] = useState<ChecklistItem[]>(
        CHECKLIST_ITEMS.map(item => ({
            ...item,
            checked: item.required,
            notes: '',
        }))
    );

    const updateItem = (id: string, updates: Partial<ChecklistItem>) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    // Group by category
    const categories = Array.from(new Set(items.map(i => i.category)));

    // Summary
    const checkedItems = items.filter(i => i.checked);
    const requiredItems = items.filter(i => i.required);
    const missingRequired = requiredItems.filter(i => !i.checked);

    const handleSave = () => {
        markStepComplete(10);
    };

    const handleNext = () => {
        handleSave();
        goToStep(11);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Step 10: Test & Documentation</h1>
            <p className="text-gray-600 mb-6">Tentukan kebutuhan pengujian, inspeksi, dan dokumentasi</p>

            {/* Summary */}
            <div className="card mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-3xl font-bold text-gray-900">{items.length}</p>
                        <p className="text-sm text-gray-600">Total Item</p>
                    </div>
                    <div className="p-4 bg-re-green-light rounded-lg text-center">
                        <p className="text-3xl font-bold text-re-green">{checkedItems.length}</p>
                        <p className="text-sm text-gray-600">Dipilih</p>
                    </div>
                    <div className="p-4 bg-re-orange-light rounded-lg text-center">
                        <p className="text-3xl font-bold text-re-orange">{requiredItems.length}</p>
                        <p className="text-sm text-gray-600">Wajib</p>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${missingRequired.length > 0 ? 'bg-red-100' : 'bg-re-blue-light'}`}>
                        <p className={`text-3xl font-bold ${missingRequired.length > 0 ? 'text-red-600' : 'text-re-blue'}`}>
                            {missingRequired.length}
                        </p>
                        <p className="text-sm text-gray-600">Wajib Belum Dipilih</p>
                    </div>
                </div>
            </div>

            {/* Warning for missing required items */}
            {missingRequired.length > 0 && (
                <div className="card bg-red-50 border-red-200 mb-6">
                    <h3 className="font-semibold text-red-700 mb-2">⚠️ Item Wajib Belum Dipilih</h3>
                    <ul className="list-disc list-inside text-sm text-red-700">
                        {missingRequired.map(item => (
                            <li key={item.id}>{item.id} — {item.name}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Checklist by Category */}
            {categories.map(category => (
                <div key={category} className="card mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">{category}</h2>

                    <div className="space-y-3">
                        {items.filter(i => i.category === category).map(item => (
                            <div
                                key={item.id}
                                className={`p-4 border rounded-lg ${item.checked ? 'border-re-green/30 bg-re-green-light/20' :
                                    item.required ? 'border-red-200 bg-red-50' : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={item.checked}
                                        onChange={(e) => updateItem(item.id, { checked: e.target.checked })}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono bg-gray-200 px-2 py-0.5 rounded">{item.id}</span>
                                            <span className="font-medium text-gray-900">{item.name}</span>
                                            {item.required && (
                                                <span className="px-2 py-0.5 bg-re-orange-light text-re-orange text-xs rounded">Wajib</span>
                                            )}
                                            {item.checked && (
                                                <span className="text-re-green">✓</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">{item.description}</p>

                                        {item.checked && (
                                            <input
                                                type="text"
                                                value={item.notes}
                                                onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                                                placeholder="Catatan tambahan..."
                                                className="input-field w-full text-sm mt-2"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Document Deliverables Summary */}
            <div className="card bg-re-blue-light border-re-blue/20 mb-6">
                <h2 className="text-lg font-semibold text-re-blue mb-4">Ringkasan Deliverables</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Pengujian</p>
                        <p className="font-semibold text-gray-900">
                            {items.filter(i => i.category === 'Pengujian' && i.checked).length} test
                        </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Inspeksi</p>
                        <p className="font-semibold text-gray-900">
                            {items.filter(i => i.category === 'Inspeksi' && i.checked).length} item
                        </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Dokumentasi</p>
                        <p className="font-semibold text-gray-900">
                            {items.filter(i => i.category === 'Dokumentasi' && i.checked).length} dokumen
                        </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Sertifikasi</p>
                        <p className="font-semibold text-gray-900">
                            {items.filter(i => i.category === 'Sertifikasi' && i.checked).length} sertifikat
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                <Button variant="secondary" onClick={() => goToStep(9)}>
                    ← Kembali ke Step 9
                </Button>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSave}>
                        Simpan
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleNext}
                        disabled={missingRequired.length > 0}
                    >
                        Lanjut: Hasil & Laporan →
                    </Button>
                </div>
            </div>

            {missingRequired.length > 0 && (
                <p className="text-sm text-red-600 mt-4 text-center">
                    Pilih semua item wajib untuk melanjutkan.
                </p>
            )}
        </div>
    );
}
