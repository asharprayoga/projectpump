// ============================================================================
// Rules Engine - Pump Standard Recommendation
// ============================================================================
// Implements scoring model for recommending pump type and API standard
// based on service input. All thresholds are configurable via CompanyCriteria.

import {
    PumpStandard,
    PumpType,
    ConfidenceLevel,
    RecommendationResult,
    ServiceInput,
    Alternative,
} from '@/types';
import { CompanyCriteria, CRITERIA_VERSION } from '@/lib/companyCriteria';

// ============================================================================
// Scoring State
// ============================================================================

interface ScoringState {
    scores: {
        API610: number;
        API674: number;
        API675: number;
        API676: number;
    };
    reasons: string[];
    reasonCodes: string[];
    warnings: string[];
}

// ============================================================================
// Helper Functions
// ============================================================================

function getPumpTypeForStandard(standard: PumpStandard): PumpType {
    switch (standard) {
        case 'API610': return 'centrifugal';
        case 'API674': return 'pd_reciprocating';
        case 'API675': return 'metering';
        case 'API676': return 'pd_rotary';
    }
}

function getStandardLabel(standard: PumpStandard): string {
    switch (standard) {
        case 'API610': return 'API 610 (Centrifugal)';
        case 'API674': return 'API 674 (Reciprocating PD)';
        case 'API675': return 'API 675 (Metering)';
        case 'API676': return 'API 676 (Rotary PD)';
    }
}

// ============================================================================
// Rule Groups
// ============================================================================

/**
 * Rule Group A: Metering/dosing requirement
 */
function applyMeteringRules(state: ScoringState, input: ServiceInput, criteria: CompanyCriteria): void {
    const { rulesEngine } = criteria;

    // A1: Metering requirement is primary driver for API 675
    if (input.requiresAccurateMetering) {
        state.scores.API675 += 100;
        state.reasons.push('Akurasi metering/dosing diperlukan - API 675 direkomendasikan.');
        state.reasonCodes.push('A1_METERING_REQUIRED');

        // A2: Low flow metering boost
        if (input.normalFlow <= rulesEngine.meteringFlowUpperBound) {
            state.scores.API675 += 30;
            state.reasons.push(`Flow normal (${input.normalFlow} m³/h) dalam rentang metering pump.`);
            state.reasonCodes.push('A2_LOW_FLOW_METERING');
        } else {
            // F2: Conflict - metering required but high flow
            state.warnings.push(`Metering diperlukan tetapi flow (${input.normalFlow} m³/h) melebihi batas umum metering pump (${rulesEngine.meteringFlowUpperBound} m³/h). Evaluasi multi-pump atau alternatif.`);
            state.reasonCodes.push('F2_METERING_CONFLICT_HIGH_FLOW');
            // Still add centrifugal as alternative consideration
            state.scores.API610 += 15;
        }
    }
}

/**
 * Rule Group B: High pressure / PD suitability
 */
function applyPressureRules(state: ScoringState, input: ServiceInput, criteria: CompanyCriteria): void {
    const { rulesEngine } = criteria;

    // B1: High pressure favors PD pumps
    if (input.differentialPressure >= rulesEngine.highPressureThreshold) {
        state.scores.API674 += 40;
        state.scores.API676 += 25;
        state.reasons.push(`Tekanan diferensial tinggi (${input.differentialPressure} kPa) - evaluasi PD pump.`);
        state.reasonCodes.push('B1_HIGH_PRESSURE');
    }

    // B2: Pulsation acceptable favors reciprocating
    if (input.pulsationAcceptable) {
        state.scores.API674 += 15;
        state.reasonCodes.push('B2_PULSATION_OK');
    } else {
        // B3: PD needed but pulsation not acceptable
        if (state.scores.API674 > 0 || state.scores.API676 > 0) {
            state.scores.API676 += 10;
            state.scores.API674 -= 5;
            state.warnings.push('PD pump dipertimbangkan namun pulsation tidak diinginkan. Evaluasi rotary PD atau mitigasi pulsation dampener.');
            state.reasonCodes.push('B3_PD_WITH_PULSATION_CONCERN');
        }
    }
}

/**
 * Rule Group C: Viscosity / rotary preference
 */
