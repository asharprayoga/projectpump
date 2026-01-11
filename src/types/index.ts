// ============================================================================
// PumpCalc - Core Type Definitions
// ============================================================================

// Unit system
export type UnitSystem = 'SI' | 'US';

// Pump standards
export type PumpStandard = 'API610' | 'API674' | 'API675' | 'API676';

// Pump types (for rules engine)
export type PumpType = 'centrifugal' | 'pd_reciprocating' | 'pd_rotary' | 'metering';

// Selection modes
export type SelectionMode = 'assisted' | 'manual';
export type SelectionSource = 'assisted' | 'manual' | 'override';

// Confidence levels
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// Workflow modes
export type WorkflowMode = 'ProcessSizing' | 'VendorVerification';

// Check status
export type CheckStatus = 'OK' | 'Review' | 'NOT_OK';

// Recommendation state
export type RecommendationState = 'not_generated' | 'generated' | 'accepted' | 'overridden' | 'outdated';

// API 610 Configuration types
export type API610Config = 'OH1' | 'OH2' | 'OH3' | 'OH4' | 'OH5' | 'OH6' |
    'BB1' | 'BB2' | 'BB3' | 'BB4' | 'BB5' |
    'VS1' | 'VS2' | 'VS3' | 'VS4' | 'VS5' | 'VS6' | 'VS7';

export type DriverType = 'Motor' | 'Turbine' | 'Engine' | 'VFD';

export type SpeedPreference = '50Hz' | '60Hz';

export type InstallationType = 'Indoor' | 'Outdoor';

// ============================================================================
// Rules Engine Types
// ============================================================================

export interface Alternative {
    standard: PumpStandard;
    pumpType: PumpType;
    score: number;
    note: string;
}

export interface RecommendationResult {
    recommendedStandard: PumpStandard;
    recommendedPumpType: PumpType;
    confidence: ConfidenceLevel;
    reasons: string[];           // Human-readable reasons
    reasonCodes: string[];       // Traceable codes for audit
    alternatives: Alternative[];
    warnings: string[];
    scores: {                    // For explainability
        API610: number;
        API674: number;
        API675: number;
        API676: number;
    };
    criteriaVersion: string;     // Version of CompanyCriteria used
    generatedAt: string;         // ISO timestamp
}

export interface ServiceInput {
    // Metering/dosing
    requiresAccurateMetering: boolean;
    meteringAccuracyRequired?: string;    // e.g., "±1%"

    // Flow and pressure
    normalFlow: number;                    // m³/h or GPM
    differentialPressure: number;          // kPa or psi

    // Fluid characteristics
    viscosity: number | 'unknown';         // cP or 'unknown'
    shearSensitive: boolean;
    solidsPresent: boolean;
    solidsPct?: number;

    // Control requirements
    requiresConstantFlow: boolean;
    downstreamPressureVariabilityHigh: boolean;
    pulsationAcceptable: boolean;

    // Operation mode
    operationMode: 'continuous' | 'intermittent';
}

// ============================================================================
// Operating Case
// ============================================================================

export interface FluidProperties {
    fluidName: string;
    temperature: number;          // °C or °F
    density: number;              // kg/m³ or lb/ft³
    specificGravity: number;
    viscosity: number;            // cP
    vaporPressure: number;        // kPa or psi
    solidsPct?: number;           // optional solids content %
    isCorrosive: boolean;
    isToxic: boolean;
    isFlammable: boolean;
    shearSensitive?: boolean;
}

export interface SuctionConditions {
    sourceType: 'Vessel' | 'Tank' | 'Sump' | 'Other';
    vesselPressure: number;       // kPa or psi (gauge)
    liquidLevel: number;          // m or ft (above pump centerline)
    elevation: number;            // m or ft
    lineLosses: number;           // kPa or psi (or calculated)
    lineLossMethod: 'Direct' | 'Calculated';
    // For calculated method
    pipeLength?: number;
    pipeDiameter?: number;
    fittingsCount?: number;
}

export interface DischargeConditions {
    destinationType: 'Vessel' | 'Header' | 'Elevation' | 'Other';
    requiredPressure: number;     // kPa or psi (gauge)
    elevation: number;            // m or ft
    lineLosses: number;           // kPa or psi
    lineLossMethod: 'Direct' | 'Calculated';
    controlValveDP?: number;      // minimum control valve ΔP
}

export interface OperatingCase {
    id: string;
    name: string;                 // 'Minimum' | 'Normal' | 'Maximum' | custom
    isDefault: boolean;           // min/normal/max are default cases

    // Process requirements
    requiredFlow: number;         // m³/h or GPM

    // Fluid
    fluid: FluidProperties;

    // System
    suction: SuctionConditions;
    discharge: DischargeConditions;

    // Allowances
    foulingAllowance: number;     // % or absolute
    uncertaintyAllowance: number; // %
}

// ============================================================================
// Computed Results
// ============================================================================

export interface CalculationResult {
    value: number;
    unit: string;
    basis: string;                // Calculation basis/formula reference
    assumptions: string[];        // List of assumptions made
    status: CheckStatus;
    reasoning: string;            // Traceable explanation
}

export interface TDHResult extends CalculationResult {
    breakdown: {
        staticHead: number;
        frictionLosses: number;
        controlValveDP: number;
        allowances: number;
    };
}

export interface NPSHResult {
    npshaCalculated: CalculationResult;
    npshrVendor: number | null;   // null if not entered
    margin: CalculationResult;
    status: CheckStatus;
    isGoverning: boolean;
}

