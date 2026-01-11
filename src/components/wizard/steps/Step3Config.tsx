'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { FormSelect, FormInput, FormRadioGroup, FormCheckbox } from '@/components/ui/FormInputs';
import { Project, PumpConfiguration, API610Config, DriverType, SpeedPreference, InstallationType } from '@/types';

interface Step3Props {
    project: Project;
    updateProject: (updates: Partial<Project>) => void;
    goToStep: (step: number) => void;
    markStepComplete: (step: number) => void;
}

// API 610 Configuration descriptions
const API610_CONFIGS: { value: API610Config; label: string; description: string }[] = [
    { value: 'OH1', label: 'OH1', description: 'Foot-mounted, flexibly coupled, single stage overhung' },
    { value: 'OH2', label: 'OH2', description: 'Centerline-mounted, flexibly coupled, single stage overhung' },
    { value: 'OH3', label: 'OH3', description: 'Vertical in-line, flexibly coupled, single stage overhung' },
    { value: 'OH4', label: 'OH4', description: 'Rigidly coupled, vertical in-line' },
    { value: 'OH5', label: 'OH5', description: 'Close-coupled, vertical in-line' },
    { value: 'OH6', label: 'OH6', description: 'High-speed integrally geared' },
    { value: 'BB1', label: 'BB1', description: 'Axially split, single/two stage between bearings' },
    { value: 'BB2', label: 'BB2', description: 'Radially split, single/two stage between bearings' },
    { value: 'BB3', label: 'BB3', description: 'Axially split, multi-stage between bearings' },
    { value: 'BB4', label: 'BB4', description: 'Radially split, single casing, multi-stage between bearings' },
    { value: 'BB5', label: 'BB5', description: 'Radially split, double casing, multi-stage between bearings' },
    { value: 'VS1', label: 'VS1', description: 'Vertically suspended, single casing, diffuser' },
    { value: 'VS2', label: 'VS2', description: 'Vertically suspended, single casing, volute' },
    { value: 'VS3', label: 'VS3', description: 'Vertically suspended, double casing, diffuser' },
    { value: 'VS4', label: 'VS4', description: 'Vertically suspended, line shaft' },
    { value: 'VS5', label: 'VS5', description: 'Vertically suspended, cantilever' },
    { value: 'VS6', label: 'VS6', description: 'Vertically suspended, double casing, volute' },
    { value: 'VS7', label: 'VS7', description: 'Vertically suspended, axial flow' },
];

