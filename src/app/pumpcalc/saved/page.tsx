'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';
import { listProjects, deleteProject, duplicateProject } from '@/lib/storage';
import { Project } from '@/types';

export default function SavedProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setProjects(listProjects());
        setLoading(false);
    }, []);

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Hapus proyek "${name}"? Tindakan ini tidak bisa dibatalkan.`)) {
            deleteProject(id);
            setProjects(listProjects());
        }
    };

    const handleDuplicate = (id: string) => {
        const duplicate = duplicateProject(id);
        if (duplicate) {
            setProjects(listProjects());
        }
    };

    const handleOpen = (id: string) => {
        router.push(`/pumpcalc/project/${id}?step=1`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <a href="/pumpcalc" className="hover:text-re-blue">PumpCalc</a>
                    <span>/</span>
                    <span className="text-gray-900">Proyek Tersimpan</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Proyek Tersimpan</h1>
                        <p className="text-gray-600">Kelola proyek kalkulasi pompa Anda</p>
                    </div>

                    <Button href="/pumpcalc/new" variant="primary">
                        + Proyek Baru
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Memuat proyek...</div>
                ) : projects.length === 0 ? (
                    <div className="card text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada proyek</h3>
                        <p className="text-gray-600 mb-6">Buat proyek kalkulasi pompa pertama Anda untuk memulai</p>
                        <Button href="/pumpcalc/new" variant="primary">
                            Mulai Proyek Baru
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {projects.map((project) => (
                            <div key={project.id} className="card hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {project.metadata.projectName}
                                            </h3>
                                            <span className="px-2 py-0.5 bg-re-blue-light text-re-blue text-xs font-medium rounded">
                                                {project.pumpStandard}
                                            </span>
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                                                {project.units}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                            <span>{project.metadata.tagNo}</span>
                                            {project.metadata.client && (
                                                <>
                                                    <span>•</span>
                                                    <span>{project.metadata.client}</span>
                                                </>
                                            )}
                                            <span>•</span>
                                            <span>{project.cases.length} kasus operasi</span>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>Dibuat: {new Date(project.metadata.createdDate).toLocaleDateString('id-ID')}</span>
                                            <span>Diubah: {new Date(project.metadata.modifiedDate).toLocaleDateString('id-ID')}</span>
                                            <span>Oleh: {project.metadata.createdBy}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => handleOpen(project.id)}
                                            className="px-4 py-2 bg-re-blue text-white text-sm font-medium rounded-lg hover:bg-re-blue-dark transition-colors"
                                        >
                                            Buka
                                        </button>
                                        <button
                                            onClick={() => handleDuplicate(project.id)}
                                            className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                            title="Duplikat"
                                        >
                                            📋
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project.id, project.metadata.projectName)}
                                            className="px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                                            title="Hapus"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                        <span>Progress</span>
                                        <span>{project.completedSteps.length} / 12 step selesai</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-re-green transition-all duration-300"
                                            style={{ width: `${(project.completedSteps.length / 12) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
