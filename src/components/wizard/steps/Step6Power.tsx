'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInputs';
import { Project } from '@/types';
import { calculateTDH } from '@/lib/calculations/tdh';
import { calculateHydraulicPower, calculateBrakePower, calculateMotorSize, findGoverningPowerCase } from '@/lib/calculations/power';
import { DEFAULT_COMPANY_CRITERIA } from '@/lib/companyCriteria';

interface Step6Props {
    project: Project;
    updateProject: (updates: Partial<Project>) => void;
    goToStep: (step: number) => void;
    markStepComplete: (step: number) => void;
}

export default function Step6Power({ project, updateProject, goToStep, markStepComplete }: Step6Props) {
    const units = project.units;
    const cases = project.cases;

    // Store efficiency per case (default 70%)
    const [efficiencies, setEfficiencies] = useState<Record<string, number>>(
        () => cases.reduce((acc, c) => ({ ...acc, [c.id]: 0.70 }), {})
    );

    const updateEfficiency = (caseId: string, value: number) => {
        setEfficiencies((prev: Record<string, number>) => ({ ...prev, [caseId]: value }));
    };

    // Calculate power for all cases
    const powerResults = useMemo(() => {
        return cases.map(c => {
            const tdh = calculateTDH(c, units);
            const efficiency = efficiencies[c.id] || 0.70;

            const hydraulicPower = calculateHydraulicPower(
                c.requiredFlow,
                tdh.value,
                c.fluid.density,
                c.fluid.specificGravity,
                units
            );

            const brakePower = calculateBrakePower(hydraulicPower.value, efficiency);
            const motorSize = calculateMotorSize(brakePower.value, DEFAULT_COMPANY_CRITERIA);

            return {
                caseId: c.id,
                caseName: c.name,
                flow: c.requiredFlow,
                tdh: tdh.value,
                efficiency,
                hydraulicPower: hydraulicPower.value,
                brakePower: brakePower.value,
                motorSize: motorSize.value,
                motorStatus: motorSize.status,
                motorReasoning: motorSize.reasoning,
            };
        });
    }, [cases, units, efficiencies]);

    const governingCase = useMemo(() => {
        return findGoverningPowerCase(powerResults.map(r => ({
            caseId: r.caseId,
            caseName: r.caseName,
            brakePower: r.brakePower,
        })));
    }, [powerResults]);

    // Recommended motor size (based on governing case)
    const recommendedMotor = governingCase
        ? powerResults.find(r => r.caseId === governingCase.caseId)?.motorSize
        : null;

    const handleSave = () => {
        markStepComplete(6);
    };

    const handleNext = () => {
        handleSave();
        goToStep(7);
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'OK': return 'status-available';
            case 'Review': return 'status-in-progress';
            case 'NOT_OK': return 'bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-medium';
            default: return 'status-planned';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'OK': return 'OK';
            case 'Review': return 'Review';
            case 'NOT_OK': return 'NOT OK';
            default: return status;
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Step 6: Power & Driver Sizing</h1>
            <p className="text-gray-600 mb-4">Hitung kebutuhan daya dan tentukan sizing motor</p>

            {/* Helper Notes */}
            <div className="p-4 bg-re-blue-light rounded-lg text-sm text-gray-700 mb-6 border border-re-blue/20">
                <p className="font-medium text-re-blue mb-2">📝 Panduan Power Calculation:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li><strong>Efisiensi:</strong> Ambil dari kurva vendor pada titik operasi (umumnya 65-85%)</li>
                    <li><strong>Hydraulic Power:</strong> Dihitung dari Q × H × ρ × g</li>
                    <li><strong>Brake Power:</strong> Hydraulic Power dibagi efisiensi pompa</li>
                    <li><strong>Motor Size:</strong> Pilih motor standar dengan margin sesuai kriteria perusahaan</li>
                </ul>
            </div>

            {/* Efficiency Input Table */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Efisiensi Pompa (Data Vendor)</h2>
                <p className="text-sm text-gray-500 mb-4">Masukkan efisiensi pompa dari kurva vendor pada setiap titik operasi</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cases.map((c) => (
                        <div key={c.id} className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">Kasus {c.name}</p>
                            <FormInput
                                label="Efisiensi pada titik operasi"
                                type="number"
                                step="0.01"
                                min="0.1"
                                max="1.0"
                                value={efficiencies[c.id]}
                                onChange={(e) => updateEfficiency(c.id, parseFloat(e.target.value) || 0.70)}
                                unit="(0-1)"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                = {((efficiencies[c.id] || 0.70) * 100).toFixed(1)}%
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Power Summary Table */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Kalkulasi Daya</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Kasus</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">Flow</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">TDH</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">η</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">Hydraulic Power</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">Brake Power</th>
                                <th className="text-center py-2 px-3 font-medium text-gray-700">Governing</th>
                            </tr>
                        </thead>
                        <tbody>
                            {powerResults.map((r) => (
                                <tr key={r.caseId} className={`border-b border-gray-100 ${governingCase?.caseId === r.caseId ? 'bg-re-yellow-light' : ''}`}>
                                    <td className="py-2 px-3 font-medium">{r.caseName}</td>
                                    <td className="py-2 px-3 text-right">{r.flow} {units === 'SI' ? 'm³/h' : 'GPM'}</td>
                                    <td className="py-2 px-3 text-right">{r.tdh.toFixed(1)} {units === 'SI' ? 'm' : 'ft'}</td>
                                    <td className="py-2 px-3 text-right">{(r.efficiency * 100).toFixed(1)}%</td>
                                    <td className="py-2 px-3 text-right">{r.hydraulicPower.toFixed(2)} kW</td>
                                    <td className="py-2 px-3 text-right font-medium">{r.brakePower.toFixed(2)} kW</td>
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
            </div>

            {/* Motor Sizing Recommendation */}
            <div className="card bg-re-green-light border-re-green/20 mb-6">
                <h2 className="text-lg font-semibold text-re-green mb-4">Rekomendasi Sizing Motor</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <p className="text-sm text-gray-600">Governing Brake Power</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {governingCase?.value.toFixed(2) ?? '—'} kW
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Driver Margin</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {DEFAULT_COMPANY_CRITERIA.driverMargin.value}%
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Motor Size Minimum</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {governingCase
                                ? (governingCase.value * (1 + DEFAULT_COMPANY_CRITERIA.driverMargin.value / 100)).toFixed(2)
                                : '—'} kW
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Motor Direkomendasikan</p>
                        <p className="text-3xl font-bold text-re-green">
                            {recommendedMotor?.toFixed(0) ?? '—'} kW
                        </p>
                    </div>
                </div>

                {governingCase && (
                    <div className="p-3 bg-white/50 rounded-lg text-sm">
                        <strong>Governing Case:</strong> {governingCase.caseName} pada {governingCase.value.toFixed(2)} kW brake power
                    </div>
                )}
            </div>

            {/* Detailed Results */}
            <div className="space-y-4 mb-6">
                {powerResults.map((r) => (
                    <div key={r.caseId} className="card">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">Kasus {r.caseName} — Cek Motor</h3>
                            <span className={getStatusClass(r.motorStatus)}>{getStatusLabel(r.motorStatus)}</span>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                            <strong>Alasan:</strong> {r.motorReasoning}
                        </div>
                    </div>
                ))}
            </div>

            {/* Criteria Notice */}
            {!DEFAULT_COMPANY_CRITERIA.driverMargin.isConfigured && (
                <div className="p-4 bg-re-yellow-light rounded-lg text-sm text-re-yellow border border-re-yellow/20 mb-6">
                    ⚠️ <strong>Catatan:</strong> Kriteria margin driver belum dikonfigurasi secara formal. Menggunakan nilai placeholder {DEFAULT_COMPANY_CRITERIA.driverMargin.value}%. Semua check ditandai "Review" sampai kriteria dikonfigurasi di Settings.
                </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                <Button variant="secondary" onClick={() => goToStep(5)}>
                    ← Kembali ke Step 5
                </Button>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSave}>
                        Simpan
                    </Button>
                    <Button variant="primary" onClick={handleNext}>
                        Lanjut: API 610 Compliance →
                    </Button>
                </div>
            </div>
        </div>
    );
}
