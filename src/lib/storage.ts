// ============================================================================
// Local Storage Utilities for PumpCalc Projects
// ============================================================================

import { Project, OperatingCase, UnitSystem, PumpStandard, SelectionMode } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'pumpcalc_projects';

// ============================================================================
// Project CRUD Operations
// ============================================================================

export function listProjects(): Project[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
        return JSON.parse(stored) as Project[];
    } catch {
        return [];
    }
}

export function getProject(id: string): Project | null {
    const projects = listProjects();
    return projects.find(p => p.id === id) || null;
}

export function saveProject(project: Project): void {
    const projects = listProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);

    const updatedProject: Project = {
        ...project,
        metadata: {
            ...project.metadata,
            modifiedDate: new Date().toISOString(),
        },
    };

    if (existingIndex >= 0) {
        projects[existingIndex] = updatedProject;
    } else {
        projects.push(updatedProject);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function deleteProject(id: string): void {
    const projects = listProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function duplicateProject(id: string): Project | null {
    const original = getProject(id);
    if (!original) return null;

    const duplicate: Project = {
        ...original,
        id: uuidv4(),
        metadata: {
            ...original.metadata,
            projectName: `${original.metadata.projectName} (Copy)`,
            createdDate: new Date().toISOString(),
            modifiedDate: new Date().toISOString(),
            revision: 0,
        },
        // Reset recommendation state on duplicate
        recommendationState: 'not_generated',
        recommendationSnapshot: undefined,
        overrideReason: undefined,
        previousRecommendation: undefined,
    };

    saveProject(duplicate);
    return duplicate;
}

// ============================================================================
// Default Operating Cases
// ============================================================================

export function createDefaultCases(units: UnitSystem): OperatingCase[] {
    const baseFluid = {
        fluidName: '',
        temperature: units === 'SI' ? 25 : 77,
        density: units === 'SI' ? 1000 : 62.4,
        specificGravity: 1.0,
        viscosity: 1.0,
        vaporPressure: units === 'SI' ? 3.17 : 0.46,
        isCorrosive: false,
        isToxic: false,
        isFlammable: false,
        shearSensitive: false,
    };

    const baseSuction = {
        sourceType: 'Vessel' as const,
        vesselPressure: 0,
        liquidLevel: units === 'SI' ? 5 : 16,
        elevation: 0,
        lineLosses: units === 'SI' ? 10 : 1.5,
        lineLossMethod: 'Direct' as const,
    };

    const baseDischarge = {
        destinationType: 'Vessel' as const,
        requiredPressure: units === 'SI' ? 500 : 72,
        elevation: units === 'SI' ? 30 : 100,
        lineLosses: units === 'SI' ? 30 : 4.5,
        lineLossMethod: 'Direct' as const,
    };

    return [
        {
            id: uuidv4(),
            name: 'Minimum',
            isDefault: true,
            requiredFlow: units === 'SI' ? 50 : 220,
            fluid: { ...baseFluid },
            suction: { ...baseSuction },
            discharge: { ...baseDischarge },
            foulingAllowance: 0,
            uncertaintyAllowance: 0,
        },
        {
            id: uuidv4(),
            name: 'Normal',
            isDefault: true,
            requiredFlow: units === 'SI' ? 100 : 440,
            fluid: { ...baseFluid },
            suction: { ...baseSuction },
            discharge: { ...baseDischarge },
            foulingAllowance: 5,
            uncertaintyAllowance: 5,
        },
        {
            id: uuidv4(),
            name: 'Maximum',
            isDefault: true,
            requiredFlow: units === 'SI' ? 120 : 530,
            fluid: { ...baseFluid },
            suction: { ...baseSuction },
            discharge: { ...baseDischarge },
            foulingAllowance: 10,
            uncertaintyAllowance: 10,
        },
    ];
}

// ============================================================================
// New Project Creation
// ============================================================================

export function createNewProject(
    projectName: string,
    tagNo: string,
    client: string,
    unitArea: string,
    createdBy: string,
    units: UnitSystem,
    pumpStandard: PumpStandard,
    workflowMode: 'ProcessSizing' | 'VendorVerification',
    addOns: { api682: boolean; api614: boolean; api670: boolean },
    selectionMode: SelectionMode = 'assisted',
    notes?: string
): Project {
    const now = new Date().toISOString();

    return {
        id: uuidv4(),
        metadata: {
            projectName,
            tagNo,
            client,
            unitArea,
            notes,
            createdBy,
            createdDate: now,
            modifiedDate: now,
            revision: 0,
        },
        units,
        addOns,
        workflowMode,

        // === Selection Mode (Rules Engine) ===
        selectionMode,
        selectedStandard: selectionMode === 'manual' ? pumpStandard : 'UNSET',
        selectionSource: selectionMode === 'manual' ? 'manual' : 'UNSET',
        recommendationState: 'not_generated',

        // Legacy field (for compatibility)
        pumpStandard,

        // Data
        cases: createDefaultCases(units),
        results: [],
        currentStep: 0,
        completedSteps: [],
    };
}

// ============================================================================
// Recommendation State Management
// ============================================================================

/**
 * Mark recommendation as outdated when input changes after generation
 */
export function markRecommendationOutdated(project: Project): Project {
    if (project.recommendationState === 'generated' || project.recommendationState === 'accepted') {
        return {
            ...project,
            recommendationState: 'outdated',
        };
    }
    return project;
}
