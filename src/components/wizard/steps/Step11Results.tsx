'use client';

import { useMemo } from 'react';
import Button from '@/components/ui/Button';
import { Project } from '@/types';
import { calculateTDH, findGoverningTDHCase } from '@/lib/calculations/tdh';
import { calculateNPSHa } from '@/lib/calculations/npsh';
import { calculateHydraulicPower, calculateBrakePower, calculateMotorSize } from '@/lib/calculations/power';
import { generatePDF } from '@/lib/exportPdf';
import { generateExcel } from '@/lib/exportExcel';
import { DEFAULT_COMPANY_CRITERIA } from '@/lib/companyCriteria';

interface Step11Props {
    project: Project;
    updateProject: (updates: Partial<Project>) => void;
    goToStep: (step: number) => void;
    markStepComplete: (step: number) => void;
}

export default function Step11Results({ project, updateProject, goToStep, markStepComplete }: Step11Props) {
    const units = project.units;
    const cases = project.cases;

    // Calculate all results
    const results = useMemo(() => {
        return cases.map(c => {
            const tdh = calculateTDH(c, units);
            const npsha = calculateNPSHa(c, units);
            const efficiency = project.vendorData?.ratedEfficiency || 0.70;
            const hydraulicPower = calculateHydraulicPower(
                c.requiredFlow, tdh.value, c.fluid.density, c.fluid.specificGravity, units
            );
            const brakePower = calculateBrakePower(hydraulicPower.value, efficiency);
            const motorSize = calculateMotorSize(brakePower.value, DEFAULT_COMPANY_CRITERIA);

            return {
                caseId: c.id,
                caseData: c,
                caseName: c.name,
                flow: c.requiredFlow,
                tdh: tdh.value,
                tdhBreakdown: tdh.breakdown,
                tdhUnit: tdh.unit,
                npsha: npsha.value,
                hydraulicPower: hydraulicPower.value,
                brakePower: brakePower.value,
                motorSize: motorSize.value,
                efficiency,
            };
        });
    }, [cases, units, project.vendorData?.ratedEfficiency]);

    const governingTDH = useMemo(() => {
        return findGoverningTDHCase(results.map(r => ({ caseId: r.caseId, caseName: r.caseName, tdh: r.tdh })));
    }, [results]);

    const governingNPSH = useMemo(() => {
        const minNPSH = results.reduce((min, r) => r.npsha < min.npsha ? r : min);
        return minNPSH;
    }, [results]);

    const governingPower = useMemo(() => {
        const maxPower = results.reduce((max, r) => r.brakePower > max.brakePower ? r : max);
        return maxPower;
    }, [results]);

    const normalCase = project.cases.find(c => c.name === 'Normal') || project.cases[0];

    const handleExportPDF = () => {
        try {
            generatePDF(project);
        } catch (error) {
            console.error('PDF export error:', error);
            alert('Gagal mengekspor PDF: ' + (error as Error).message);
        }
    };

    const handleExportExcel = () => {
        try {
            generateExcel(project);
        } catch (error) {
            console.error('Excel export error:', error);
            alert('Gagal mengekspor Excel: ' + (error as Error).message);
        }
    };

    // Get selection source display
    const getSelectionSourceDisplay = () => {
        if (project.selectionSource === 'assisted') return 'Rekomendasi Sistem (Assisted)';
        if (project.selectionSource === 'override') return 'Override Manual';
        if (project.selectionSource === 'manual') return 'Pilihan Manual';
        return '-';
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Step 11: Hasil & Laporan</h1>
            <p className="text-gray-600 mb-6">Tinjau ringkasan kalkulasi lengkap dan ekspor ke PDF/Excel</p>

            {/* Project Summary */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Informasi Proyek</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Nama Proyek</p>
                        <p className="font-semibold text-gray-900">{project.metadata.projectName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Nomor Tag</p>
                        <p className="font-semibold text-gray-900">{project.metadata.tagNo}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Klien</p>
                        <p className="font-semibold text-gray-900">{project.metadata.client || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Unit/Area</p>
                        <p className="font-semibold text-gray-900">{project.metadata.unitArea || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Standar Pompa</p>
                        <p className="font-semibold text-re-blue">
                            {project.selectedStandard !== 'UNSET'
                                ? (project.selectedStandard as string).replace('API', 'API ')
                                : project.pumpStandard.replace('API', 'API ')}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Sistem Unit</p>
                        <p className="font-semibold text-gray-900">{units}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Mode Pemilihan</p>
                        <p className="font-semibold text-gray-900 capitalize">{project.selectionMode || 'manual'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Sumber Pemilihan</p>
                        <p className="font-semibold text-gray-900">{getSelectionSourceDisplay()}</p>
                    </div>
                </div>
            </div>

            {/* Fluid Properties */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Properti Fluida</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left py-3 px-3 font-medium text-gray-700">Property</th>
                                <th className="text-right py-3 px-3 font-medium text-gray-700">Minimum</th>
                                <th className="text-right py-3 px-3 font-medium text-gray-700">Normal</th>
                                <th className="text-right py-3 px-3 font-medium text-gray-700">Maximum</th>
                                <th className="text-center py-3 px-3 font-medium text-gray-700">Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 px-3 font-medium">Flow Rate</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Minimum')?.requiredFlow || '-'}</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Normal')?.requiredFlow || '-'}</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Maximum')?.requiredFlow || '-'}</td>
                                <td className="py-2 px-3 text-center">{units === 'SI' ? 'm³/h' : 'GPM'}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 px-3 font-medium">Temperature</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Minimum')?.fluid.temperature || '-'}</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Normal')?.fluid.temperature || '-'}</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Maximum')?.fluid.temperature || '-'}</td>
                                <td className="py-2 px-3 text-center">{units === 'SI' ? '°C' : '°F'}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 px-3 font-medium">Density</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Minimum')?.fluid.density || '-'}</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Normal')?.fluid.density || '-'}</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Maximum')?.fluid.density || '-'}</td>
                                <td className="py-2 px-3 text-center">{units === 'SI' ? 'kg/m³' : 'lb/ft³'}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 px-3 font-medium">Specific Gravity</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Minimum')?.fluid.specificGravity || '-'}</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Normal')?.fluid.specificGravity || '-'}</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Maximum')?.fluid.specificGravity || '-'}</td>
                                <td className="py-2 px-3 text-center">-</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 px-3 font-medium">Viscosity</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Minimum')?.fluid.viscosity || '-'}</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Normal')?.fluid.viscosity || '-'}</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Maximum')?.fluid.viscosity || '-'}</td>
                                <td className="py-2 px-3 text-center">cP</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 px-3 font-medium">Vapor Pressure</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Minimum')?.fluid.vaporPressure || '-'}</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Normal')?.fluid.vaporPressure || '-'}</td>
                                <td className="py-2 px-3 text-right">{project.cases.find(c => c.name === 'Maximum')?.fluid.vaporPressure || '-'}</td>
                                <td className="py-2 px-3 text-center">{units === 'SI' ? 'kPa(a)' : 'psia'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Fluid Characteristics */}
                {normalCase && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {normalCase.fluid.isCorrosive && <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Corrosive</span>}
                        {normalCase.fluid.isToxic && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Toxic</span>}
                        {normalCase.fluid.isFlammable && <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">Flammable</span>}
                        {normalCase.fluid.shearSensitive && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Shear Sensitive</span>}
                        {(normalCase.fluid.solidsPct || 0) > 0 && <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Solids {normalCase.fluid.solidsPct}%</span>}
                    </div>
                )}
            </div>

            {/* TDH Breakdown */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">3. TDH Breakdown per Kasus</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-re-blue-light">
                                <th className="text-left py-3 px-3 font-medium text-gray-700">Kasus</th>
                                <th className="text-right py-3 px-3 font-medium text-gray-700">Static Head</th>
                                <th className="text-right py-3 px-3 font-medium text-gray-700">Friction Loss</th>
                                <th className="text-right py-3 px-3 font-medium text-gray-700">CV ΔP</th>
                                <th className="text-right py-3 px-3 font-medium text-gray-700">Allowance</th>
                                <th className="text-right py-3 px-3 font-medium text-re-blue">Total TDH</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r) => (
                                <tr key={r.caseId} className={`border-b border-gray-100 ${governingTDH?.caseId === r.caseId ? 'bg-re-yellow-light' : ''}`}>
                                    <td className="py-2 px-3 font-medium">{r.caseName}</td>
                                    <td className="py-2 px-3 text-right">{r.tdhBreakdown?.staticHead?.toFixed(2) || '-'}</td>
                                    <td className="py-2 px-3 text-right">{r.tdhBreakdown?.frictionLosses?.toFixed(2) || '-'}</td>
                                    <td className="py-2 px-3 text-right">{r.tdhBreakdown?.controlValveDP?.toFixed(2) || '-'}</td>
                                    <td className="py-2 px-3 text-right">{r.tdhBreakdown?.allowances?.toFixed(2) || '-'}</td>
                                    <td className="py-2 px-3 text-right font-bold text-re-blue">{r.tdh.toFixed(2)} {units === 'SI' ? 'm' : 'ft'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Calculation Results */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">4. Hasil Kalkulasi</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left py-3 px-3 font-medium text-gray-700">Kasus</th>
                                <th className="text-right py-3 px-3 font-medium text-gray-700">Flow<br /><span className="font-normal text-gray-500">{units === 'SI' ? 'm³/h' : 'GPM'}</span></th>
                                <th className="text-right py-3 px-3 font-medium text-gray-700">TDH<br /><span className="font-normal text-gray-500">{units === 'SI' ? 'm' : 'ft'}</span></th>
                                <th className="text-right py-3 px-3 font-medium text-gray-700">NPSHa<br /><span className="font-normal text-gray-500">{units === 'SI' ? 'm' : 'ft'}</span></th>
                                <th className="text-right py-3 px-3 font-medium text-gray-700">Hyd. Power<br /><span className="font-normal text-gray-500">kW</span></th>
                                <th className="text-right py-3 px-3 font-medium text-gray-700">Brake Power<br /><span className="font-normal text-gray-500">kW</span></th>
                                <th className="text-right py-3 px-3 font-medium text-gray-700">Motor<br /><span className="font-normal text-gray-500">kW</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((r) => (
                                <tr key={r.caseId} className="border-b border-gray-100">
                                    <td className="py-3 px-3 font-medium">{r.caseName}</td>
                                    <td className="py-3 px-3 text-right">{r.flow.toFixed(1)}</td>
                                    <td className="py-3 px-3 text-right">{r.tdh.toFixed(2)}</td>
                                    <td className="py-3 px-3 text-right">{r.npsha.toFixed(2)}</td>
                                    <td className="py-3 px-3 text-right">{r.hydraulicPower.toFixed(2)}</td>
                                    <td className="py-3 px-3 text-right">{r.brakePower.toFixed(2)}</td>
                                    <td className="py-3 px-3 text-right font-medium">{r.motorSize.toFixed(0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className="text-sm text-gray-500 mt-3">
                    Efisiensi pompa: {((project.vendorData?.ratedEfficiency || 0.70) * 100).toFixed(0)}% |
                    Margin motor: {DEFAULT_COMPANY_CRITERIA.driverMargin.value}%
                </p>
            </div>

            {/* Governing Cases */}
            <div className="card bg-re-blue-light border-re-blue/20 mb-6">
                <h2 className="text-lg font-semibold text-re-blue mb-4">5. Governing Cases</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-4 border border-re-blue/10">
                        <p className="text-sm text-gray-600 mb-1">TDH Governing</p>
                        <p className="text-xl font-bold text-gray-900">{governingTDH?.caseName}</p>
                        <p className="text-2xl font-bold text-re-blue">{governingTDH?.value.toFixed(2)} {units === 'SI' ? 'm' : 'ft'}</p>
                        <p className="text-xs text-gray-500 mt-1">TDH maksimum untuk kapabilitas head pompa</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-re-blue/10">
                        <p className="text-sm text-gray-600 mb-1">NPSH Governing</p>
                        <p className="text-xl font-bold text-gray-900">{governingNPSH.caseName}</p>
                        <p className="text-2xl font-bold text-re-green">{governingNPSH.npsha.toFixed(2)} {units === 'SI' ? 'm' : 'ft'}</p>
                        <p className="text-xs text-gray-500 mt-1">NPSHa minimum untuk verifikasi suction</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-re-blue/10">
                        <p className="text-sm text-gray-600 mb-1">Power Governing</p>
                        <p className="text-xl font-bold text-gray-900">{governingPower.caseName}</p>
                        <p className="text-2xl font-bold text-re-orange">{governingPower.brakePower.toFixed(2)} kW</p>
                        <p className="text-xs text-gray-500 mt-1">Brake power maksimum untuk sizing motor</p>
                    </div>
                </div>
            </div>

            {/* Pump Configuration (if available) */}
            {project.pumpConfig && (
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">6. Konfigurasi Pompa</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">API 610 Config</p>
                            <p className="font-semibold text-gray-900">{project.pumpConfig.api610Config || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Orientation</p>
                            <p className="font-semibold text-gray-900">{project.pumpConfig.orientation || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Stages</p>
                            <p className="font-semibold text-gray-900">{project.pumpConfig.stages || 1}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Speed Preference</p>
                            <p className="font-semibold text-gray-900">{project.pumpConfig.speedPreference || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Driver Type</p>
                            <p className="font-semibold text-gray-900">{project.pumpConfig.driverType || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Installation</p>
                            <p className="font-semibold text-gray-900">{project.pumpConfig.installation || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Area Classification</p>
                            <p className="font-semibold text-gray-900">{project.pumpConfig.areaClassification || '-'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Vendor Data (if available) */}
            {project.vendorData && (project.vendorData.manufacturer || project.vendorData.pumpModel) && (
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">7. Data Vendor</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Manufacturer</p>
                            <p className="font-semibold text-gray-900">{project.vendorData.manufacturer || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Pump Model</p>
                            <p className="font-semibold text-gray-900">{project.vendorData.pumpModel || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Impeller Diameter</p>
                            <p className="font-semibold text-gray-900">{project.vendorData.impellerDiameter ? `${project.vendorData.impellerDiameter} mm` : '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Speed</p>
                            <p className="font-semibold text-gray-900">{project.vendorData.speed ? `${project.vendorData.speed} RPM` : '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Rated Flow</p>
                            <p className="font-semibold text-gray-900">{project.vendorData.ratedFlow ? `${project.vendorData.ratedFlow} ${units === 'SI' ? 'm³/h' : 'GPM'}` : '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Rated Head</p>
                            <p className="font-semibold text-gray-900">{project.vendorData.ratedHead ? `${project.vendorData.ratedHead} ${units === 'SI' ? 'm' : 'ft'}` : '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Rated Efficiency</p>
                            <p className="font-semibold text-gray-900">{project.vendorData.ratedEfficiency ? `${(project.vendorData.ratedEfficiency * 100).toFixed(1)}%` : '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">NPSHr</p>
                            <p className="font-semibold text-gray-900">{project.vendorData.ratedNPSHr ? `${project.vendorData.ratedNPSHr} ${units === 'SI' ? 'm' : 'ft'}` : '-'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendation Snapshot (if available) */}
            {project.recommendationSnapshot && (
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">8. Snapshot Rekomendasi</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-600">Standar Direkomendasikan</p>
                            <p className="font-semibold text-re-blue">
                                {project.recommendationSnapshot.recommendedStandard.replace('API', 'API ')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Tipe Pompa</p>
                            <p className="font-semibold text-gray-900 capitalize">
                                {project.recommendationSnapshot.recommendedPumpType.replace(/_/g, ' ')}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Confidence</p>
                            <p className={`font-semibold capitalize ${project.recommendationSnapshot.confidence === 'high' ? 'text-re-green' :
                                project.recommendationSnapshot.confidence === 'medium' ? 'text-re-yellow' : 'text-re-orange'
                                }`}>
                                {project.recommendationSnapshot.confidence === 'high' ? 'Tinggi' :
                                    project.recommendationSnapshot.confidence === 'medium' ? 'Sedang' : 'Rendah'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Generated</p>
                            <p className="font-semibold text-gray-900">
                                {new Date(project.recommendationSnapshot.generatedAt).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>

                    <details className="text-sm">
                        <summary className="cursor-pointer text-gray-600 hover:text-gray-900 font-medium">
                            Lihat detail alasan dan skor
                        </summary>
                        <div className="mt-3 space-y-3">
                            <div>
                                <p className="font-medium text-gray-700 mb-1">Alasan:</p>
                                <ul className="list-disc list-inside text-gray-600">
                                    {project.recommendationSnapshot.reasons.map((r, i) => (
                                        <li key={i}>{r}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700 mb-1">Skor:</p>
                                <div className="grid grid-cols-4 gap-2 text-center">
                                    {Object.entries(project.recommendationSnapshot.scores).map(([std, score]) => (
                                        <div key={std} className="bg-gray-50 p-2 rounded">
                                            <p className="text-xs text-gray-500">{std.replace('API', 'API ')}</p>
                                            <p className="font-bold">{score}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </details>
                </div>
            )}

            {/* Export Actions */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ekspor Laporan</h2>

                <div className="flex flex-wrap gap-4">
                    <Button variant="primary" onClick={handleExportPDF}>
                        📄 Ekspor ke PDF
                    </Button>
                    <Button variant="secondary" onClick={handleExportExcel}>
                        📊 Ekspor ke Excel
                    </Button>
                </div>

                <p className="text-sm text-gray-500 mt-4">
                    Laporan PDF mencakup: Cover page, Executive summary, Process data, TDH breakdown,
                    NPSH verification, Power sizing, Pump configuration, Vendor data, Governing cases,
                    Notes, dan Approval section.
                </p>
            </div>

            {/* Completion Status */}
            <div className="card bg-re-green-light border-re-green/20 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-re-green rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-re-green">Kalkulasi Selesai</h3>
                        <p className="text-sm text-gray-600">
                            Kalkulasi sizing pompa selesai. Tinjau hasil dan ekspor laporan untuk review internal.
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                <Button variant="secondary" onClick={() => goToStep(10)}>
                    ← Kembali ke Step 10
                </Button>

                <Button variant="primary" href="/pumpcalc/saved">
                    Simpan & Kembali ke Proyek
                </Button>
            </div>
        </div>
    );
}
