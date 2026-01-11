'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import { FormInput, FormSelect } from '@/components/ui/FormInputs';
import { Project, OperatingCase, SuctionConditions, DischargeConditions } from '@/types';
import { calculateTDH, findGoverningTDHCase } from '@/lib/calculations/tdh';

interface Step2Props {
    project: Project;
    updateProject: (updates: Partial<Project>) => void;
    goToStep: (step: number) => void;
    markStepComplete: (step: number) => void;
}

export default function Step2Hydraulics({ project, updateProject, goToStep, markStepComplete }: Step2Props) {
    const [cases, setCases] = useState<OperatingCase[]>(project.cases);
    const [activeCase, setActiveCase] = useState<string>(project.cases[0]?.id || '');

    const units = project.units;

    const updateCase = (caseId: string, updates: Partial<OperatingCase>) => {
        const updatedCases = cases.map(c =>
            c.id === caseId ? { ...c, ...updates } : c
        );
        setCases(updatedCases);
    };

    const updateSuction = (caseId: string, updates: Partial<SuctionConditions>) => {
        const targetCase = cases.find(c => c.id === caseId);
        if (!targetCase) return;

        updateCase(caseId, {
            suction: { ...targetCase.suction, ...updates }
        });
    };

    const updateDischarge = (caseId: string, updates: Partial<DischargeConditions>) => {
        const targetCase = cases.find(c => c.id === caseId);
        if (!targetCase) return;

        updateCase(caseId, {
            discharge: { ...targetCase.discharge, ...updates }
        });
    };

    // Calculate TDH for all cases
    const tdhResults = useMemo(() => {
        return cases.map(c => ({
            caseId: c.id,
            caseName: c.name,
            tdh: calculateTDH(c, units).value,
            result: calculateTDH(c, units),
        }));
    }, [cases, units]);

    const governingCase = useMemo(() => {
        return findGoverningTDHCase(tdhResults.map(r => ({ caseId: r.caseId, caseName: r.caseName, tdh: r.tdh })));
    }, [tdhResults]);

    const activeCaseData = cases.find(c => c.id === activeCase);
    const activeTDH = tdhResults.find(r => r.caseId === activeCase);

    const handleSave = () => {
        updateProject({ cases });
        markStepComplete(2);
    };

    const handleNext = () => {
        handleSave();
        goToStep(3);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Step 2: System Hydraulics</h1>
            <p className="text-gray-600 mb-4">Tentukan kondisi suction dan discharge untuk menghitung Total Dynamic Head (TDH)</p>

            {/* Helper Notes */}
            <div className="p-4 bg-re-blue-light rounded-lg text-sm text-gray-700 mb-6 border border-re-blue/20">
                <p className="font-medium text-re-blue mb-2">📝 Panduan Input:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li><strong>Tekanan Vessel:</strong> Masukkan tekanan gauge (untuk tank atmosferik = 0)</li>
                    <li><strong>Level Cairan:</strong> Positif jika di atas centerline pompa, negatif jika di bawah</li>
                    <li><strong>Rugi-rugi Pipa:</strong> Bisa diestimasi 5-10% dari total head jika belum ada data detail</li>
                    <li><strong>Control Valve ΔP:</strong> Minimum 70 kPa (10 psi) untuk kontrol yang baik</li>
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
                    </button>
                ))}
            </div>

            {activeCaseData && (
                <div className="space-y-6">
                    {/* Suction Conditions */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kondisi Suction</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormSelect
                                label="Tipe Sumber Suction"
                                value={activeCaseData.suction.sourceType}
                                onChange={(e) => updateSuction(activeCase, { sourceType: e.target.value as 'Vessel' | 'Tank' | 'Sump' | 'Other' })}
                                options={[
                                    { value: 'Vessel', label: 'Vessel' },
                                    { value: 'Tank', label: 'Tank (atmosferik)' },
                                    { value: 'Sump', label: 'Sump' },
                                    { value: 'Other', label: 'Lainnya' },
                                ]}
                            />

                            <FormInput
                                label="Tekanan Vessel/Sumber (gauge)"
                                type="number"
                                value={activeCaseData.suction.vesselPressure}
                                onChange={(e) => updateSuction(activeCase, { vesselPressure: parseFloat(e.target.value) || 0 })}
                                unit={units === 'SI' ? 'kPa(g)' : 'psig'}
                            />

                            <FormInput
                                label="Level Cairan (di atas CL pompa)"
                                type="number"
                                value={activeCaseData.suction.liquidLevel}
                                onChange={(e) => updateSuction(activeCase, { liquidLevel: parseFloat(e.target.value) || 0 })}
                                unit={units === 'SI' ? 'm' : 'ft'}
                            />

                            <FormSelect
                                label="Metode Rugi-rugi Pipa"
                                value={activeCaseData.suction.lineLossMethod}
                                onChange={(e) => updateSuction(activeCase, { lineLossMethod: e.target.value as 'Direct' | 'Calculated' })}
                                options={[
                                    { value: 'Direct', label: 'Input ΔP langsung' },
                                    { value: 'Calculated', label: 'Hitung dari data pipa' },
                                ]}
                            />

                            <FormInput
                                label="Rugi-rugi Pipa Suction"
                                type="number"
                                value={activeCaseData.suction.lineLosses}
                                onChange={(e) => updateSuction(activeCase, { lineLosses: parseFloat(e.target.value) || 0 })}
                                unit={units === 'SI' ? 'kPa' : 'psi'}
                            />
                        </div>
                    </div>

                    {/* Discharge Conditions */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kondisi Discharge</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormSelect
                                label="Tujuan Discharge"
                                value={activeCaseData.discharge.destinationType}
                                onChange={(e) => updateDischarge(activeCase, { destinationType: e.target.value as 'Vessel' | 'Header' | 'Elevation' | 'Other' })}
                                options={[
                                    { value: 'Vessel', label: 'Vessel' },
                                    { value: 'Header', label: 'Header/manifold' },
                                    { value: 'Elevation', label: 'Titik elevasi' },
                                    { value: 'Other', label: 'Lainnya' },
                                ]}
                            />

                            <FormInput
                                label="Tekanan yang Dibutuhkan di Tujuan"
                                type="number"
                                value={activeCaseData.discharge.requiredPressure}
                                onChange={(e) => updateDischarge(activeCase, { requiredPressure: parseFloat(e.target.value) || 0 })}
                                unit={units === 'SI' ? 'kPa(g)' : 'psig'}
                            />

                            <FormInput
                                label="Elevasi Discharge"
                                type="number"
                                value={activeCaseData.discharge.elevation}
                                onChange={(e) => updateDischarge(activeCase, { elevation: parseFloat(e.target.value) || 0 })}
                                unit={units === 'SI' ? 'm' : 'ft'}
                            />

                            <FormInput
                                label="Rugi-rugi Pipa Discharge"
                                type="number"
                                value={activeCaseData.discharge.lineLosses}
                                onChange={(e) => updateDischarge(activeCase, { lineLosses: parseFloat(e.target.value) || 0 })}
                                unit={units === 'SI' ? 'kPa' : 'psi'}
                            />

                            <FormInput
                                label="ΔP Control Valve (opsional)"
                                type="number"
                                value={activeCaseData.discharge.controlValveDP || 0}
                                onChange={(e) => updateDischarge(activeCase, { controlValveDP: parseFloat(e.target.value) || 0 })}
                                unit={units === 'SI' ? 'kPa' : 'psi'}
                            />
                        </div>
                    </div>

                    {/* Allowances */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Allowance</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Fouling Allowance"
                                type="number"
                                value={activeCaseData.foulingAllowance}
                                onChange={(e) => updateCase(activeCase, { foulingAllowance: parseFloat(e.target.value) || 0 })}
                                unit="%"
                            />

                            <FormInput
                                label="Uncertainty Allowance"
                                type="number"
                                value={activeCaseData.uncertaintyAllowance}
                                onChange={(e) => updateCase(activeCase, { uncertaintyAllowance: parseFloat(e.target.value) || 0 })}
                                unit="%"
                            />
                        </div>
                    </div>

                    {/* TDH Result for Active Case */}
                    {activeTDH && (
                        <div className="card bg-re-blue-light border-re-blue/20">
                            <h2 className="text-lg font-semibold text-re-blue mb-4">Hasil Kalkulasi TDH — {activeCaseData.name}</h2>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-600">Static Head</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {activeTDH.result.breakdown.staticHead.toFixed(2)} {activeTDH.result.unit}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Friction Losses</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {activeTDH.result.breakdown.frictionLosses.toFixed(2)} {activeTDH.result.unit}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">CV ΔP</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {activeTDH.result.breakdown.controlValveDP.toFixed(2)} {activeTDH.result.unit}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Allowances</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {activeTDH.result.breakdown.allowances.toFixed(2)} {activeTDH.result.unit}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-re-blue/20">
                                <p className="text-sm text-gray-600">Total Dynamic Head (TDH)</p>
                                <p className="text-3xl font-bold text-re-blue">
                                    {activeTDH.result.value.toFixed(2)} {activeTDH.result.unit}
                                </p>
                            </div>

                            <div className="mt-4 text-sm text-gray-600">
                                <p className="font-medium mb-1">Basis:</p>
                                <p>{activeTDH.result.basis}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TDH Summary Table */}
            <div className="card mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan TDH — Semua Kasus</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Kasus</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">Flow</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">TDH</th>
                                <th className="text-center py-2 px-3 font-medium text-gray-700">Governing</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tdhResults.map((r) => (
                                <tr key={r.caseId} className={`border-b border-gray-100 ${governingCase?.caseId === r.caseId ? 'bg-re-yellow-light' : ''}`}>
                                    <td className="py-2 px-3">{r.caseName}</td>
                                    <td className="py-2 px-3 text-right">
                                        {cases.find(c => c.id === r.caseId)?.requiredFlow} {units === 'SI' ? 'm³/h' : 'GPM'}
                                    </td>
                                    <td className="py-2 px-3 text-right font-medium">
                                        {r.tdh.toFixed(2)} {r.result.unit}
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                        {governingCase?.caseId === r.caseId && (
                                            <span className="status-in-progress">Governing</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {governingCase && (
                    <div className="mt-4 p-3 bg-re-yellow-light rounded-lg text-sm">
                        <strong>Governing Case untuk TDH:</strong> {governingCase.caseName} pada {governingCase.value.toFixed(2)} {units === 'SI' ? 'm' : 'ft'}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                <Button variant="secondary" onClick={() => goToStep(1)}>
                    ← Kembali ke Step 1
                </Button>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSave}>
                        Simpan
                    </Button>
                    <Button variant="primary" onClick={handleNext}>
                        Lanjut: Pump Configuration →
                    </Button>
                </div>
            </div>
        </div>
    );
}
