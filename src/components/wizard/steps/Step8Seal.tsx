'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { FormSelect, FormInput, FormRadioGroup, FormCheckbox } from '@/components/ui/FormInputs';
import { Project } from '@/types';

interface Step8Props {
    project: Project;
    updateProject: (updates: Partial<Project>) => void;
    goToStep: (step: number) => void;
    markStepComplete: (step: number) => void;
}

// API 682 Seal Arrangements
const SEAL_ARRANGEMENTS = [
    { value: 'Arrangement1', label: 'Arrangement 1', description: 'Single seal, unpressurized buffer fluid (optional)' },
    { value: 'Arrangement2', label: 'Arrangement 2', description: 'Dual seal, unpressurized buffer fluid' },
    { value: 'Arrangement3', label: 'Arrangement 3', description: 'Dual seal, pressurized barrier fluid' },
];

// Common Seal Plans
const SEAL_PLANS = [
    // Plan 01-03: Inboard seal support
    { value: 'Plan01', label: 'Plan 01', description: 'Internal recirculation from pump discharge', category: 'Inboard' },
    { value: 'Plan02', label: 'Plan 02', description: 'Dead-ended seal chamber', category: 'Inboard' },
    { value: 'Plan11', label: 'Plan 11', description: 'Recirculation from discharge through orifice', category: 'Inboard' },
    { value: 'Plan13', label: 'Plan 13', description: 'Recirculation from seal chamber through orifice and back to suction', category: 'Inboard' },
    { value: 'Plan21', label: 'Plan 21', description: 'Recirculation from discharge through orifice and cooler', category: 'Inboard' },
    { value: 'Plan23', label: 'Plan 23', description: 'Recirculation from seal chamber through cooler to seal and back to suction', category: 'Inboard' },
    { value: 'Plan31', label: 'Plan 31', description: 'Recirculation from discharge through cyclone separator', category: 'Inboard' },
    { value: 'Plan32', label: 'Plan 32', description: 'External flush (injection) from clean source', category: 'Inboard' },

    // Plan 52-54: Dual seal, unpressurized buffer
    { value: 'Plan52', label: 'Plan 52', description: 'Unpressurized external reservoir, thermosiphon', category: 'Arrangement 2' },
    { value: 'Plan53A', label: 'Plan 53A', description: 'Pressurized external reservoir with bladder accumulator', category: 'Arrangement 3' },
    { value: 'Plan53B', label: 'Plan 53B', description: 'Pressurized external reservoir with piston accumulator', category: 'Arrangement 3' },
    { value: 'Plan53C', label: 'Plan 53C', description: 'Pressurized external reservoir with pump circulation', category: 'Arrangement 3' },
    { value: 'Plan54', label: 'Plan 54', description: 'External seal support system (closed loop)', category: 'Arrangement 3' },
];