export interface PowerResult {
    hydraulicPower: CalculationResult;
    brakePower: CalculationResult;
    motorSizing: CalculationResult;
    minimumFlowWarning: boolean;
    isGoverning: boolean;
}

export interface CaseResults {
    caseId: string;
    tdh: TDHResult;
    npsh: NPSHResult;
    power: PowerResult;
}

export interface GoverningCases {
    npsh: string;                 // case ID with governing NPSH
    power: string;                // case ID with governing power
    tdh: string;                  // case ID with governing TDH
}

// ============================================================================
// Vendor Data (for verification mode)
// ============================================================================

export interface VendorCurvePoint {
    flow: number;
    value: number;                // head, NPSH, efficiency, or power
}

export interface VendorData {
    pumpModel?: string;
    manufacturer?: string;
    impellerDiameter?: number;
    speed?: number;

    // Curve data (Q vs value)
    headCurve: VendorCurvePoint[];
    npshCurve: VendorCurvePoint[];
    efficiencyCurve: VendorCurvePoint[];
    powerCurve: VendorCurvePoint[];

    // Single point data (if curves not available)
    ratedFlow?: number;
    ratedHead?: number;
    ratedEfficiency?: number;
    ratedNPSHr?: number;
    ratedPower?: number;
}

// ============================================================================
// Pump Configuration
// ============================================================================

export interface PumpConfiguration {
    pumpFamily: 'Centrifugal' | 'Reciprocating' | 'Rotary' | 'Metering';
    api610Config?: API610Config;
    orientation: 'Horizontal' | 'Vertical';
    stages: number;
    speedPreference: SpeedPreference;
    driverType: DriverType;
    installation: InstallationType;
    areaClassification?: string;
}

// ============================================================================
// Project
// ============================================================================

export interface ProjectMetadata {
    projectName: string;
    tagNo: string;
    client: string;
    unitArea: string;
    notes?: string;
    createdBy: string;
    createdDate: string;
    modifiedDate: string;
    revision: number;
}

export interface AddOnModules {
    api682: boolean;              // Mechanical seal
    api614: boolean;              // Lube/seal oil system
    api670: boolean;              // Machinery protection
}

export interface Project {
    id: string;
    metadata: ProjectMetadata;
    units: UnitSystem;
    addOns: AddOnModules;
    workflowMode: WorkflowMode;

    // === Selection Mode (Rules Engine) ===
    selectionMode: SelectionMode;
    selectedStandard: PumpStandard | 'UNSET';
    selectionSource: SelectionSource | 'UNSET';

    // Recommendation (if assisted mode)
    recommendationState: RecommendationState;
    recommendationSnapshot?: RecommendationResult;

    // Override (if user overrides)
    overrideReason?: string;
    previousRecommendation?: RecommendationResult;

    // Service input for rules engine
    serviceInput?: ServiceInput;

    // Legacy field (for compatibility)
    pumpStandard: PumpStandard;

    // Data
    cases: OperatingCase[];
    pumpConfig?: PumpConfiguration;
    vendorData?: VendorData;

    // Results
    results: CaseResults[];
    governingCases?: GoverningCases;

    // Current step (for wizard state)
    currentStep: number;
    completedSteps: number[];
}

// ============================================================================
// Wizard Step Definition
// ============================================================================

export interface WizardStep {
    id: number;
    name: string;
    shortName: string;
    description: string;
    status: 'Available' | 'In progress' | 'Planned';
    isRequired: boolean;
}

export const WIZARD_STEPS: WizardStep[] = [
    { id: 0, name: 'Inisiasi Proyek', shortName: 'Inisiasi', description: 'Metadata, standar, mode', status: 'Available', isRequired: true },
    { id: 1, name: 'Data Servis / Proses', shortName: 'Servis', description: 'Fluida + kasus min/normal/max', status: 'Available', isRequired: true },
    { id: 2, name: 'System Hydraulics', shortName: 'Hydraulics', description: 'Kalkulasi TDH per kasus', status: 'Available', isRequired: true },
    { id: 3, name: 'Pump Type & Configuration', shortName: 'Config', description: 'API mapping, driver', status: 'Available', isRequired: true },
    { id: 4, name: 'Preliminary Sizing', shortName: 'Sizing', description: 'Panduan seleksi', status: 'Available', isRequired: false },
    { id: 5, name: 'NPSH Verification', shortName: 'NPSH', description: 'NPSHa vs NPSHr check', status: 'Available', isRequired: true },
    { id: 6, name: 'Power & Driver Sizing', shortName: 'Power', description: 'Motor sizing, min flow', status: 'Available', isRequired: true },
    { id: 7, name: 'API 610 Compliance', shortName: 'Compliance', description: 'Requirement matrix', status: 'Available', isRequired: false },
    { id: 8, name: 'Seal System (API 682)', shortName: 'Seal', description: 'Seal plan selection', status: 'Available', isRequired: false },
    { id: 9, name: 'Auxiliaries & Instrumentation', shortName: 'Aux', description: 'I/O dan package list', status: 'Available', isRequired: false },
    { id: 10, name: 'Test & Documentation', shortName: 'Test', description: 'Deliverables checklist', status: 'Available', isRequired: false },
    { id: 11, name: 'Hasil & Laporan', shortName: 'Hasil', description: 'Ekspor PDF/Excel', status: 'Available', isRequired: true },
];