function applyViscosityRules(state: ScoringState, input: ServiceInput, criteria: CompanyCriteria): void {
    const { rulesEngine } = criteria;

    if (input.viscosity === 'unknown') {
        // F1: Viscosity unknown - add warning and reduce confidence
        state.warnings.push('Viskositas tidak tersedia. Rekomendasi memiliki ketidakpastian lebih tinggi.');
        state.reasonCodes.push('F1_VISCOSITY_UNKNOWN');
        return;
    }

    // C1: High viscosity strongly favors rotary PD
    if (input.viscosity >= rulesEngine.highViscosityThreshold) {
        state.scores.API676 += 60;
        state.scores.API610 -= 10;
        state.reasons.push(`Viskositas tinggi (${input.viscosity} cP) - rotary PD (API 676) lebih sesuai.`);
        state.reasonCodes.push('C1_HIGH_VISCOSITY');
    }

    // C2: Shear sensitive fluids favor rotary (gentle pumping action)
    if (input.shearSensitive) {
        state.scores.API676 += 20;
        state.scores.API674 -= 5;
        state.reasons.push('Fluida sensitif terhadap shear - rotary PD lebih gentle.');
        state.reasonCodes.push('C2_SHEAR_SENSITIVE');
    }
}

/**
 * Rule Group D: Variability & control requirements
 */
function applyControlRules(state: ScoringState, input: ServiceInput): void {
    // D1: Constant flow requirement favors PD
    if (input.requiresConstantFlow) {
        state.scores.API674 += 25;
        state.scores.API676 += 20;
        state.reasons.push('Kebutuhan flow konstan terlepas dari variasi tekanan - PD pump lebih sesuai.');
        state.reasonCodes.push('D1_CONSTANT_FLOW_REQUIRED');
    }

    // D2: High downstream pressure variability
    if (input.downstreamPressureVariabilityHigh) {
        state.scores.API674 += 10;
        state.scores.API676 += 10;
        state.reasonCodes.push('D2_HIGH_PRESSURE_VARIABILITY');
    }
}

/**
 * Rule Group E: General purpose default (centrifugal)
 */
function applyDefaultRules(state: ScoringState, input: ServiceInput, criteria: CompanyCriteria): void {
    const { rulesEngine } = criteria;

    // Check if there's no dominant special condition
    const hasSpecialCondition =
        input.requiresAccurateMetering ||
        (input.viscosity !== 'unknown' && input.viscosity >= rulesEngine.highViscosityThreshold) ||
        input.differentialPressure >= rulesEngine.highPressureThreshold ||
        input.requiresConstantFlow;

    // E1: General purpose default to centrifugal
    if (!hasSpecialCondition) {
        state.scores.API610 += 40;
        state.reasons.push('Aplikasi umum tanpa kebutuhan khusus - centrifugal (API 610) sebagai default.');
        state.reasonCodes.push('E1_GENERAL_PURPOSE_DEFAULT');
    }

    // E2: High flow strongly favors centrifugal
    if (input.normalFlow >= rulesEngine.highFlowThreshold) {
        state.scores.API610 += 20;
        state.reasons.push(`Flow tinggi (${input.normalFlow} m³/h) - centrifugal lebih efisien.`);
        state.reasonCodes.push('E2_HIGH_FLOW_PREFERS_CENTRIFUGAL');
    }
}

// ============================================================================
// Confidence Calculation
// ============================================================================

function calculateConfidence(
    scores: ScoringState['scores'],
    warnings: string[],
    criteria: CompanyCriteria
): ConfidenceLevel {
    const { rulesEngine } = criteria;

    // Sort scores descending
    const sortedScores = Object.values(scores).sort((a, b) => b - a);
    const topScore = sortedScores[0];
    const secondScore = sortedScores[1];
    const delta = topScore - secondScore;

    // Start with high and downgrade based on conditions
    let confidence: ConfidenceLevel = 'high';

    // Check delta thresholds
    if (delta < rulesEngine.confidenceDeltaHigh) {
        confidence = 'medium';
    }
    if (delta < rulesEngine.confidenceDeltaMedium) {
        confidence = 'low';
    }

    // Downgrade if warnings present
    if (warnings.length > 0 && confidence === 'high') {
        confidence = 'medium';
    }
    if (warnings.length >= 2 && confidence === 'medium') {
        confidence = 'low';
    }

    // If criteria not configured, cap at medium
    if (!rulesEngine.isConfigured && confidence === 'high') {
        confidence = 'medium';
    }

    return confidence;
}

// ============================================================================
// Alternative Generation
// ============================================================================

