'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { FormCheckbox, FormInput, FormSelect } from '@/components/ui/FormInputs';
import { Project } from '@/types';

interface Step9Props {
    project: Project;
    updateProject: (updates: Partial<Project>) => void;
    goToStep: (step: number) => void;
    markStepComplete: (step: number) => void;
}

interface AuxiliaryItem {
    id: string;
    category: string;
    name: string;
    description: string;
    required: boolean;
    selected: boolean;
    quantity: number;
    notes: string;
}

const AUXILIARY_ITEMS: Omit<AuxiliaryItem, 'selected' | 'quantity' | 'notes'>[] = [
    // Instrumentation
    { id: 'PI', category: 'Instrumentasi', name: 'Pressure Indicator', description: 'Suction & discharge pressure gauges', required: true },
    { id: 'PT', category: 'Instrumentasi', name: 'Pressure Transmitter', description: 'For DCS/PLC monitoring', required: false },
    { id: 'TI', category: 'Instrumentasi', name: 'Temperature Indicator', description: 'Bearing temperature monitoring', required: false },
    { id: 'TT', category: 'Instrumentasi', name: 'Temperature Transmitter', description: 'For DCS/PLC monitoring', required: false },
    { id: 'FI', category: 'Instrumentasi', name: 'Flow Indicator', description: 'Discharge flow measurement', required: false },
    { id: 'VI', category: 'Instrumentasi', name: 'Vibration Monitor', description: 'API 670 vibration monitoring', required: false },

    // Valves
    { id: 'SV', category: 'Valve', name: 'Suction Valve', description: 'Suction isolation valve', required: true },
    { id: 'DV', category: 'Valve', name: 'Discharge Valve', description: 'Discharge isolation valve', required: true },
    { id: 'CV', category: 'Valve', name: 'Check Valve', description: 'Discharge check valve', required: true },
    { id: 'RV', category: 'Valve', name: 'Relief Valve', description: 'Thermal relief / safety valve', required: false },
    { id: 'BV', category: 'Valve', name: 'Minimum Flow Recirculation Valve', description: 'For pump protection', required: false },

    // Accessories
    { id: 'SF', category: 'Aksesori', name: 'Suction Strainer', description: 'Temporary/permanent strainer', required: true },
    { id: 'EF', category: 'Aksesori', name: 'Flexible Coupling', description: 'Expansion joint / flexible connector', required: false },
    { id: 'DP', category: 'Aksesori', name: 'Drain & Vent', description: 'Casing drain and vent connections', required: true },
    { id: 'BP', category: 'Aksesori', name: 'Baseplate', description: 'Common baseplate with motor', required: true },
    { id: 'CG', category: 'Aksesori', name: 'Coupling Guard', description: 'Safety coupling guard', required: true },

    // Protection
    { id: 'LS', category: 'Proteksi', name: 'Low Suction Pressure Switch', description: 'Pump protection interlock', required: false },
    { id: 'HS', category: 'Proteksi', name: 'High Discharge Pressure Switch', description: 'Dead-head protection', required: false },
    { id: 'LF', category: 'Proteksi', name: 'Low Flow Switch', description: 'Minimum flow protection', required: false },
    { id: 'VH', category: 'Proteksi', name: 'Vibration High Alarm', description: 'Bearing damage protection', required: false },
    { id: 'TH', category: 'Proteksi', name: 'Temperature High Alarm', description: 'Bearing overtemp protection', required: false },
];

export default function Step9Auxiliaries({ project, updateProject, goToStep, markStepComplete }: Step9Props) {
    const [items, setItems] = useState<AuxiliaryItem[]>(
        AUXILIARY_ITEMS.map(item => ({
            ...item,
            selected: item.required,
            quantity: 1,
            notes: '',
        }))
    );

    const updateItem = (id: string, updates: Partial<AuxiliaryItem>) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    // Group by category
    const categories = Array.from(new Set(items.map(i => i.category)));

    // Summary
    const selectedItems = items.filter(i => i.selected);
    const requiredItems = items.filter(i => i.required);

    const handleSave = () => {
        markStepComplete(9);
    };

    const handleNext = () => {
        handleSave();
        goToStep(10);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Step 9: Auxiliaries & Instrumentation</h1>
            <p className="text-gray-600 mb-6">Pilih aksesori, instrumentasi, dan sistem proteksi</p>

            {/* Summary */}
            <div className="card bg-re-blue-light border-re-blue/20 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-re-blue">Ringkasan Pemilihan</h2>
                        <p className="text-sm text-gray-600">
                            {selectedItems.length} item dipilih ({requiredItems.length} wajib)
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Standar</p>
                        <p className="font-semibold text-gray-900">{project.pumpStandard.replace('API', 'API ')}</p>
                    </div>
                </div>
            </div>

            {/* Items by Category */}
            {categories.map(category => (
                <div key={category} className="card mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">{category}</h2>

                    <div className="space-y-3">
                        {items.filter(i => i.category === category).map(item => (
                            <div
                                key={item.id}
                                className={`p-4 border rounded-lg ${item.selected ? 'border-re-blue/30 bg-re-blue-light/30' : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={item.selected}
                                            onChange={(e) => updateItem(item.id, { selected: e.target.checked })}
                                            disabled={item.required}
                                            className="mt-1"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono bg-gray-200 px-2 py-0.5 rounded">{item.id}</span>
                                                <span className="font-medium text-gray-900">{item.name}</span>
                                                {item.required && (
                                                    <span className="px-2 py-0.5 bg-re-orange-light text-re-orange text-xs rounded">Wajib</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">{item.description}</p>
                                        </div>
                                    </div>

                                    {item.selected && (
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-gray-500">Qty:</label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={10}
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                                                className="input-field w-16 text-center text-sm"
                                            />
                                        </div>
                                    )}
                                </div>

                                {item.selected && (
                                    <div className="mt-2 ml-7">
                                        <input
                                            type="text"
                                            value={item.notes}
                                            onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                                            placeholder="Catatan / spesifikasi tambahan..."
                                            className="input-field w-full text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Selected Items Summary Table */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Daftar Item Terpilih</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Tag</th>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Nama</th>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Kategori</th>
                                <th className="text-center py-2 px-3 font-medium text-gray-700">Qty</th>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Catatan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedItems.map(item => (
                                <tr key={item.id} className="border-b border-gray-100">
                                    <td className="py-2 px-3 font-mono">{item.id}</td>
                                    <td className="py-2 px-3">{item.name}</td>
                                    <td className="py-2 px-3">{item.category}</td>
                                    <td className="py-2 px-3 text-center">{item.quantity}</td>
                                    <td className="py-2 px-3 text-gray-600">{item.notes || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                <Button variant="secondary" onClick={() => goToStep(8)}>
                    ← Kembali ke Step 8
                </Button>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSave}>
                        Simpan
                    </Button>
                    <Button variant="primary" onClick={handleNext}>
                        Lanjut: Test & Documentation →
                    </Button>
                </div>
            </div>
        </div>
    );
}
