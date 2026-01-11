// ============================================================================
// Company Criteria Configuration
// ============================================================================
// This file contains configurable rules for engineering criteria.
// Defaults are placeholders - should be updated based on company specs.
// IMPORTANT: These are NOT official API standard values.

import { CheckStatus } from '@/types';

// ============================================================================
// Version Info
// ============================================================================
export const CRITERIA_VERSION = '1.0.0-placeholder';

// ============================================================================
// Existing Criteria Interfaces
// ============================================================================

export interface NPSHMarginRule {
    type: 'percentage' | 'absolute';
    value: number;               // % or meters/feet
    isConfigured: boolean;       // false = use placeholder, status = Review
}

export interface DriverMarginRule {
    type: 'percentage';
    value: number;               // % margin on motor sizing
    isConfigured: boolean;
}

export interface BEPProximityRule {
    minPercent: number;          // minimum % of BEP flow
    maxPercent: number;          // maximum % of BEP flow
    isConfigured: boolean;
    note: string;                // e.g., "Preferred operating region 70-120% BEP"
}

// ============================================================================
// Rules Engine Thresholds
// ============================================================================

export interface RulesEngineThresholds {
    // Viscosity threshold for PD pump preference (cP)
    // Above this, system biases toward rotary PD (API 676)
    highViscosityThreshold: number;

    // Pressure threshold for PD evaluation (kPa)
    // Above this, system evaluates PD options (API 674/676)
    highPressureThreshold: number;

    // Flow threshold for centrifugal preference (m³/h)
    // Above this, centrifugal (API 610) gets higher score
    highFlowThreshold: number;

    // Upper flow bound for metering pump (m³/h)
    // Used as score booster, NOT as gate
    meteringFlowUpperBound: number;

    // Confidence calculation thresholds
    // Delta between top-1 and top-2 scores
    confidenceDeltaHigh: number;    // If delta >= this, confidence = high
    confidenceDeltaMedium: number;  // If delta >= this, confidence = medium

    // Alternative threshold
    // If top-2 score within this delta, show as alternative
    alternativeDelta: number;

    // Flag that criteria are placeholders
    isConfigured: boolean;
}

// ============================================================================
// Complete Company Criteria
// ============================================================================

export interface CompanyCriteria {
    npshMargin: NPSHMarginRule;
    driverMargin: DriverMarginRule;
    bepProximity: BEPProximityRule;
    rulesEngine: RulesEngineThresholds;

    // Additional rules
    minControlValveDP: number;   // kPa - minimum control valve ΔP
    foulingMargin: number;       // % - default fouling allowance

    // Company info for reports
    companyName: string;
    departmentName: string;
}

// ============================================================================
// Default Configuration (Placeholders)
// ============================================================================
// IMPORTANT: All threshold values below are PLACEHOLDERS for MVP.
// They are NOT official API standard values and should be configured
// based on company engineering practices.

export const DEFAULT_COMPANY_CRITERIA: CompanyCriteria = {
    npshMargin: {
        type: 'absolute',
        value: 1.0,                // 1.0 m or 3 ft - PLACEHOLDER
        isConfigured: false,       // Not configured = Review status
    },

    driverMargin: {
        type: 'percentage',
        value: 15,                 // 15% motor margin - PLACEHOLDER
        isConfigured: false,
    },

    bepProximity: {
        minPercent: 70,
        maxPercent: 120,
        isConfigured: false,
        note: 'Preferred operating region 70-120% of BEP flow. Criteria not formally configured.',
    },

    rulesEngine: {
        // Viscosity: 100 cP is indicator, not hard gate
        highViscosityThreshold: 100,

        // Pressure: 2000 kPa (~290 psi) triggers PD evaluation
        highPressureThreshold: 2000,

        // Flow: 500 m³/h (~2200 GPM) favors centrifugal
        highFlowThreshold: 500,

        // Metering: 50 m³/h as booster, not gate
        meteringFlowUpperBound: 50,

        // Confidence thresholds
        confidenceDeltaHigh: 50,
        confidenceDeltaMedium: 25,

        // Alternative threshold
        alternativeDelta: 20,

        isConfigured: false,
    },

    minControlValveDP: 70,       // kPa (~10 psi) - PLACEHOLDER
    foulingMargin: 10,           // 10% - PLACEHOLDER

    companyName: 'Rekayasa Engineering',
    departmentName: 'RE Mechanical',
};

// ============================================================================
// Criteria Evaluation Functions
// ============================================================================

/**
 * Evaluate NPSH margin status
 */
export function evaluateNPSHMargin(
    npshaValue: number,
    npshrValue: number | null,
    criteria: NPSHMarginRule
): { status: CheckStatus; reasoning: string } {
    if (npshrValue === null) {
        return {
            status: 'Review',
            reasoning: 'Nilai NPSHr belum diisi. Masukkan NPSHr dari vendor untuk menyelesaikan verifikasi.',
        };
    }

    if (!criteria.isConfigured) {
        return {
            status: 'Review',
            reasoning: `Kriteria margin NPSH belum dikonfigurasi secara formal. Menggunakan nilai placeholder ${criteria.value} ${criteria.type === 'percentage' ? '%' : 'm'}. Perlu review.`,
        };
    }

    const requiredMargin = criteria.type === 'percentage'
        ? npshrValue * (criteria.value / 100)
        : criteria.value;

    const actualMargin = npshaValue - npshrValue;

    if (actualMargin >= requiredMargin) {
        return {
            status: 'OK',
            reasoning: `NPSHa (${npshaValue.toFixed(2)} m) - NPSHr (${npshrValue.toFixed(2)} m) = ${actualMargin.toFixed(2)} m margin ≥ margin yang dibutuhkan ${requiredMargin.toFixed(2)} m.`,
        };
    } else {
        return {
            status: 'NOT_OK',
            reasoning: `NPSHa (${npshaValue.toFixed(2)} m) - NPSHr (${npshrValue.toFixed(2)} m) = ${actualMargin.toFixed(2)} m margin < margin yang dibutuhkan ${requiredMargin.toFixed(2)} m. Margin NPSH tidak mencukupi.`,
        };
    }
}

/**
 * Evaluate driver/motor sizing status
 */
export function evaluateDriverSizing(
    brakePower: number,
    motorPower: number,
    criteria: DriverMarginRule
): { status: CheckStatus; reasoning: string } {
    if (!criteria.isConfigured) {
        const requiredMotor = brakePower * (1 + criteria.value / 100);
        return {
            status: 'Review',
            reasoning: `Kriteria sizing motor belum dikonfigurasi secara formal. Menggunakan margin placeholder ${criteria.value}%. Motor yang dibutuhkan ≥ ${requiredMotor.toFixed(1)} kW. Perlu review.`,
        };
    }

    const requiredMotor = brakePower * (1 + criteria.value / 100);

    if (motorPower >= requiredMotor) {
        return {
            status: 'OK',
            reasoning: `Motor (${motorPower.toFixed(1)} kW) ≥ brake power (${brakePower.toFixed(1)} kW) × ${1 + criteria.value / 100} = ${requiredMotor.toFixed(1)} kW. Sizing memadai.`,
        };
    } else {
        return {
            status: 'NOT_OK',
            reasoning: `Motor (${motorPower.toFixed(1)} kW) < yang dibutuhkan ${requiredMotor.toFixed(1)} kW (brake power + ${criteria.value}% margin). Motor terlalu kecil.`,
        };
    }
}