function generateAlternatives(
    scores: ScoringState['scores'],
    recommendedStandard: PumpStandard,
    criteria: CompanyCriteria
): Alternative[] {
    const { rulesEngine } = criteria;
    const alternatives: Alternative[] = [];

    const topScore = scores[recommendedStandard];

    // Check each standard that isn't the recommendation
    const standards: PumpStandard[] = ['API610', 'API674', 'API675', 'API676'];

    for (const std of standards) {
        if (std === recommendedStandard) continue;

        const score = scores[std];
        const delta = topScore - score;

        // Include as alternative if within threshold
        if (delta <= rulesEngine.alternativeDelta && score > 0) {
            alternatives.push({
                standard: std,
                pumpType: getPumpTypeForStandard(std),
                score,
                note: `Selisih skor ${delta.toFixed(0)} poin dari rekomendasi utama. Layak dipertimbangkan.`,
            });
        }
    }

    // Always include centrifugal as alternative if not recommended and has positive score
    // (per guardrail requirement)
    if (recommendedStandard !== 'API610' && scores.API610 > 0) {
        const alreadyIncluded = alternatives.some(a => a.standard === 'API610');
        if (!alreadyIncluded) {
            alternatives.push({
                standard: 'API610',
                pumpType: 'centrifugal',
                score: scores.API610,
                note: 'Centrifugal tetap dapat dipertimbangkan untuk kasus borderline.',
            });
        }
    }

    // Sort by score descending
    alternatives.sort((a, b) => b.score - a.score);

    return alternatives;
}

// ============================================================================
// Main Recommendation Function
// ============================================================================

/**
 * Generate pump standard recommendation based on service input.
 * 
 * @param input Service input parameters
 * @param criteria Company criteria with thresholds
 * @returns Recommendation result with standard, confidence, reasons, and alternatives
 */
export function recommendPumpStandard(
    input: ServiceInput,
    criteria: CompanyCriteria
): RecommendationResult {
    // Initialize scoring state
    const state: ScoringState = {
        scores: {
            API610: 0,
            API674: 0,
            API675: 0,
            API676: 0,
        },
        reasons: [],
        reasonCodes: [],
        warnings: [],
    };

    // Apply all rule groups
    applyMeteringRules(state, input, criteria);
    applyPressureRules(state, input, criteria);
    applyViscosityRules(state, input, criteria);
    applyControlRules(state, input);
    applyDefaultRules(state, input, criteria);

    // Determine recommended standard (highest score)
    const entries = Object.entries(state.scores) as [PumpStandard, number][];
    entries.sort((a, b) => b[1] - a[1]);
    const [recommendedStandard, topScore] = entries[0];

    // Calculate confidence
    const confidence = calculateConfidence(state.scores, state.warnings, criteria);

    // Generate alternatives
    const alternatives = generateAlternatives(state.scores, recommendedStandard, criteria);

    // Add criteria not configured warning if applicable
    if (!criteria.rulesEngine.isConfigured) {
        state.warnings.unshift('Kriteria rules engine menggunakan nilai placeholder. Review oleh engineer direkomendasikan.');
    }

    return {
        recommendedStandard,
        recommendedPumpType: getPumpTypeForStandard(recommendedStandard),
        confidence,
        reasons: state.reasons,
        reasonCodes: state.reasonCodes,
        alternatives,
        warnings: state.warnings,
        scores: state.scores,
        criteriaVersion: CRITERIA_VERSION,
        generatedAt: new Date().toISOString(),
    };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Build ServiceInput from operating case data
 */
export function buildServiceInputFromCase(
    normalCase: { requiredFlow: number; fluid: { viscosity: number; shearSensitive?: boolean; solidsPct?: number } },
    discharge: { requiredPressure: number },
    controlRequirements?: {
        requiresAccurateMetering?: boolean;
        requiresConstantFlow?: boolean;
        downstreamPressureVariabilityHigh?: boolean;
        pulsationAcceptable?: boolean;
    }
): ServiceInput {
    return {
        requiresAccurateMetering: controlRequirements?.requiresAccurateMetering ?? false,
        normalFlow: normalCase.requiredFlow,
        differentialPressure: discharge.requiredPressure, // Simplified - should include suction
        viscosity: normalCase.fluid.viscosity,
        shearSensitive: normalCase.fluid.shearSensitive ?? false,
        solidsPresent: (normalCase.fluid.solidsPct ?? 0) > 0,
        solidsPct: normalCase.fluid.solidsPct,
        requiresConstantFlow: controlRequirements?.requiresConstantFlow ?? false,
        downstreamPressureVariabilityHigh: controlRequirements?.downstreamPressureVariabilityHigh ?? false,
        pulsationAcceptable: controlRequirements?.pulsationAcceptable ?? true,
        operationMode: 'continuous',
    };
}