export default function Step8Seal({ project, updateProject, goToStep, markStepComplete }: Step8Props) {
    const normalCase = project.cases.find(c => c.name === 'Normal') || project.cases[0];

    // Seal selection state
    const [sealData, setSealData] = useState({
        arrangement: 'Arrangement1',
        primaryPlan: 'Plan11',
        secondaryPlan: '',
        sealType: 'balanced',
        sealMaterial: 'carbon_sic',
        flushSource: 'process',
        requiresQuench: false,
        quenchFluid: '',
        requiresHeating: false,
        heatingMethod: '',
        notes: '',
    });

    // Fluid hazard evaluation
    const hazards = {
        isFlammable: normalCase?.fluid.isFlammable || false,
        isToxic: normalCase?.fluid.isToxic || false,
        isCorrosive: normalCase?.fluid.isCorrosive || false,
    };

    const hasHazard = hazards.isFlammable || hazards.isToxic || hazards.isCorrosive;

    // Recommendation based on hazards
    const getRecommendedArrangement = () => {
        if (hazards.isToxic) return 'Arrangement3';
        if (hazards.isFlammable) return 'Arrangement2';
        return 'Arrangement1';
    };

    const handleSave = () => {
        markStepComplete(8);
    };

    const handleNext = () => {
        handleSave();
        goToStep(9);
    };

    const filteredPlans = sealData.arrangement === 'Arrangement1'
        ? SEAL_PLANS.filter(p => p.category === 'Inboard')
        : sealData.arrangement === 'Arrangement2'
            ? [...SEAL_PLANS.filter(p => p.category === 'Inboard'), ...SEAL_PLANS.filter(p => p.category === 'Arrangement 2')]
            : SEAL_PLANS;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Step 8: Seal System — API 682</h1>
            <p className="text-gray-600 mb-6">Pilih konfigurasi mechanical seal sesuai API 682</p>

            {/* Service Hazard Summary */}
            <div className={`card mb-6 ${hasHazard ? 'bg-re-yellow-light border-re-yellow/30' : 'bg-gray-50'}`}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Evaluasi Hazard Servis</h2>

                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${hazards.isFlammable ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                        <p className="font-medium">🔥 Flammable</p>
                        <p className="text-sm">{hazards.isFlammable ? 'Ya' : 'Tidak'}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${hazards.isToxic ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                        <p className="font-medium">☠️ Toxic</p>
                        <p className="text-sm">{hazards.isToxic ? 'Ya' : 'Tidak'}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${hazards.isCorrosive ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                        <p className="font-medium">⚗️ Corrosive</p>
                        <p className="text-sm">{hazards.isCorrosive ? 'Ya' : 'Tidak'}</p>
                    </div>
                </div>

                {hasHazard && (
                    <div className="p-3 bg-white rounded-lg text-sm">
                        <strong>Rekomendasi:</strong> Berdasarkan karakteristik fluida, direkomendasikan menggunakan{' '}
                        <span className="font-semibold text-re-blue">{getRecommendedArrangement()}</span>
                    </div>
                )}
            </div>

            {/* Seal Arrangement Selection */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Seal Arrangement</h2>

                <div className="space-y-3">
                    {SEAL_ARRANGEMENTS.map(arr => (
                        <label
                            key={arr.value}
                            className={`
                flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors
                ${sealData.arrangement === arr.value
                                    ? 'border-re-blue bg-re-blue-light'
                                    : 'border-gray-200 hover:bg-gray-50'}
              `}
                        >
                            <input
                                type="radio"
                                name="arrangement"
                                value={arr.value}
                                checked={sealData.arrangement === arr.value}
                                onChange={() => setSealData(prev => ({ ...prev, arrangement: arr.value }))}
                                className="mt-1"
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900">{arr.label}</p>
                                    {arr.value === getRecommendedArrangement() && hasHazard && (
                                        <span className="px-2 py-0.5 bg-re-green text-white text-xs rounded">Recommended</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">{arr.description}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Seal Plan Selection */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Seal Plan</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                        label="Primary Seal Plan"
                        value={sealData.primaryPlan}
                        onChange={(e) => setSealData(prev => ({ ...prev, primaryPlan: e.target.value }))}
                        options={filteredPlans.map(p => ({
                            value: p.value,
                            label: `${p.label} — ${p.description.substring(0, 40)}...`
                        }))}
                    />

                    {sealData.arrangement !== 'Arrangement1' && (
                        <FormSelect
                            label="Secondary/Barrier Seal Plan"
                            value={sealData.secondaryPlan}
                            onChange={(e) => setSealData(prev => ({ ...prev, secondaryPlan: e.target.value }))}
                            options={[
                                { value: '', label: 'Pilih plan...' },
                                ...SEAL_PLANS.filter(p => p.category.includes('Arrangement')).map(p => ({
                                    value: p.value,
                                    label: `${p.label} — ${p.description.substring(0, 40)}...`
                                }))
                            ]}
                        />
                    )}
                </div>

                {/* Selected Plan Details */}
                {sealData.primaryPlan && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">
                            {SEAL_PLANS.find(p => p.value === sealData.primaryPlan)?.label}
                        </p>
                        <p className="text-sm text-gray-600">
                            {SEAL_PLANS.find(p => p.value === sealData.primaryPlan)?.description}
                        </p>
                    </div>
                )}
            </div>

            {/* Seal Configuration */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Konfigurasi Seal</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                        label="Tipe Seal"
                        value={sealData.sealType}
                        onChange={(e) => setSealData(prev => ({ ...prev, sealType: e.target.value }))}
                        options={[
                            { value: 'balanced', label: 'Balanced' },
                            { value: 'unbalanced', label: 'Unbalanced' },
                        ]}
                    />

                    <FormSelect
                        label="Material Face"
                        value={sealData.sealMaterial}
                        onChange={(e) => setSealData(prev => ({ ...prev, sealMaterial: e.target.value }))}
                        options={[
                            { value: 'carbon_sic', label: 'Carbon vs Silicon Carbide' },
                            { value: 'sic_sic', label: 'SiC vs SiC' },
                            { value: 'carbon_tc', label: 'Carbon vs Tungsten Carbide' },
                            { value: 'tc_tc', label: 'TC vs TC' },
                        ]}
                    />
                </div>

                <div className="mt-4 space-y-3">
                    <FormCheckbox
                        label="Memerlukan Quench"
                        checked={sealData.requiresQuench}
                        onChange={(e) => setSealData(prev => ({ ...prev, requiresQuench: e.target.checked }))}
                    />

                    {sealData.requiresQuench && (
                        <FormInput
                            label="Quench Fluid"
                            value={sealData.quenchFluid}
                            onChange={(e) => setSealData(prev => ({ ...prev, quenchFluid: e.target.value }))}
                            placeholder="cth: Steam, Nitrogen"
                        />
                    )}

                    <FormCheckbox
                        label="Memerlukan Heating/Tracing"
                        checked={sealData.requiresHeating}
                        onChange={(e) => setSealData(prev => ({ ...prev, requiresHeating: e.target.checked }))}
                    />
                </div>
            </div>

            {/* Notes */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Catatan</h2>
                <textarea
                    value={sealData.notes}
                    onChange={(e) => setSealData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Catatan tambahan untuk seal selection..."
                    className="input-field w-full h-24 resize-none"
                />
            </div>

            {/* Summary */}
            <div className="card bg-re-blue-light border-re-blue/20 mb-6">
                <h2 className="text-lg font-semibold text-re-blue mb-4">Ringkasan Seal Selection</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Arrangement</p>
                        <p className="font-semibold text-gray-900">{sealData.arrangement}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Primary Plan</p>
                        <p className="font-semibold text-gray-900">{sealData.primaryPlan}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Seal Type</p>
                        <p className="font-semibold text-gray-900 capitalize">{sealData.sealType}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Face Material</p>
                        <p className="font-semibold text-gray-900">{sealData.sealMaterial.replace(/_/g, ' / ').toUpperCase()}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                <Button variant="secondary" onClick={() => goToStep(7)}>
                    ← Kembali ke Step 7
                </Button>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSave}>
                        Simpan
                    </Button>
                    <Button variant="primary" onClick={handleNext}>
                        Lanjut: Auxiliaries →
                    </Button>
                </div>
            </div>
        </div>
    );
}
