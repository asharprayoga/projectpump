'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { FormCheckbox, FormInput } from '@/components/ui/FormInputs';
import { Project } from '@/types';

interface Step7Props {
    project: Project;
    updateProject: (updates: Partial<Project>) => void;
    goToStep: (step: number) => void;
    markStepComplete: (step: number) => void;
}

// API 610 Compliance Requirements
interface ComplianceItem {
    id: string;
    category: string;
    requirement: string;
    clause: string;
    isApplicable: boolean;
    isCompliant: boolean | null;
    notes: string;
}

const API610_REQUIREMENTS: Omit<ComplianceItem, 'isApplicable' | 'isCompliant' | 'notes'>[] = [
    // Design Requirements
    { id: 'D1', category: 'Desain', requirement: 'Continuous service at rated conditions', clause: '6.1.1' },
    { id: 'D2', category: 'Desain', requirement: 'Maximum allowable working pressure (MAWP)', clause: '6.1.4' },
    { id: 'D3', category: 'Desain', requirement: 'Design temperature range', clause: '6.1.5' },
    { id: 'D4', category: 'Desain', requirement: 'Nozzle loads per API 610 Table 4', clause: '6.3.4' },
    { id: 'D5', category: 'Desain', requirement: 'Suction specific speed (Nss) limit', clause: '6.1.14' },

    // Materials
    { id: 'M1', category: 'Material', requirement: 'Casing material per Table 2', clause: '6.12.1' },
    { id: 'M2', category: 'Material', requirement: 'Impeller material per Table 2', clause: '6.12.2' },
    { id: 'M3', category: 'Material', requirement: 'Shaft material requirements', clause: '6.12.3' },
    { id: 'M4', category: 'Material', requirement: 'Impact test for low temperature', clause: '6.12.6' },

    // Mechanical
    { id: 'C1', category: 'Mekanikal', requirement: 'Bearing type and design life', clause: '6.10.1' },
    { id: 'C2', category: 'Mekanikal', requirement: 'Minimum bearing life 25,000 hours', clause: '6.10.2' },
    { id: 'C3', category: 'Mekanikal', requirement: 'Shaft sealing per API 682', clause: '6.8.1' },
    { id: 'C4', category: 'Mekanikal', requirement: 'Coupling requirements', clause: '6.5.1' },
    { id: 'C5', category: 'Mekanikal', requirement: 'Baseplate and mounting', clause: '6.4.1' },

    // Performance
    { id: 'P1', category: 'Performa', requirement: 'Head-capacity tolerance ±5%', clause: '6.1.7' },
    { id: 'P2', category: 'Performa', requirement: 'Efficiency guarantee', clause: '6.1.8' },
    { id: 'P3', category: 'Performa', requirement: 'NPSHr tolerance +3%', clause: '6.1.9' },
    { id: 'P4', category: 'Performa', requirement: 'Minimum continuous stable flow', clause: '6.1.15' },
    { id: 'P5', category: 'Performa', requirement: 'Maximum continuous flow', clause: '6.1.16' },

    // Testing
    { id: 'T1', category: 'Testing', requirement: 'Hydrostatic test at 1.5x MAWP', clause: '8.3.1' },
    { id: 'T2', category: 'Testing', requirement: 'Performance test per HI 14.6', clause: '8.3.3' },
    { id: 'T3', category: 'Testing', requirement: 'NPSH test (if required)', clause: '8.3.4' },
    { id: 'T4', category: 'Testing', requirement: 'Mechanical running test', clause: '8.3.5' },
];

