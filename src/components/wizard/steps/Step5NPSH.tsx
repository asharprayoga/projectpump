'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInputs';
import { Project } from '@/types';
import { calculateNPSHa, evaluateNPSH, findGoverningNPSHCase } from '@/lib/calculations/npsh';
import { DEFAULT_COMPANY_CRITERIA } from '@/lib/companyCriteria';

interface Step5Props {
    project: Project;
    updateProject: (updates: Partial<Project>) => void;
    goToStep: (step: number) => void;
    markStepComplete: (step: number) => void;
}

export default function Step5NPSH({ project, updateProject, goToStep, markStepComplete }: Step5Props) {
    const units = project.units;
    const cases = project.cases;

    // Store vendor NPSHr per case
    const [npshrValues, setNpshrValues] = useState<Record<string, number | null>>(
        () => cases.reduce((acc, c) => ({ ...acc, [c.id]: null }), {})
    );

    const updateNpshr = (caseId: string, value: number | null) => {
        setNpshrValues((prev: Record<string, number | null>) => ({ ...prev, [caseId]: value }));
    };

    // Calculate NPSHa for all cases
    const npshResults = useMemo(() => {
        return cases.map(c => {
            const npshaResult = calculateNPSHa(c, units);
            const npshr = npshrValues[c.id];
            const evaluation = evaluateNPSH(npshaResult.value, npshr, DEFAULT_COMPANY_CRITERIA, units);

            return {
                caseId: c.id,
                caseName: c.name,
                npsha: npshaResult.value,
                npshaResult,
                npshr,
                margin: evaluation.margin,
                status: evaluation.status,
                reasoning: evaluation.reasoning,
            };
        });
    }, [cases, units, npshrValues]);

    const governingCase = useMemo(() => {
        return findGoverningNPSHCase(npshResults.map((r: { caseId: string; caseName: string; npsha: number; margin: number | null }) => ({
            caseId: r.caseId,
            caseName: r.caseName,
            npsha: r.npsha,
            margin: r.margin,
        })));
    }, [npshResults]);

    const handleSave = () => {
        markStepComplete(5);
    };

    const handleNext = () => {
        handleSave();
        goToStep(6);
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Step 5: NPSH Verification</h1>
            <p className="text-gray-600 mb-4">Hitung NPSHa dan bandingkan dengan NPSHr vendor untuk verifikasi kondisi suction</p>

            {/* Helper Notes */}
            <div className="p-4 bg-re-blue-light rounded-lg text-sm text-gray-700 mb-6 border border-re-blue/20">
                <p className="font-medium text-re-blue mb-2">📝 Panduan NPSH:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li><strong>NPSHa:</strong> Dihitung otomatis dari kondisi suction yang sudah dimasukkan</li>
                    <li><strong>NPSHr:</strong> Ambil dari kurva vendor pada flow operasi yang sesuai</li>
                    <li><strong>Margin:</strong> Minimal sesuai kriteria perusahaan (umumnya 0.5-1.0 m atau 10%)</li>
                    <li><strong>Governing:</strong> Kasus dengan margin terendah adalah yang paling kritis</li>
                </ul>
            </div>

            {/* NPSHa Calculation Summary */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Kalkulasi NPSHa</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Kasus</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">Flow</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">NPSHa</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">NPSHr (vendor)</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">Margin</th>
                                <th className="text-center py-2 px-3 font-medium text-gray-700">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {npshResults.map((r) => {
                                const caseData = cases.find(c => c.id === r.caseId);
                                return (
                                    <tr key={r.caseId} className={`border-b border-gray-100 ${governingCase?.caseId === r.caseId ? 'bg-re-yellow-light' : ''}`}>
                                        <td className="py-2 px-3 font-medium">{r.caseName}</td>
                                        <td className="py-2 px-3 text-right">
                                            {caseData?.requiredFlow} {units === 'SI' ? 'm³/h' : 'GPM'}
                                        </td>
                                        <td className="py-2 px-3 text-right font-medium">
                                            {r.npsha.toFixed(2)} {units === 'SI' ? 'm' : 'ft'}
                                        </td>
                                        <td className="py-2 px-3 text-right">
                                            <FormInput
                                                label=""
                                                type="number"
                                                step="0.1"
                                                value={r.npshr ?? ''}
                                                onChange={(e) => updateNpshr(r.caseId, e.target.value ? parseFloat(e.target.value) : null)}
                                                placeholder="Masukkan"
                                                unit={units === 'SI' ? 'm' : 'ft'}
                                                className="inline-block w-32"
                                            />
                                        </td>
                                        <td className="py-2 px-3 text-right">
                                            {r.margin !== null
                                                ? `${r.margin.toFixed(2)} ${units === 'SI' ? 'm' : 'ft'}`
                                                : '—'
                                            }
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                            <span className={getStatusClass(r.status)}>{getStatusLabel(r.status)}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {governingCase && (
                    <div className="mt-4 p-3 bg-re-yellow-light rounded-lg text-sm">
                        <strong>Governing Case untuk NPSH:</strong> {governingCase.caseName}
                        {governingCase.margin !== null && (
                            <span> (margin: {governingCase.margin.toFixed(2)} {units === 'SI' ? 'm' : 'ft'})</span>
                        )}
                    </div>
                )}
            </div>

            {/* Detailed Results per Case */}
            <div className="space-y-4 mb-6">
                {npshResults.map((r) => (
                    <div key={r.caseId} className="card">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">Kasus {r.caseName}</h3>
                            <span className={getStatusClass(r.status)}>{getStatusLabel(r.status)}</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-600">NPSHa</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {r.npsha.toFixed(2)} {units === 'SI' ? 'm' : 'ft'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">NPSHr (vendor)</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {r.npshr !== null ? `${r.npshr.toFixed(2)} ${units === 'SI' ? 'm' : 'ft'}` : 'Belum diisi'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Margin</p>
                                <p className={`text-xl font-bold ${r.status === 'OK' ? 'text-re-green' : r.status === 'NOT_OK' ? 'text-red-600' : 'text-re-yellow'}`}>
                                    {r.margin !== null ? `${r.margin.toFixed(2)} ${units === 'SI' ? 'm' : 'ft'}` : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Margin yang Dibutuhkan</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {DEFAULT_COMPANY_CRITERIA.npshMargin.value} {DEFAULT_COMPANY_CRITERIA.npshMargin.type === 'percentage' ? '%' : units === 'SI' ? 'm' : 'ft'}
                                </p>
                            </div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                            <strong>Alasan:</strong> {r.reasoning}
                        </div>

                        {/* Assumptions */}
                        <details className="mt-3">
                            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">Lihat asumsi kalkulasi</summary>
                            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                                {r.npshaResult.assumptions.map((a, i) => (
                                    <li key={i}>{a}</li>
                                ))}
                            </ul>
                        </details>
                    </div>
                ))}
            </div>

            {/* Criteria Notice */}
            {!DEFAULT_COMPANY_CRITERIA.npshMargin.isConfigured && (
                <div className="p-4 bg-re-yellow-light rounded-lg text-sm text-re-yellow border border-re-yellow/20 mb-6">
                    ⚠️ <strong>Catatan:</strong> Kriteria margin NPSH belum dikonfigurasi secara formal. Menggunakan nilai placeholder {DEFAULT_COMPANY_CRITERIA.npshMargin.value} {DEFAULT_COMPANY_CRITERIA.npshMargin.type === 'percentage' ? '%' : 'm'}. Semua check ditandai "Review" sampai kriteria dikonfigurasi di Settings.
                </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                <Button variant="secondary" onClick={() => goToStep(4)}>
                    ← Kembali ke Step 4
                </Button>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSave}>
                        Simpan
                    </Button>
                    <Button variant="primary" onClick={handleNext}>
                        Lanjut: Power & Driver Sizing →
                    </Button>
                </div>
            </div>
        </div>
    );
}
