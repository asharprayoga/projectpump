'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';
import { FormInput, FormSelect, FormRadioGroup, FormCheckbox } from '@/components/ui/FormInputs';
import { createNewProject, saveProject } from '@/lib/storage';
import { UnitSystem, PumpStandard, SelectionMode } from '@/types';

export default function NewProjectPage() {
    const router = useRouter();

    // Form state
    const [projectName, setProjectName] = useState('');
    const [tagNo, setTagNo] = useState('');
    const [client, setClient] = useState('');
    const [unitArea, setUnitArea] = useState('');
    const [notes, setNotes] = useState('');
    const [createdBy, setCreatedBy] = useState('');
    const [units, setUnits] = useState<UnitSystem>('SI');

    // Selection mode
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('assisted');
    const [manualStandard, setManualStandard] = useState<PumpStandard>('API610');

    // Add-ons
    const [api682, setApi682] = useState(false);
    const [api614, setApi614] = useState(false);
    const [api670, setApi670] = useState(false);

    // Validation
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!projectName.trim()) newErrors.projectName = 'Nama proyek wajib diisi';
        if (!tagNo.trim()) newErrors.tagNo = 'Nomor tag wajib diisi';
        if (!createdBy.trim()) newErrors.createdBy = 'Dibuat oleh wajib diisi';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const project = createNewProject(
            projectName,
            tagNo,
            client,
            unitArea,
            createdBy,
            units,
            selectionMode === 'manual' ? manualStandard : 'API610', // Default, will be set by recommendation
            'ProcessSizing',
            { api682, api614, api670 },
            selectionMode,
            notes
        );

        saveProject(project);
        router.push(`/pumpcalc/project/${project.id}?step=1`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <a href="/pumpcalc" className="hover:text-re-blue">PumpCalc</a>
                    <span>/</span>
                    <span className="text-gray-900">Proyek Baru</span>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Step 0: Inisiasi Proyek</h1>
                    <p className="text-gray-600">Tentukan metadata proyek, unit, dan mode pemilihan standar pompa</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Section A: Project Metadata */}
                    <div className="card mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">A. Metadata Proyek</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Nama Proyek *"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="cth: Spesifikasi Feed Water Pump"
                                error={errors.projectName}
                            />

                            <FormInput
                                label="Nomor Tag *"
                                value={tagNo}
                                onChange={(e) => setTagNo(e.target.value)}
                                placeholder="cth: P-101A/B"
                                error={errors.tagNo}
                            />

                            <FormInput
                                label="Klien"
                                value={client}
                                onChange={(e) => setClient(e.target.value)}
                                placeholder="cth: PT XYZ"
                            />

                            <FormInput
                                label="Unit / Area"
                                value={unitArea}
                                onChange={(e) => setUnitArea(e.target.value)}
                                placeholder="cth: Unit 100 - Boiler"
                            />

                            <FormInput
                                label="Dibuat Oleh *"
                                value={createdBy}
                                onChange={(e) => setCreatedBy(e.target.value)}
                                placeholder="Nama Anda"
                                error={errors.createdBy}
                            />

                            <FormSelect
                                label="Sistem Unit"
                                value={units}
                                onChange={(e) => setUnits(e.target.value as UnitSystem)}
                                options={[
                                    { value: 'SI', label: 'SI (metrik)' },
                                    { value: 'US', label: 'US (imperial)' },
                                ]}
                            />
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Catatan tambahan..."
                                className="input-field w-full h-20 resize-none"
                            />
                        </div>
                    </div>

                    {/* Section B: Selection Mode */}
                    <div className="card mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">B. Metode Pemilihan Standar</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Pilih bagaimana standar pompa akan ditentukan untuk proyek ini.
                        </p>

                        <div className="space-y-4">
                            <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="selectionMode"
                                    value="assisted"
                                    checked={selectionMode === 'assisted'}
                                    onChange={() => setSelectionMode('assisted')}
                                    className="mt-1"
                                />
                                <div>
                                    <div className="font-medium text-gray-900 flex items-center gap-2">
                                        Assisted Selection
                                        <span className="px-2 py-0.5 bg-re-green-light text-re-green text-xs font-medium rounded">
                                            Direkomendasikan
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Sistem akan merekomendasikan tipe pompa dan standar API berdasarkan input servis Anda.
                                        Anda dapat menerima atau override rekomendasi.
                                    </p>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="selectionMode"
                                    value="manual"
                                    checked={selectionMode === 'manual'}
                                    onChange={() => setSelectionMode('manual')}
                                    className="mt-1"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">Manual Selection</div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Pilih standar API secara langsung tanpa rekomendasi sistem.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Section C: Manual Standard Selector (Conditional) */}
                    {selectionMode === 'manual' && (
                        <div className="card mb-6 border-re-yellow/30 bg-re-yellow-light/20">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">C. Pilih Standar API</h2>
                            <p className="text-sm text-gray-500 mb-4">
                                Pilih standar pompa yang akan digunakan untuk proyek ini.
                            </p>

                            <FormRadioGroup
                                label=""
                                name="manualStandard"
                                value={manualStandard}
                                onChange={(val) => setManualStandard(val as PumpStandard)}
                                options={[
                                    {
                                        value: 'API610',
                                        label: 'API 610',
                                        description: 'Centrifugal pumps untuk petroleum, petrochemical & natural gas industries'
                                    },
                                    {
                                        value: 'API674',
                                        label: 'API 674',
                                        description: 'Positive displacement pumps — reciprocating (piston/plunger)'
                                    },
                                    {
                                        value: 'API675',
                                        label: 'API 675',
                                        description: 'Positive displacement pumps — controlled volume metering'
                                    },
                                    {
                                        value: 'API676',
                                        label: 'API 676',
                                        description: 'Positive displacement pumps — rotary (gear, screw, lobe, vane)'
                                    },
                                ]}
                            />
                        </div>
                    )}

                    {/* Section D: Add-on Modules */}
                    <div className="card mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">D. Modul Tambahan (Opsional)</h2>
                        <p className="text-sm text-gray-500 mb-4">Aktifkan modul tambahan sesuai kebutuhan</p>

                        <div className="space-y-3">
                            <FormCheckbox
                                label="API 682 — Mechanical seal & seal plan"
                                checked={api682}
                                onChange={(e) => setApi682(e.target.checked)}
                            />
                            <FormCheckbox
                                label="API 614 — Lube/seal oil system"
                                checked={api614}
                                onChange={(e) => setApi614(e.target.checked)}
                            />
                            <FormCheckbox
                                label="API 670 — Machinery protection"
                                checked={api670}
                                onChange={(e) => setApi670(e.target.checked)}
                            />
                        </div>
                    </div>

                    {/* Info Box */}
                    {selectionMode === 'assisted' && (
                        <div className="p-4 bg-re-blue-light rounded-lg text-sm text-gray-700 mb-6">
                            <strong>ℹ️ Mode Assisted:</strong> Pada Step 1, Anda akan memasukkan data servis dan sistem akan
                            merekomendasikan standar pompa beserta alasan. Anda dapat menerima atau override rekomendasi tersebut.
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.push('/pumpcalc')}
                        >
                            Batal
                        </Button>

                        <Button type="submit" variant="primary">
                            Buat Proyek & Lanjutkan
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}
