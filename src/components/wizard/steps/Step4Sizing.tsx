'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import { FormInput, FormSelect } from '@/components/ui/FormInputs';
import { Project, VendorCurvePoint } from '@/types';
import { calculateTDH } from '@/lib/calculations/tdh';

interface Step4Props {
    project: Project;
    updateProject: (updates: Partial<Project>) => void;
    goToStep: (step: number) => void;
    markStepComplete: (step: number) => void;
}

export default function Step4Sizing({ project, updateProject, goToStep, markStepComplete }: Step4Props) {
    const units = project.units;
    const normalCase = project.cases.find(c => c.name === 'Normal') || project.cases[0];

    // Vendor curve data input
    const [vendorData, setVendorData] = useState({
        pumpModel: project.vendorData?.pumpModel || '',
        manufacturer: project.vendorData?.manufacturer || '',
        impellerDiameter: project.vendorData?.impellerDiameter || 0,
        speed: project.vendorData?.speed || (project.pumpConfig?.speedPreference === '50Hz' ? 2960 : 3550),
        ratedFlow: project.vendorData?.ratedFlow || normalCase?.requiredFlow || 0,
        ratedHead: project.vendorData?.ratedHead || 0,
        ratedEfficiency: project.vendorData?.ratedEfficiency || 0.70,
        ratedNPSHr: project.vendorData?.ratedNPSHr || 0,
        ratedPower: project.vendorData?.ratedPower || 0,
    });

    // Curve points (simplified - 3 point curve)
    const [curvePoints, setCurvePoints] = useState<{ flow: number; head: number; eff: number; npshr: number }[]>([
        { flow: 0, head: 0, eff: 0, npshr: 0 },
        { flow: 0, head: 0, eff: 0, npshr: 0 },
        { flow: 0, head: 0, eff: 0, npshr: 0 },
    ]);

    // Calculate required duty point from normal case
    const requiredDuty = useMemo(() => {
        if (!normalCase) return null;
        const tdh = calculateTDH(normalCase, units);
        return {
            flow: normalCase.requiredFlow,
            head: tdh.value,
            unit: units === 'SI' ? 'm' : 'ft',
            flowUnit: units === 'SI' ? 'm³/h' : 'GPM',
        };
    }, [normalCase, units]);

    const handleSave = () => {
        updateProject({
            vendorData: {
                ...vendorData,
                headCurve: curvePoints.filter(p => p.flow > 0).map(p => ({ flow: p.flow, value: p.head })),
                npshCurve: curvePoints.filter(p => p.flow > 0).map(p => ({ flow: p.flow, value: p.npshr })),
                efficiencyCurve: curvePoints.filter(p => p.flow > 0).map(p => ({ flow: p.flow, value: p.eff })),
                powerCurve: [],
            }
        });
        markStepComplete(4);
    };

    const handleNext = () => {
        handleSave();
        goToStep(5);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Step 4: Preliminary Sizing & Vendor Data</h1>
            <p className="text-gray-600 mb-4">Masukkan data kurva vendor untuk evaluasi performa pompa</p>

            {/* Helper Notes */}
            <div className="p-4 bg-re-blue-light rounded-lg text-sm text-gray-700 mb-6 border border-re-blue/20">
                <p className="font-medium text-re-blue mb-2">📝 Panduan Input Data Vendor:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li><strong>Rated Point:</strong> Ambil dari datasheet vendor di titik BEP atau duty point</li>
                    <li><strong>Efficiency:</strong> Masukkan dalam desimal (0.75 = 75%)</li>
                    <li><strong>NPSHr:</strong> Biasanya lebih tinggi di flow tinggi, ambil nilai pada rated flow</li>
                    <li><strong>Data Kurva:</strong> Opsional, digunakan untuk interpolasi jika tersedia</li>
                </ul>
            </div>

            {/* Required Duty Point */}
            {requiredDuty && (
                <div className="card bg-re-blue-light border-re-blue/20 mb-6">
                    <h2 className="text-lg font-semibold text-re-blue mb-4">Duty Point yang Dibutuhkan</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Flow (Normal)</p>
                            <p className="text-2xl font-bold text-gray-900">{requiredDuty.flow} {requiredDuty.flowUnit}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Head (TDH)</p>
                            <p className="text-2xl font-bold text-re-blue">{requiredDuty.head.toFixed(2)} {requiredDuty.unit}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">NPSHa (Normal)</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {/* Simplified - would calculate from case data */}
                                ~ m
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Standar</p>
                            <p className="text-2xl font-bold text-gray-900">{project.pumpStandard.replace('API', 'API ')}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Vendor Info */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Vendor</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormInput
                        label="Manufacturer"
                        value={vendorData.manufacturer}
                        onChange={(e) => setVendorData(prev => ({ ...prev, manufacturer: e.target.value }))}
                        placeholder="cth: Sulzer, KSB"
                    />

                    <FormInput
                        label="Model Pompa"
                        value={vendorData.pumpModel}
                        onChange={(e) => setVendorData(prev => ({ ...prev, pumpModel: e.target.value }))}
                        placeholder="cth: CPE 80-200"
                    />

                    <FormInput
                        label="Diameter Impeller"
                        type="number"
                        value={vendorData.impellerDiameter || ''}
                        onChange={(e) => setVendorData(prev => ({ ...prev, impellerDiameter: parseFloat(e.target.value) || 0 }))}
                        unit="mm"
                    />

                    <FormInput
                        label="Speed"
                        type="number"
                        value={vendorData.speed || ''}
                        onChange={(e) => setVendorData(prev => ({ ...prev, speed: parseFloat(e.target.value) || 0 }))}
                        unit="RPM"
                    />
                </div>
            </div>

            {/* Rated Point Data */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Titik Rating</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Masukkan data performa pompa pada titik rating dari datasheet vendor.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <FormInput
                        label="Rated Flow"
                        type="number"
                        value={vendorData.ratedFlow || ''}
                        onChange={(e) => setVendorData(prev => ({ ...prev, ratedFlow: parseFloat(e.target.value) || 0 }))}
                        unit={units === 'SI' ? 'm³/h' : 'GPM'}
                    />

                    <FormInput
                        label="Rated Head"
                        type="number"
                        value={vendorData.ratedHead || ''}
                        onChange={(e) => setVendorData(prev => ({ ...prev, ratedHead: parseFloat(e.target.value) || 0 }))}
                        unit={units === 'SI' ? 'm' : 'ft'}
                    />

                    <FormInput
                        label="Efficiency"
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={vendorData.ratedEfficiency || ''}
                        onChange={(e) => setVendorData(prev => ({ ...prev, ratedEfficiency: parseFloat(e.target.value) || 0 }))}
                        unit="(0-1)"
                    />

                    <FormInput
                        label="NPSHr"
                        type="number"
                        step="0.1"
                        value={vendorData.ratedNPSHr || ''}
                        onChange={(e) => setVendorData(prev => ({ ...prev, ratedNPSHr: parseFloat(e.target.value) || 0 }))}
                        unit={units === 'SI' ? 'm' : 'ft'}
                    />

                    <FormInput
                        label="Power"
                        type="number"
                        step="0.1"
                        value={vendorData.ratedPower || ''}
                        onChange={(e) => setVendorData(prev => ({ ...prev, ratedPower: parseFloat(e.target.value) || 0 }))}
                        unit="kW"
                    />
                </div>
            </div>

            {/* Curve Points (Optional) */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Kurva (Opsional)</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Masukkan 3 titik kurva untuk interpolasi. Biarkan kosong jika hanya menggunakan data titik rating.
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Titik</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">Flow ({units === 'SI' ? 'm³/h' : 'GPM'})</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">Head ({units === 'SI' ? 'm' : 'ft'})</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">Efficiency</th>
                                <th className="text-right py-2 px-3 font-medium text-gray-700">NPSHr ({units === 'SI' ? 'm' : 'ft'})</th>
                            </tr>
                        </thead>
                        <tbody>
                            {curvePoints.map((point, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                    <td className="py-2 px-3">{idx === 0 ? 'Min' : idx === 1 ? 'BEP' : 'Max'}</td>
                                    <td className="py-2 px-3">
                                        <input
                                            type="number"
                                            value={point.flow || ''}
                                            onChange={(e) => {
                                                const newPoints = [...curvePoints];
                                                newPoints[idx].flow = parseFloat(e.target.value) || 0;
                                                setCurvePoints(newPoints);
                                            }}
                                            className="input-field w-24 text-right"
                                        />
                                    </td>
                                    <td className="py-2 px-3">
                                        <input
                                            type="number"
                                            value={point.head || ''}
                                            onChange={(e) => {
                                                const newPoints = [...curvePoints];
                                                newPoints[idx].head = parseFloat(e.target.value) || 0;
                                                setCurvePoints(newPoints);
                                            }}
                                            className="input-field w-24 text-right"
                                        />
                                    </td>
                                    <td className="py-2 px-3">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={point.eff || ''}
                                            onChange={(e) => {
                                                const newPoints = [...curvePoints];
                                                newPoints[idx].eff = parseFloat(e.target.value) || 0;
                                                setCurvePoints(newPoints);
                                            }}
                                            className="input-field w-24 text-right"
                                        />
                                    </td>
                                    <td className="py-2 px-3">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={point.npshr || ''}
                                            onChange={(e) => {
                                                const newPoints = [...curvePoints];
                                                newPoints[idx].npshr = parseFloat(e.target.value) || 0;
                                                setCurvePoints(newPoints);
                                            }}
                                            className="input-field w-24 text-right"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BEP Evaluation Placeholder */}
            <div className="card bg-re-yellow-light border-re-yellow/20 mb-6">
                <h2 className="text-lg font-semibold text-re-yellow mb-2">Evaluasi BEP</h2>
                <p className="text-sm text-gray-700">
                    Fitur evaluasi operasi terhadap BEP (Best Efficiency Point) akan tersedia di update berikutnya.
                    Kriteria yang akan dievaluasi: 70-120% of BEP flow.
                </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                <Button variant="secondary" onClick={() => goToStep(3)}>
                    ← Kembali ke Step 3
                </Button>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSave}>
                        Simpan
                    </Button>
                    <Button variant="primary" onClick={handleNext}>
                        Lanjut: NPSH Verification →
                    </Button>
                </div>
            </div>
        </div>
    );
}
