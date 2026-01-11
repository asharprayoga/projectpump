'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import { FormInput, FormSelect, FormCheckbox } from '@/components/ui/FormInputs';
import { Project, OperatingCase, FluidProperties, ServiceInput, RecommendationResult } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { recommendPumpStandard } from '@/lib/calculations/rulesEngine';
import { DEFAULT_COMPANY_CRITERIA } from '@/lib/companyCriteria';

interface Step1Props {
    project: Project;
    updateProject: (updates: Partial<Project>) => void;
    goToStep: (step: number) => void;
    markStepComplete: (step: number) => void;
}

export default function Step1Service({ project, updateProject, goToStep, markStepComplete }: Step1Props) {
    const [cases, setCases] = useState<OperatingCase[]>(project.cases);
    const [activeCase, setActiveCase] = useState<string>(project.cases[0]?.id || '');

    // Control requirements (for rules engine)
    const [requiresAccurateMetering, setRequiresAccurateMetering] = useState(false);
    const [requiresConstantFlow, setRequiresConstantFlow] = useState(false);
    const [downstreamPressureVariabilityHigh, setDownstreamPressureVariabilityHigh] = useState(false);
    const [pulsationAcceptable, setPulsationAcceptable] = useState(true);

    // Recommendation state
    const [recommendation, setRecommendation] = useState<RecommendationResult | null>(
        project.recommendationSnapshot || null
    );
    const [recState, setRecState] = useState<'not_generated' | 'generated' | 'accepted' | 'overridden'>(
        project.recommendationState === 'outdated' ? 'not_generated' : (project.recommendationState as 'not_generated' | 'generated' | 'accepted' | 'overridden')
    );
    const [overrideReason, setOverrideReason] = useState('');
    const [showOverrideModal, setShowOverrideModal] = useState(false);

    const units = project.units;
    const isAssistedMode = project.selectionMode === 'assisted';

    const updateCase = (caseId: string, updates: Partial<OperatingCase>) => {
        const updatedCases = cases.map(c =>
            c.id === caseId ? { ...c, ...updates } : c
        );
        setCases(updatedCases);
        // Mark recommendation as outdated if input changes
        if (recState === 'generated') {
            setRecState('not_generated');
        }
    };

    const updateFluid = (caseId: string, updates: Partial<FluidProperties>) => {
        const targetCase = cases.find(c => c.id === caseId);
        if (!targetCase) return;

        updateCase(caseId, {
            fluid: { ...targetCase.fluid, ...updates }
        });
    };

    const addCase = () => {
        const baseCase = cases[0];
        const newCase: OperatingCase = {
            ...baseCase,
            id: uuidv4(),
            name: `Custom ${cases.length - 2}`,
            isDefault: false,
        };
        setCases([...cases, newCase]);
        setActiveCase(newCase.id);
    };

    const removeCase = (caseId: string) => {
        const targetCase = cases.find(c => c.id === caseId);
        if (targetCase?.isDefault) return;

        const updatedCases = cases.filter(c => c.id !== caseId);
        setCases(updatedCases);
        if (activeCase === caseId) {
            setActiveCase(updatedCases[0]?.id || '');
        }
    };

    // Get normal case for recommendation
    const normalCase = cases.find(c => c.name === 'Normal') || cases[0];

    // Build service input for rules engine
    const buildServiceInput = (): ServiceInput => {
        return {
            requiresAccurateMetering,
            normalFlow: normalCase?.requiredFlow || 0,
            differentialPressure: normalCase?.discharge.requiredPressure || 0,
            viscosity: normalCase?.fluid.viscosity || 1,
            shearSensitive: normalCase?.fluid.shearSensitive || false,
            solidsPresent: (normalCase?.fluid.solidsPct || 0) > 0,
            solidsPct: normalCase?.fluid.solidsPct,
            requiresConstantFlow,
            downstreamPressureVariabilityHigh,
            pulsationAcceptable,
            operationMode: 'continuous',
        };
    };

    // Generate recommendation
    const handleGenerateRecommendation = () => {
        const serviceInput = buildServiceInput();
        const result = recommendPumpStandard(serviceInput, DEFAULT_COMPANY_CRITERIA);
        setRecommendation(result);
        setRecState('generated');
    };

    // Accept recommendation
    const handleAcceptRecommendation = () => {
        if (!recommendation) return;

        updateProject({
            cases,
            selectedStandard: recommendation.recommendedStandard,
            selectionSource: 'assisted',
            recommendationState: 'accepted',
            recommendationSnapshot: recommendation,
            pumpStandard: recommendation.recommendedStandard, // Legacy field
            serviceInput: buildServiceInput(),
        });
        setRecState('accepted');
        markStepComplete(1);
    };

    // Override recommendation
    const handleOverride = (standard: string) => {
        if (!overrideReason.trim()) return;

        updateProject({
            cases,
            selectedStandard: standard as Project['selectedStandard'],
            selectionSource: 'override',
            recommendationState: 'overridden',
            recommendationSnapshot: recommendation || undefined,
            overrideReason,
            previousRecommendation: recommendation || undefined,
            pumpStandard: standard as Project['pumpStandard'], // Legacy field
            serviceInput: buildServiceInput(),
        });
        setRecState('overridden');
        setShowOverrideModal(false);
        markStepComplete(1);
    };

    const handleSave = () => {
        updateProject({ cases, serviceInput: buildServiceInput() });
        markStepComplete(1);
    };

    const handleNext = () => {
        handleSave();
        goToStep(2);
    };

    const activeCaseData = cases.find(c => c.id === activeCase);

    // Get status badge for recommendation state
    const getRecStateLabel = () => {
        switch (recState) {
            case 'not_generated': return null;
            case 'generated': return <span className="px-2 py-1 bg-re-yellow-light text-re-yellow text-xs rounded">Menunggu Keputusan</span>;
            case 'accepted': return <span className="px-2 py-1 bg-re-green-light text-re-green text-xs rounded">Diterima</span>;
            case 'overridden': return <span className="px-2 py-1 bg-re-orange-light text-re-orange text-xs rounded">Override</span>;
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Data Servis / Proses</h1>
            <p className="text-gray-600 mb-4">Tentukan properti fluida, kebutuhan aliran, dan kebutuhan kontrol</p>

            {/* Helper Notes */}
            <div className="p-4 bg-re-blue-light rounded-lg text-sm text-gray-700 mb-6 border border-re-blue/20">
                <p className="font-medium text-re-blue mb-2">📝 Panduan Input Data Servis:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li><strong>Density:</strong> Air = 1000 kg/m³, Light Oil ≈ 850 kg/m³</li>
                    <li><strong>Specific Gravity:</strong> Density fluida dibagi density air (Air = 1.0)</li>
                    <li><strong>Viscosity:</strong> Air ≈ 1 cP, Light Oil ≈ 5-50 cP, Heavy Oil &gt; 100 cP</li>
                    <li><strong>Vapor Pressure:</strong> Penting untuk kalkulasi NPSH, dapat dilihat di steam table</li>
                </ul>
            </div>

            {/* Case Tabs */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
                {cases.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => setActiveCase(c.id)}
                        className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeCase === c.id
                                ? 'bg-re-blue text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
                    >
                        {c.name}
                        {!c.isDefault && (
                            <span
                                onClick={(e) => { e.stopPropagation(); removeCase(c.id); }}
                                className="ml-2 text-xs opacity-70 hover:opacity-100"
                            >
                                ✕
                            </span>
                        )}
                    </button>
                ))}
                <button
                    onClick={addCase}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                    + Tambah Kasus
                </button>
            </div>

            {activeCaseData && (
                <div className="space-y-6">
                    {/* Fluid Properties */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Properti Fluida</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormInput
                                label="Nama Fluida"
                                value={activeCaseData.fluid.fluidName}
                                onChange={(e) => updateFluid(activeCase, { fluidName: e.target.value })}
                                placeholder="cth: Air, Light Oil"
                            />

                            <FormInput
                                label="Temperatur Operasi"
                                type="number"
                                value={activeCaseData.fluid.temperature}
                                onChange={(e) => updateFluid(activeCase, { temperature: parseFloat(e.target.value) || 0 })}
                                unit={units === 'SI' ? '°C' : '°F'}
                            />

                            <FormInput
                                label="Density"
                                type="number"
                                value={activeCaseData.fluid.density}
                                onChange={(e) => updateFluid(activeCase, { density: parseFloat(e.target.value) || 0 })}
                                unit={units === 'SI' ? 'kg/m³' : 'lb/ft³'}
                            />

                            <FormInput
                                label="Specific Gravity"
                                type="number"
                                step="0.001"
                                value={activeCaseData.fluid.specificGravity}
                                onChange={(e) => updateFluid(activeCase, { specificGravity: parseFloat(e.target.value) || 0 })}
                            />

                            <FormInput
                                label="Viscosity"
                                type="number"
                                step="0.1"
                                value={activeCaseData.fluid.viscosity}
                                onChange={(e) => updateFluid(activeCase, { viscosity: parseFloat(e.target.value) || 0 })}
                                unit="cP"
                            />

                            <FormInput
                                label="Vapor Pressure"
                                type="number"
                                step="0.1"
                                value={activeCaseData.fluid.vaporPressure}
                                onChange={(e) => updateFluid(activeCase, { vaporPressure: parseFloat(e.target.value) || 0 })}
                                unit={units === 'SI' ? 'kPa(a)' : 'psia'}
                            />

                            <FormInput
                                label="Kandungan Solid"
                                type="number"
                                step="0.1"
                                value={activeCaseData.fluid.solidsPct || 0}
                                onChange={(e) => updateFluid(activeCase, { solidsPct: parseFloat(e.target.value) || 0 })}
                                unit="%"
                            />
                        </div>

                        {/* Fluid Flags */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-700 mb-2">Karakteristik Fluida</p>
                            <div className="flex flex-wrap gap-4">
                                <FormCheckbox
                                    label="Korosif"
                                    checked={activeCaseData.fluid.isCorrosive}
                                    onChange={(e) => updateFluid(activeCase, { isCorrosive: e.target.checked })}
                                />
                                <FormCheckbox
                                    label="Toxic"
                                    checked={activeCaseData.fluid.isToxic}
                                    onChange={(e) => updateFluid(activeCase, { isToxic: e.target.checked })}
                                />
                                <FormCheckbox
                                    label="Flammable"
                                    checked={activeCaseData.fluid.isFlammable}
                                    onChange={(e) => updateFluid(activeCase, { isFlammable: e.target.checked })}
                                />
                                <FormCheckbox
                                    label="Shear Sensitive"
                                    checked={activeCaseData.fluid.shearSensitive || false}
                                    onChange={(e) => updateFluid(activeCase, { shearSensitive: e.target.checked })}
                                />
                            </div>
                        </div>

                        {/* Warnings */}
                        {activeCaseData.fluid.viscosity > 100 && (
                            <div className="mt-4 p-3 bg-re-yellow-light rounded-lg text-sm text-re-yellow border border-re-yellow/20">
                                ⚠️ Viscosity tinggi terdeteksi ({activeCaseData.fluid.viscosity} cP). Sistem akan mempertimbangkan rotary PD pump.
                            </div>
                        )}
                    </div>

                    {/* Flow Requirements */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kebutuhan Aliran</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Flow yang Dibutuhkan"
                                type="number"
                                value={activeCaseData.requiredFlow}
                                onChange={(e) => updateCase(activeCase, { requiredFlow: parseFloat(e.target.value) || 0 })}
                                unit={units === 'SI' ? 'm³/h' : 'GPM'}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Control / Functional Requirements */}
            <div className="card mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Kebutuhan Kontrol / Fungsional</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Informasi ini digunakan untuk merekomendasikan tipe pompa yang sesuai.
                </p>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <FormCheckbox
                            label="Memerlukan metering/dosing akurat"
                            checked={requiresAccurateMetering}
                            onChange={(e) => {
                                setRequiresAccurateMetering(e.target.checked);
                                if (recState === 'generated') setRecState('not_generated');
                            }}
                        />
                    </div>
                    {requiresAccurateMetering && (
                        <div className="ml-6 p-3 bg-re-blue-light rounded-lg text-sm text-re-blue border border-re-blue/20">
                            ℹ️ Kebutuhan metering akan meningkatkan prioritas API 675 (Metering Pump).
                        </div>
                    )}

                    <FormCheckbox
                        label="Memerlukan flow konstan terlepas dari variasi tekanan"
                        checked={requiresConstantFlow}
                        onChange={(e) => {
                            setRequiresConstantFlow(e.target.checked);
                            if (recState === 'generated') setRecState('not_generated');
                        }}
                    />

                    <FormCheckbox
                        label="Variabilitas tekanan downstream tinggi"
                        checked={downstreamPressureVariabilityHigh}
                        onChange={(e) => {
                            setDownstreamPressureVariabilityHigh(e.target.checked);
                            if (recState === 'generated') setRecState('not_generated');
                        }}
                    />

                    <FormCheckbox
                        label="Pulsation dapat diterima"
                        checked={pulsationAcceptable}
                        onChange={(e) => {
                            setPulsationAcceptable(e.target.checked);
                            if (recState === 'generated') setRecState('not_generated');
                        }}
                    />
                </div>
            </div>

            {/* Recommendation Panel (Assisted Mode Only) */}
            {isAssistedMode && (
                <div className="card mt-6 border-re-blue/30">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Rekomendasi Standar Pompa</h2>
                        {getRecStateLabel()}
                    </div>

                    {recState === 'not_generated' && (
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-4">
                                Klik tombol di bawah untuk menghasilkan rekomendasi berdasarkan input servis.
                            </p>
                            <Button variant="primary" onClick={handleGenerateRecommendation}>
                                Generate Rekomendasi
                            </Button>
                        </div>
                    )}

                    {recommendation && recState !== 'not_generated' && (
                        <div className="space-y-4">
                            {/* Recommendation Result */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Tipe Pompa</p>
                                    <p className="text-lg font-bold text-gray-900 capitalize">
                                        {recommendation.recommendedPumpType.replace(/_/g, ' ')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Standar API</p>
                                    <p className="text-lg font-bold text-re-blue">
                                        {recommendation.recommendedStandard.replace('API', 'API ')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Confidence</p>
                                    <p className={`text-lg font-bold capitalize ${recommendation.confidence === 'high' ? 'text-re-green' :
                                        recommendation.confidence === 'medium' ? 'text-re-yellow' : 'text-re-orange'
                                        }`}>
                                        {recommendation.confidence === 'high' ? 'Tinggi' :
                                            recommendation.confidence === 'medium' ? 'Sedang' : 'Rendah'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Skor</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {recommendation.scores[recommendation.recommendedStandard]}
                                    </p>
                                </div>
                            </div>

                            {/* Reasons */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Alasan:</p>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    {recommendation.reasons.map((reason, idx) => (
                                        <li key={idx}>{reason}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Warnings */}
                            {recommendation.warnings.length > 0 && (
                                <div className="p-3 bg-re-yellow-light rounded-lg text-sm text-re-yellow border border-re-yellow/20">
                                    <strong>Peringatan:</strong>
                                    <ul className="list-disc list-inside mt-1">
                                        {recommendation.warnings.map((warning, idx) => (
                                            <li key={idx}>{warning}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Alternatives */}
                            {recommendation.alternatives.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Alternatif:</p>
                                    <div className="space-y-2">
                                        {recommendation.alternatives.map((alt, idx) => (
                                            <div key={idx} className="p-3 bg-gray-50 rounded-lg text-sm">
                                                <span className="font-medium">{alt.standard.replace('API', 'API ')}</span>
                                                <span className="text-gray-500 ml-2">(skor: {alt.score})</span>
                                                <p className="text-gray-600 mt-1">{alt.note}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Score Breakdown */}
                            <details className="text-sm">
                                <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                                    Lihat breakdown skor
                                </summary>
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg grid grid-cols-4 gap-2 text-center">
                                    {Object.entries(recommendation.scores).map(([std, score]) => (
                                        <div key={std}>
                                            <p className="text-xs text-gray-500">{std.replace('API', 'API ')}</p>
                                            <p className={`font-bold ${std === recommendation.recommendedStandard ? 'text-re-blue' : 'text-gray-700'}`}>
                                                {score}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </details>

                            {/* Actions */}
                            {recState === 'generated' && (
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <Button variant="primary" onClick={handleAcceptRecommendation}>
                                        ✓ Terima Rekomendasi
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowOverrideModal(true)}>
                                        Override (Manual)
                                    </Button>
                                </div>
                            )}

                            {recState === 'accepted' && (
                                <div className="p-3 bg-re-green-light rounded-lg text-sm text-re-green">
                                    ✓ Rekomendasi diterima: {recommendation.recommendedStandard.replace('API', 'API ')}
                                </div>
                            )}

                            {recState === 'overridden' && (
                                <div className="p-3 bg-re-orange-light rounded-lg text-sm text-re-orange">
                                    ⚡ Override: {project.selectedStandard !== 'UNSET' ? (project.selectedStandard as string).replace('API', 'API ') : 'N/A'}
                                    {project.overrideReason && <p className="mt-1 text-gray-600">Alasan: {project.overrideReason}</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Override Modal */}
            {showOverrideModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Override Rekomendasi</h3>

                        <p className="text-sm text-gray-600 mb-4">
                            Pilih standar pompa secara manual. Alasan override wajib diisi untuk traceability.
                        </p>

                        <div className="space-y-3 mb-4">
                            {['API610', 'API674', 'API675', 'API676'].map((std) => (
                                <label key={std} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="overrideStandard"
                                        value={std}
                                        defaultChecked={std === recommendation?.recommendedStandard}
                                    />
                                    <span>{std.replace('API', 'API ')}</span>
                                </label>
                            ))}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Alasan Override *
                            </label>
                            <textarea
                                value={overrideReason}
                                onChange={(e) => setOverrideReason(e.target.value)}
                                placeholder="Jelaskan alasan override..."
                                className="input-field w-full h-20 resize-none"
                                required
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="primary"
                                onClick={() => {
                                    const selected = document.querySelector<HTMLInputElement>('input[name="overrideStandard"]:checked');
                                    if (selected) handleOverride(selected.value);
                                }}
                                disabled={!overrideReason.trim()}
                            >
                                Konfirmasi Override
                            </Button>
                            <Button variant="secondary" onClick={() => setShowOverrideModal(false)}>
                                Batal
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Case Summary Table */}
            <div className="card mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Kasus Operasi</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Kasus</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">Flow ({units === 'SI' ? 'm³/h' : 'GPM'})</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">Temp ({units === 'SI' ? '°C' : '°F'})</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">SG</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">Viscosity (cP)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cases.map((c) => (
                                <tr key={c.id} className="border-b border-gray-100">
                                    <td className="py-2 px-3">{c.name}</td>
                                    <td className="py-2 px-3 text-right">{c.requiredFlow}</td>
                                    <td className="py-2 px-3 text-right">{c.fluid.temperature}</td>
                                    <td className="py-2 px-3 text-right">{c.fluid.specificGravity}</td>
                                    <td className="py-2 px-3 text-right">{c.fluid.viscosity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                <Button variant="secondary" onClick={() => goToStep(0)}>
                    ← Kembali ke Step 0
                </Button>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSave}>
                        Simpan
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleNext}
                        disabled={isAssistedMode && recState === 'not_generated'}
                    >
                        Lanjut: System Hydraulics →
                    </Button>
                </div>
            </div>

            {/* Info if assisted mode and not yet accepted */}
            {isAssistedMode && recState === 'not_generated' && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                    Generate dan terima rekomendasi untuk melanjutkan ke step berikutnya.
                </p>
            )}
        </div>
    );
}
