'use client';

import { useState } from 'react';
import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';
import { FormInput, FormSelect } from '@/components/ui/FormInputs';

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
    const [efficiency, setEfficiency] = useState(0.75);
    const [sg, setSg] = useState(1.0);

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
