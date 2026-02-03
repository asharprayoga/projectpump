'use client';

import { useState } from 'react';
import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';
import { FormInput, FormSelect } from '@/components/ui/FormInputs';
import PumpSelectionChart, { PUMP_REGIONS } from '@/components/PumpSelectionChart';

export default function QuickCalculatorPage() {
    const [calcType, setCalcType] = useState('tdh');
    const [units, setUnits] = useState<'SI' | 'Imperial'>('SI');

    // TDH Calculator
    const [suctionPressure, setSuctionPressure] = useState(0);
    const [dischargePressure, setDischargePressure] = useState(0);
    const [suctionHead, setSuctionHead] = useState(0);
    const [dischargeHead, setDischargeHead] = useState(0);
    const [density, setDensity] = useState(1000);
    const [lineLosses, setLineLosses] = useState(0);

    // NPSH Calculator
    const [vesselPressure, setVesselPressure] = useState(0);
    const [liquidLevel, setLiquidLevel] = useState(0);
    const [vaporPressure, setVaporPressure] = useState(0);
    const [suctionLosses, setSuctionLosses] = useState(0);

    // Power Calculator
    const [flow, setFlow] = useState(100);
    const [tdh, setTdh] = useState(50);
    const [sg, setSg] = useState(1.0);
    const [efficiency, setEfficiency] = useState(0.75);

    // WHP & BHP Calculator (Imperial)
    const [whpFlow, setWhpFlow] = useState(500);
    const [whpInputType, setWhpInputType] = useState<'head' | 'pressure'>('head');
    const [whpInputValue, setWhpInputValue] = useState(100);
    const [whpSg, setWhpSg] = useState(1.0);
    const [whpEfficiency, setWhpEfficiency] = useState(0.7);

    // Pump Selection
    const [selectionFlow, setSelectionFlow] = useState(100);
    const [selectionHead, setSelectionHead] = useState(100);
    const [suitablePumps, setSuitablePumps] = useState<string[]>([]);
    const [selectedFluid, setSelectedFluid] = useState<string>('water_clean');

    const FLUID_TYPES = [
        { id: 'water_clean', label: 'Air Bersih (Clean Water)' },
        { id: 'water_sea', label: 'Air Laut (Seawater / Brine)' },
        { id: 'water_waste', label: 'Air Limbah (Wastewater / Sewage)' },
        { id: 'oil_crude', label: 'Minyak Mentah (Crude Oil)' },
        { id: 'oil_fuel', label: 'Bahan Bakar (Fuel / Refined Oil)' },
        { id: 'chemical_corrosive', label: 'Bahan Kimia Korosif' },
        { id: 'chemical_toxic', label: 'Bahan Kimia Berbahaya / Toxic' },
        { id: 'slurry', label: 'Slurry / Fluid Abrasif' },
        { id: 'lube_oil', label: 'Oli Pelumas (Lube Oil)' },
        { id: 'hot_water', label: 'Air Panas (Boiler Feedwater)' },
    ];
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

    // Results
    const g = 9.81; // m/s²

    const calculateTDH = () => {
        const pressureHead = ((dischargePressure - suctionPressure) * 1000) / (density * g);
        const staticHead = dischargeHead - suctionHead;
        const total = pressureHead + staticHead + lineLosses;
        return total;
    };

    const calculateNPSHa = () => {
        const atmPressure = 101.325; // kPa
        const pressureHead = ((atmPressure + vesselPressure - vaporPressure) * 1000) / (density * g);
        return pressureHead + liquidLevel - suctionLosses;
    };

    const calculatePower = () => {
        const hydraulicPower = (flow / 3600) * (tdh * sg * density * g) / 1000; // kW
        const brakePower = hydraulicPower / efficiency;
        return { hydraulicPower, brakePower };
    };

    const calculateWHPBHP = () => {
        let h = whpInputValue;
        if (whpInputType === 'pressure') {
            h = (2.31 * whpInputValue) / whpSg;
        }
        const whp = (h * whpFlow * whpSg) / 3960;
        const bhp = whp / whpEfficiency;
        return { h, whp, bhp };
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Kalkulator Cepat</h1>
                <p className="text-gray-600 mb-8">Kalkulasi cepat tanpa perlu membuat proyek baru</p>

                {/* Calculator Type Selector */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {[
                        { id: 'tdh', label: 'TDH Calculator' },
                        { id: 'npsh', label: 'NPSH Calculator' },
                        { id: 'power', label: 'Power Calculator' },
                        { id: 'whp_bhp', label: 'WHP & BHP' },
                        { id: 'selection', label: 'Pump Selection' },
                    ].map(calc => (
                        <button
                            key={calc.id}
                            onClick={() => setCalcType(calc.id)}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${calcType === calc.id
                                ? 'bg-re-blue text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {calc.label}
                        </button>
                    ))}
                </div>

                {/* Unit Selector */}
                <div className="mb-6">
                    <FormSelect
                        label="Sistem Satuan"
                        value={units}
                        onChange={(e) => setUnits(e.target.value as 'SI' | 'Imperial')}
                        options={[
                            { value: 'SI', label: 'SI (m, kPa, m³/h)' },
                            { value: 'Imperial', label: 'Imperial (ft, psi, GPM)' },
                        ]}
                    />
                </div>

                {/* TDH Calculator */}
                {calcType === 'tdh' && (
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Total Dynamic Head (TDH)</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <FormInput
                                label="Tekanan Suction (gauge)"
                                type="number"
                                value={suctionPressure}
                                onChange={(e) => setSuctionPressure(parseFloat(e.target.value) || 0)}
                                unit={units === 'SI' ? 'kPa(g)' : 'psig'}
                            />
                            <FormInput
                                label="Tekanan Discharge (gauge)"
                                type="number"
                                value={dischargePressure}
                                onChange={(e) => setDischargePressure(parseFloat(e.target.value) || 0)}
                                unit={units === 'SI' ? 'kPa(g)' : 'psig'}
                            />
                            <FormInput
                                label="Elevasi Suction"
                                type="number"
                                value={suctionHead}
                                onChange={(e) => setSuctionHead(parseFloat(e.target.value) || 0)}
                                unit={units === 'SI' ? 'm' : 'ft'}
                            />
                            <FormInput
                                label="Elevasi Discharge"
                                type="number"
                                value={dischargeHead}
                                onChange={(e) => setDischargeHead(parseFloat(e.target.value) || 0)}
                                unit={units === 'SI' ? 'm' : 'ft'}
                            />
                            <FormInput
                                label="Density Fluida"
                                type="number"
                                value={density}
                                onChange={(e) => setDensity(parseFloat(e.target.value) || 1000)}
                                unit={units === 'SI' ? 'kg/m³' : 'lb/ft³'}
                            />
                            <FormInput
                                label="Line Losses"
                                type="number"
                                value={lineLosses}
                                onChange={(e) => setLineLosses(parseFloat(e.target.value) || 0)}
                                unit={units === 'SI' ? 'm' : 'ft'}
                            />
                        </div>

                        <div className="p-4 bg-re-blue-light rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Dynamic Head</p>
                            <p className="text-3xl font-bold text-re-blue">
                                {calculateTDH().toFixed(2)} {units === 'SI' ? 'm' : 'ft'}
                            </p>
                        </div>
                    </div>
                )}

                {/* NPSH Calculator */}
                {calcType === 'npsh' && (
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">NPSH Available (NPSHa)</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <FormInput
                                label="Tekanan Vessel (gauge)"
                                type="number"
                                value={vesselPressure}
                                onChange={(e) => setVesselPressure(parseFloat(e.target.value) || 0)}
                                unit={units === 'SI' ? 'kPa(g)' : 'psig'}
                            />
                            <FormInput
                                label="Level Cairan (di atas CL pompa)"
                                type="number"
                                value={liquidLevel}
                                onChange={(e) => setLiquidLevel(parseFloat(e.target.value) || 0)}
                                unit={units === 'SI' ? 'm' : 'ft'}
                            />
                            <FormInput
                                label="Vapor Pressure"
                                type="number"
                                value={vaporPressure}
                                onChange={(e) => setVaporPressure(parseFloat(e.target.value) || 0)}
                                unit={units === 'SI' ? 'kPa(a)' : 'psia'}
                            />
                            <FormInput
                                label="Suction Line Losses"
                                type="number"
                                value={suctionLosses}
                                onChange={(e) => setSuctionLosses(parseFloat(e.target.value) || 0)}
                                unit={units === 'SI' ? 'm' : 'ft'}
                            />
                            <FormInput
                                label="Density Fluida"
                                type="number"
                                value={density}
                                onChange={(e) => setDensity(parseFloat(e.target.value) || 1000)}
                                unit={units === 'SI' ? 'kg/m³' : 'lb/ft³'}
                            />
                        </div>

                        <div className="p-4 bg-re-green-light rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">NPSHa</p>
                            <p className="text-3xl font-bold text-re-green">
                                {calculateNPSHa().toFixed(2)} {units === 'SI' ? 'm' : 'ft'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Power Calculator */}
                {calcType === 'power' && (
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hydraulic & Brake Power</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <FormInput
                                label="Flow"
                                type="number"
                                value={flow}
                                onChange={(e) => setFlow(parseFloat(e.target.value) || 0)}
                                unit={units === 'SI' ? 'm³/h' : 'GPM'}
                            />
                            <FormInput
                                label="TDH"
                                type="number"
                                value={tdh}
                                onChange={(e) => setTdh(parseFloat(e.target.value) || 0)}
                                unit={units === 'SI' ? 'm' : 'ft'}
                            />
                            <FormInput
                                label="Specific Gravity"
                                type="number"
                                step="0.01"
                                value={sg}
                                onChange={(e) => setSg(parseFloat(e.target.value) || 1)}
                            />
                            <FormInput
                                label="Efficiency (0-1)"
                                type="number"
                                step="0.01"
                                value={efficiency}
                                onChange={(e) => setEfficiency(parseFloat(e.target.value) || 0.75)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-re-blue-light rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Hydraulic Power</p>
                                <p className="text-3xl font-bold text-re-blue">
                                    {calculatePower().hydraulicPower.toFixed(2)} kW
                                </p>
                            </div>
                            <div className="p-4 bg-re-orange-light rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Brake Power</p>
                                <p className="text-3xl font-bold text-re-orange">
                                    {calculatePower().brakePower.toFixed(2)} kW
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* WHP & BHP Calculator (Imperial/Workflow) */}
                {calcType === 'whp_bhp' && (
                    <div className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">WHP & BHP Calculator</h2>
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">Imperial Units</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <FormInput
                                label="Flow (Q)"
                                type="number"
                                value={whpFlow}
                                onChange={(e) => setWhpFlow(parseFloat(e.target.value) || 0)}
                                unit="GPM"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                                    Input Type
                                    <span className="text-gray-400 font-normal">Pilih Head atau Tekanan</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setWhpInputType('head')}
                                        className={`py-2 px-3 text-sm rounded border transition-colors ${whpInputType === 'head'
                                            ? 'bg-re-blue border-re-blue text-white'
                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        Head (ft)
                                    </button>
                                    <button
                                        onClick={() => setWhpInputType('pressure')}
                                        className={`py-2 px-3 text-sm rounded border transition-colors ${whpInputType === 'pressure'
                                            ? 'bg-re-blue border-re-blue text-white'
                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        Pressure (psi)
                                    </button>
                                </div>
                            </div>
                            <FormInput
                                label={whpInputType === 'head' ? "Head (H)" : "Pressure (P)"}
                                type="number"
                                value={whpInputValue}
                                onChange={(e) => setWhpInputValue(parseFloat(e.target.value) || 0)}
                                unit={whpInputType === 'head' ? "ft" : "psi"}
                            />
                            <FormInput
                                label="Specific Gravity (sp.gr)"
                                type="number"
                                step="0.01"
                                value={whpSg}
                                onChange={(e) => setWhpSg(parseFloat(e.target.value) || 1)}
                            />
                            <div className="md:col-span-2">
                                <FormInput
                                    label="Efficiency (0.0 - 1.0)"
                                    type="number"
                                    step="0.01"
                                    value={whpEfficiency}
                                    onChange={(e) => setWhpEfficiency(parseFloat(e.target.value) || 0.7)}
                                />
                            </div>
                        </div>

                        {whpInputType === 'pressure' && (
                            <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm rounded border border-blue-100">
                                ℹ️ Head diperhitungkan dari tekanan: <strong>{calculateWHPBHP().h.toFixed(2)} ft</strong>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-re-blue-light rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Water Horsepower (WHP)</p>
                                <p className="text-3xl font-bold text-re-blue">
                                    {calculateWHPBHP().whp.toFixed(2)} hp
                                </p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                <p className="text-sm text-gray-600 mb-1">Brake Power (BHP)</p>
                                <p className="text-3xl font-bold text-orange-600">
                                    {calculateWHPBHP().bhp.toFixed(2)} hp
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pump Selection Tool */}
                {calcType === 'selection' && (
                    <div className="space-y-6">
                        <div className="card">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Pump Selection Tool</h2>
                                    <p className="text-sm text-gray-500">Peta pemilihan pompa berdasarkan Kapasitas & Head</p>
                                </div>
                                <button
                                    onClick={() => setSelectedRegionId(null)}
                                    className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors font-medium border border-gray-200"
                                >
                                    Reset Fokus
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <FormInput
                                    label="Capacity"
                                    type="number"
                                    value={selectionFlow}
                                    onChange={(e) => setSelectionFlow(parseFloat(e.target.value) || 0)}
                                    unit="GPM"
                                />
                                <FormInput
                                    label="Total Head"
                                    type="number"
                                    value={selectionHead}
                                    onChange={(e) => setSelectionHead(parseFloat(e.target.value) || 0)}
                                    unit="ft"
                                />
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Fluid Type
                                    </label>
                                    <select
                                        value={selectedFluid}
                                        onChange={(e) => setSelectedFluid(e.target.value)}
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-re-blue focus:border-re-blue transition-all outline-none font-medium text-gray-700"
                                    >
                                        {FLUID_TYPES.map(fluid => (
                                            <option key={fluid.id} value={fluid.id}>{fluid.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Compact Legend Bar */}
                            <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex flex-wrap gap-2">
                                    {PUMP_REGIONS.map((region) => {
                                        const isSuitable = suitablePumps.includes(region.label);
                                        const isSelected = selectedRegionId === region.id;

                                        return (
                                            <button
                                                key={region.id}
                                                onClick={() => setSelectedRegionId(isSelected ? null : region.id)}
                                                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${isSelected
                                                    ? 'bg-re-blue border-re-blue-dark text-white shadow-sm scale-105 z-10'
                                                    : isSuitable
                                                        ? 'bg-blue-50 border-re-blue text-re-blue animate-pulse'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div
                                                    className={`w-3 h-3 rounded-full border border-black/10`}
                                                    style={{ backgroundColor: region.color }}
                                                ></div>
                                                <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                                    {region.label.split(' - ').pop()}
                                                </span>
                                                {isSuitable && !isSelected && (
                                                    <span className="w-1.5 h-1.5 bg-re-blue rounded-full"></span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {suitablePumps.length > 0 && (
                                    <div className="mt-3 flex items-center gap-2 text-[10px] text-re-blue font-bold px-1">
                                        <div className="w-2 h-2 bg-re-blue rounded-full animate-ping"></div>
                                        <span>Ditemukan {suitablePumps.length} jenis pompa yang sesuai (berkedip)</span>
                                    </div>
                                )}
                            </div>

                            <PumpSelectionChart
                                capacity={selectionFlow}
                                head={selectionHead}
                                selectedRegionId={selectedRegionId}
                                onRegionSelect={setSelectedRegionId}
                                onSelectedPumpsChange={setSuitablePumps}
                            />

                            {/* Recommendation Section */}
                            {suitablePumps.length > 0 && (
                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-1 bg-re-blue rounded-full"></div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Rekomendasi Pemilihan Pompa
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {suitablePumps
                                            .map(label => PUMP_REGIONS.find(r => r.label === label)!)
                                            .sort((a, b) => {
                                                const scoreA = a.fluidSuitability[selectedFluid]?.score || 0;
                                                const scoreB = b.fluidSuitability[selectedFluid]?.score || 0;
                                                return scoreB - scoreA;
                                            })
                                            .map((region, idx) => {
                                                const isSelected = selectedRegionId === region.id;
                                                const fluidRating = region.fluidSuitability[selectedFluid];

                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col ${isSelected
                                                            ? 'bg-re-blue/5 border-re-blue ring-1 ring-re-blue shadow-lg translate-y-[-2px]'
                                                            : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
                                                            }`}
                                                        onClick={() => setSelectedRegionId(isSelected ? null : region.id)}
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className="w-4 h-4 rounded-full border border-black/5 shadow-sm"
                                                                    style={{ backgroundColor: region.color }}
                                                                ></div>
                                                                <span className="font-bold text-sm text-gray-900">{region.label}</span>
                                                            </div>
                                                            {fluidRating && (
                                                                <div className="flex items-center gap-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <div
                                                                            key={i}
                                                                            className={`w-1.5 h-1.5 rounded-full ${i < fluidRating.score ? 'bg-re-blue' : 'bg-gray-200'}`}
                                                                        ></div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2">
                                                            {region.description}
                                                        </p>

                                                        <div className="mt-auto space-y-2">
                                                            {fluidRating && (
                                                                <div className="bg-re-blue/5 p-3 rounded-xl border border-re-blue/10">
                                                                    <div className="flex items-center gap-1.5 mb-1">
                                                                        <span className="text-[10px] font-bold text-re-blue uppercase tracking-wider">Fluid Compatibility</span>
                                                                    </div>
                                                                    <p className="text-[11px] text-re-blue-dark leading-tight font-medium">
                                                                        {fluidRating.note}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                                <div className="flex items-center gap-1.5 mb-1">
                                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Engineering Note</span>
                                                                </div>
                                                                <p className="text-[10px] text-gray-700 leading-tight italic">
                                                                    "{region.reasoning}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                            {suitablePumps.length === 0 && selectionFlow > 0 && selectionHead > 0 && (
                                <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                                    <span className="text-2xl mb-2 block">⚠️</span>
                                    <p className="text-sm text-amber-900 font-bold mb-1">
                                        Kombinasi Kapasitas & Head Tidak Tercover
                                    </p>
                                    <p className="text-xs text-amber-700">
                                        Tidak ada tipe pompa standar dalam database kami yang mencakup titik operasional ini secara optimal.
                                        Pertimbangkan untuk membagi beban ke beberapa pompa atau berkonsultasi dengan vendor spesialis.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Info */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
                    <strong>💡 Tip:</strong> Kalkulator ini untuk estimasi cepat saja. Untuk proyek formal dengan dokumentasi lengkap, gunakan wizard "Mulai Proyek Baru".
                </div>

                <div className="mt-8">
                    <Button href="/pumpcalc" variant="secondary">
                        ← Kembali ke Beranda
                    </Button>
                </div>
            </main>
        </div>
    );
}