export default function Step3Config({ project, updateProject, goToStep, markStepComplete }: Step3Props) {
    const selectedStandard = project.selectedStandard !== 'UNSET' ? project.selectedStandard : project.pumpStandard;
    const isAPI610 = selectedStandard === 'API610';

    const [config, setConfig] = useState<Partial<PumpConfiguration>>(project.pumpConfig || {
        pumpFamily: isAPI610 ? 'Centrifugal' :
            selectedStandard === 'API674' ? 'Reciprocating' :
                selectedStandard === 'API675' ? 'Metering' : 'Rotary',
        orientation: 'Horizontal',
        stages: 1,
        speedPreference: '50Hz',
        driverType: 'Motor',
        installation: 'Outdoor',
    });

    const updateConfig = (updates: Partial<PumpConfiguration>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    };

    const handleSave = () => {
        updateProject({ pumpConfig: config as PumpConfiguration });
        markStepComplete(3);
    };

    const handleNext = () => {
        handleSave();
        goToStep(4);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Step 3: Pump Type & Configuration</h1>
            <p className="text-gray-600 mb-4">
                Tentukan konfigurasi pompa berdasarkan standar yang dipilih: {selectedStandard?.replace('API', 'API ')}
            </p>

            {/* Helper Notes */}
            <div className="p-4 bg-re-blue-light rounded-lg text-sm text-gray-700 mb-6 border border-re-blue/20">
                <p className="font-medium text-re-blue mb-2">📝 Panduan Pemilihan:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li><strong>OH (Overhung):</strong> Cocok untuk aplikasi umum, mudah maintenance</li>
                    <li><strong>BB (Between Bearings):</strong> Untuk head tinggi atau multi-stage</li>
                    <li><strong>VS (Vertical Suspended):</strong> Untuk sump, well, atau ruang terbatas</li>
                    <li><strong>Jumlah Stage:</strong> Tambah stage untuk mencapai head lebih tinggi</li>
                </ul>
            </div>

            {/* Selected Standard Info */}
            <div className="card bg-re-blue-light border-re-blue/20 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-re-blue rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                            {selectedStandard?.replace('API', '')}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {selectedStandard?.replace('API', 'API ')}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {isAPI610 ? 'Centrifugal pumps untuk petroleum, petrochemical & natural gas' :
                                selectedStandard === 'API674' ? 'Positive displacement pumps — reciprocating' :
                                    selectedStandard === 'API675' ? 'Positive displacement pumps — controlled volume metering' :
                                        'Positive displacement pumps — rotary'}
                        </p>
                    </div>
                </div>
            </div>

            {/* API 610 Configuration (only for centrifugal) */}
            {isAPI610 && (
                <div className="card mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Konfigurasi API 610</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Pilih tipe konfigurasi pompa sesuai API 610
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {API610_CONFIGS.map((cfg) => (
                            <label
                                key={cfg.value}
                                className={`
                  flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                  ${config.api610Config === cfg.value
                                        ? 'border-re-blue bg-re-blue-light'
                                        : 'border-gray-200 hover:bg-gray-50'}
                `}
                            >
                                <input
                                    type="radio"
                                    name="api610Config"
                                    value={cfg.value}
                                    checked={config.api610Config === cfg.value}
                                    onChange={() => updateConfig({ api610Config: cfg.value })}
                                    className="mt-1"
                                />
                                <div>
                                    <p className="font-medium text-gray-900">{cfg.label}</p>
                                    <p className="text-xs text-gray-600">{cfg.description}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* General Configuration */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Konfigurasi Umum</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormSelect
                        label="Orientasi"
                        value={config.orientation || 'Horizontal'}
                        onChange={(e) => updateConfig({ orientation: e.target.value as 'Horizontal' | 'Vertical' })}
                        options={[
                            { value: 'Horizontal', label: 'Horizontal' },
                            { value: 'Vertical', label: 'Vertical' },
                        ]}
                    />

                    <FormInput
                        label="Jumlah Stage"
                        type="number"
                        min={1}
                        max={20}
                        value={config.stages || 1}
                        onChange={(e) => updateConfig({ stages: parseInt(e.target.value) || 1 })}
                    />

                    <FormSelect
                        label="Preferensi Speed"
                        value={config.speedPreference || '50Hz'}
                        onChange={(e) => updateConfig({ speedPreference: e.target.value as SpeedPreference })}
                        options={[
                            { value: '50Hz', label: '50 Hz (2960/1480 RPM)' },
                            { value: '60Hz', label: '60 Hz (3550/1775 RPM)' },
                        ]}
                    />
                </div>
            </div>

            {/* Driver Configuration */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Konfigurasi Driver</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormRadioGroup
                        label="Tipe Driver"
                        name="driverType"
                        value={config.driverType || 'Motor'}
                        onChange={(val) => updateConfig({ driverType: val as DriverType })}
                        options={[
                            { value: 'Motor', label: 'Motor Elektrik', description: 'Driver standar untuk kebanyakan aplikasi' },
                            { value: 'VFD', label: 'Motor + VFD', description: 'Variable frequency drive untuk kontrol kecepatan' },
                            { value: 'Turbine', label: 'Steam Turbine', description: 'Untuk aplikasi steam-driven' },
                            { value: 'Engine', label: 'Engine', description: 'Diesel/gas engine driver' },
                        ]}
                    />

                    <FormRadioGroup
                        label="Instalasi"
                        name="installation"
                        value={config.installation || 'Outdoor'}
                        onChange={(val) => updateConfig({ installation: val as InstallationType })}
                        options={[
                            { value: 'Outdoor', label: 'Outdoor', description: 'Instalasi luar ruangan' },
                            { value: 'Indoor', label: 'Indoor', description: 'Instalasi dalam ruangan/gedung' },
                        ]}
                    />
                </div>

                <div className="mt-4">
                    <FormInput
                        label="Area Classification (jika ada)"
                        value={config.areaClassification || ''}
                        onChange={(e) => updateConfig({ areaClassification: e.target.value })}
                        placeholder="cth: Zone 1, Class I Div 2"
                    />
                </div>
            </div>

            {/* Configuration Summary */}
            <div className="card bg-gray-50 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Konfigurasi</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Standar</p>
                        <p className="font-semibold text-gray-900">{selectedStandard?.replace('API', 'API ')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Konfigurasi</p>
                        <p className="font-semibold text-gray-900">
                            {isAPI610 && config.api610Config ? config.api610Config : config.pumpFamily || '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Orientasi</p>
                        <p className="font-semibold text-gray-900">{config.orientation}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Stages</p>
                        <p className="font-semibold text-gray-900">{config.stages}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Driver</p>
                        <p className="font-semibold text-gray-900">{config.driverType}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Speed</p>
                        <p className="font-semibold text-gray-900">{config.speedPreference}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Instalasi</p>
                        <p className="font-semibold text-gray-900">{config.installation}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Area Class.</p>
                        <p className="font-semibold text-gray-900">{config.areaClassification || '-'}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
                <Button variant="secondary" onClick={() => goToStep(2)}>
                    ← Kembali ke Step 2
                </Button>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSave}>
                        Simpan
                    </Button>
                    <Button variant="primary" onClick={handleNext}>
                        Lanjut: Preliminary Sizing →
                    </Button>
                </div>
            </div>
        </div>
    );
}
