// ============================================================================
// NPSH (Net Positive Suction Head) Calculation
// ============================================================================

import { OperatingCase, CalculationResult, CheckStatus, UnitSystem } from '@/types';
import { CompanyCriteria, evaluateNPSHMargin } from '../companyCriteria';

const GRAVITY = 9.81; // m/s²

/**
 * Calculate NPSHa (Net Positive Suction Head Available)
 * 
 * NPSHa = (Ps - Pv) / (ρg) + Hs - hf
 * 
 * Where:
 * - Ps = suction source pressure (absolute)
 * - Pv = vapor pressure
 * - ρ = fluid density
 * - g = gravitational acceleration
 * - Hs = static suction head (liquid level above pump)
 * - hf = suction line friction losses
 */
export function calculateNPSHa(
    operatingCase: OperatingCase,
    units: UnitSystem,
    atmosphericPressure?: number // kPa or psi
): CalculationResult {
    const { fluid, suction } = operatingCase;

    // Default atmospheric pressure
    const patm = atmosphericPressure ?? (units === 'SI' ? 101.325 : 14.7);

    // Convert suction pressure to absolute
    const psAbsolute = suction.vesselPressure + patm;

    // Unit conversions for pressure to head
    const pressureToHead = units === 'SI'
        ? (p: number) => (p * 1000) / (fluid.density * GRAVITY) // kPa to m
        : (p: number) => p * 2.31 / fluid.specificGravity;      // psi to ft

    const lossesToHead = units === 'SI'
        ? (dp: number) => (dp * 1000) / (fluid.density * GRAVITY) // kPa to m
        : (dp: number) => dp * 2.31 / fluid.specificGravity;       // psi to ft

    // Calculate NPSHa components
    const pressureHead = pressureToHead(psAbsolute);
    const vaporPressureHead = pressureToHead(fluid.vaporPressure);
    const staticSuctionHead = suction.liquidLevel;
    const suctionLossHead = lossesToHead(suction.lineLosses);

    // NPSHa = pressure head - vapor pressure head + static head - losses
    const npshaValue = pressureHead - vaporPressureHead + staticSuctionHead - suctionLossHead;

    const unit = units === 'SI' ? 'm' : 'ft';

    return {
        value: npshaValue,
        unit,
        basis: 'NPSHa = (Ps - Pv) / (ρg) + Hs - hf_suction',
        assumptions: [
            `Atmospheric pressure: ${patm} ${units === 'SI' ? 'kPa' : 'psia'}`,
            `Suction source pressure (gauge): ${suction.vesselPressure} ${units === 'SI' ? 'kPa(g)' : 'psig'}`,
            `Vapor pressure: ${fluid.vaporPressure} ${units === 'SI' ? 'kPa' : 'psia'}`,
            `Liquid level above pump: ${suction.liquidLevel} ${unit}`,
            `Suction line losses: ${suction.lineLosses} ${units === 'SI' ? 'kPa' : 'psi'}`,
        ],
        status: 'OK',
        reasoning: `NPSHa calculated as ${npshaValue.toFixed(2)} ${unit}. Components: Pressure head ${pressureHead.toFixed(2)} ${unit} - Vapor ${vaporPressureHead.toFixed(2)} ${unit} + Static ${staticSuctionHead.toFixed(2)} ${unit} - Losses ${suctionLossHead.toFixed(2)} ${unit}.`,
    };
}

/**
 * Compare NPSHa vs NPSHr and determine status
 */
export function evaluateNPSH(
    npshaValue: number,
    npshrValue: number | null,
    criteria: CompanyCriteria,
    units: UnitSystem
): { status: CheckStatus; margin: number | null; reasoning: string } {
    if (npshrValue === null) {
        return {
            status: 'Review',
            margin: null,
            reasoning: 'NPSHr value not provided. Enter vendor NPSHr to complete verification.',
        };
    }

    const margin = npshaValue - npshrValue;
    const evaluation = evaluateNPSHMargin(npshaValue, npshrValue, criteria.npshMargin);

    return {
        status: evaluation.status,
        margin,
        reasoning: evaluation.reasoning,
    };
}

/**
 * Find governing case for NPSH (minimum margin)
 */
export function findGoverningNPSHCase(
    results: { caseId: string; caseName: string; npsha: number; margin: number | null }[]
): { caseId: string; caseName: string; margin: number | null } | null {
    const withMargin = results.filter(r => r.margin !== null);

    if (withMargin.length === 0) {
        // If no NPSHr provided, governing is minimum NPSHa
        if (results.length === 0) return null;
        const minCase = results.reduce((min, curr) =>
            curr.npsha < min.npsha ? curr : min
        );
        return { caseId: minCase.caseId, caseName: minCase.caseName, margin: null };
    }

    // Minimum margin is governing
    return withMargin.reduce((min, curr) =>
        (curr.margin ?? Infinity) < (min.margin ?? Infinity) ? curr : min
    );
}