export default function Step7Compliance({ project, updateProject, goToStep, markStepComplete }: Step7Props) {
    const [items, setItems] = useState<ComplianceItem[]>(
        API610_REQUIREMENTS.map(req => ({
            ...req,
            isApplicable: true,
            isCompliant: null,
            notes: '',
        }))
    );

    const updateItem = (id: string, updates: Partial<ComplianceItem>) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    // Group by category
    const categories = Array.from(new Set(items.map(i => i.category)));

    // Calculate compliance status
    const applicableItems = items.filter(i => i.isApplicable);
    const compliantItems = applicableItems.filter(i => i.isCompliant === true);
    const nonCompliantItems = applicableItems.filter(i => i.isCompliant === false);
    const pendingItems = applicableItems.filter(i => i.isCompliant === null);

    const compliancePercentage = applicableItems.length > 0
        ? Math.round((compliantItems.length / applicableItems.length) * 100)
        : 0;

    const handleSave = () => {
        // Would save to project state
        markStepComplete(7);
    };

    const handleNext = () => {
        handleSave();
        goToStep(8);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Step 7: API 610 Compliance Matrix</h1>
            <p className="text-gray-600 mb-6">Verifikasi kepatuhan terhadap persyaratan API 610</p>

            {/* Compliance Summary */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Kepatuhan</h2>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-3xl font-bold text-gray-900">{applicableItems.length}</p>
                        <p className="text-sm text-gray-600">Total Applicable</p>
                    </div>
                    <div className="p-4 bg-re-green-light rounded-lg text-center">
                        <p className="text-3xl font-bold text-re-green">{compliantItems.length}</p>
                        <p className="text-sm text-gray-600">Compliant</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg text-center">
                        <p className="text-3xl font-bold text-red-600">{nonCompliantItems.length}</p>
                        <p className="text-sm text-gray-600">Non-Compliant</p>
                    </div>
                    <div className="p-4 bg-re-yellow-light rounded-lg text-center">
                        <p className="text-3xl font-bold text-re-yellow">{pendingItems.length}</p>
                        <p className="text-sm text-gray-600">Pending</p>
                    </div>
                    <div className="p-4 bg-re-blue-light rounded-lg text-center">
                        <p className="text-3xl font-bold text-re-blue">{compliancePercentage}%</p>
                        <p className="text-sm text-gray-600">Compliance Rate</p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-re-green transition-all duration-300"
                        style={{ width: `${compliancePercentage}%` }}
                    />
                </div>
            </div>

            {/* Compliance Matrix by Category */}
            {categories.map(category => (
                <div key={category} className="card mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">{category}</h2>

                    <div className="space-y-3">
                        {items.filter(i => i.category === category).map(item => (
                            <div
                                key={item.id}
                                className={`p-4 border rounded-lg ${!item.isApplicable ? 'bg-gray-50 opacity-60' :
                                    item.isCompliant === true ? 'border-re-green/30 bg-re-green-light/30' :
                                        item.isCompliant === false ? 'border-red-300 bg-red-50' :
                                            'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono bg-gray-200 px-2 py-0.5 rounded">
                                                {item.id}
                                            </span>
                                            <span className="text-xs text-gray-500">Clause {item.clause}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">{item.requirement}</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-1 text-xs">
                                            <input
                                                type="checkbox"
                                                checked={item.isApplicable}
                                                onChange={(e) => updateItem(item.id, { isApplicable: e.target.checked })}
                                            />
                                            Applicable
                                        </label>

                                        {item.isApplicable && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => updateItem(item.id, { isCompliant: true })}
                                                    className={`px-3 py-1 text-xs font-medium rounded ${item.isCompliant === true
                                                        ? 'bg-re-green text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-re-green-light'
                                                        }`}
                                                >
                                                    ✓ Comply
                                                </button>
                                                <button
                                                    onClick={() => updateItem(item.id, { isCompliant: false })}
                                                    className={`px-3 py-1 text-xs font-medium rounded ${item.isCompliant === false
                                                        ? 'bg-red-600 text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-red-100'
                                                        }`}
                                                >
                                                    ✗ Non-Comply
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {item.isApplicable && (
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            value={item.notes}
                                            onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                                            placeholder="Catatan..."
                                            className="input-field w-full text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Non-Compliance Summary */}
            {nonCompliantItems.length > 0 && (
                <div className="card bg-red-50 border-red-200 mb-6">
                    <h2 className="text-lg font-semibold text-red-700 mb-4">⚠️ Item Non-Compliant</h2>
                    <ul className="space-y-2">
                        {nonCompliantItems.map(item => (
                            <li key={item.id} className="text-sm text-red-700">
                                <span className="font-mono">{item.id}</span> — {item.requirement}
                                {item.notes && <span className="text-gray-600"> ({item.notes})</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                <Button variant="secondary" onClick={() => goToStep(6)}>
                    ← Kembali ke Step 6
                </Button>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSave}>
                        Simpan
                    </Button>
                    <Button variant="primary" onClick={handleNext}>
                        Lanjut: Seal System →
                    </Button>
                </div>
            </div>
        </div>
    );
}
