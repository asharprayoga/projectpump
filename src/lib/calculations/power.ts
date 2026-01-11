// ============================================================================
// Power Calculation
// ============================================================================

import { OperatingCase, CalculationResult, UnitSystem } from '@/types';
import { CompanyCriteria, evaluateDriverSizing } from '../companyCriteria';

const GRAVITY = 9.81; // m/s²

/**
 * Calculate Hydraulic Power
 * 
 * P_hyd = ρ × g × Q × H / 1000 (kW)
 * 
 * Where:
 * - ρ = fluid density (kg/m³)
 * - g = gravitational acceleration (m/s²)
 * - Q = flow rate (m³/s)
 * - H = total head (m)
 */
export function calculateHydraulicPower(
    flow: number,          // m³/h or GPM
    head: number,          // m or ft
    density: number,       // kg/m³ or lb/ft³
    specificGravity: number,
    units: UnitSystem
): CalculationResult {
    let powerKW: number;

    if (units === 'SI') {
        // Convert m³/h to m³/s
        const flowM3s = flow / 3600;
        powerKW = (density * GRAVITY * flowM3s * head) / 1000;
    } else {
        // US: P (hp) = Q (GPM) × H (ft) × SG / 3960
        const powerHP = (flow * head * specificGravity) / 3960;
        powerKW = powerHP * 0.7457; // Convert HP to kW
    }

    return {
        value: powerKW,
        unit: 'kW',
        basis: units === 'SI'
            ? 'P_hyd = ρ × g × Q × H / 1000'
            : 'P_hyd = Q × H × SG / 3960 × 0.7457',
        assumptions: [
            `Flow: ${flow} ${units === 'SI' ? 'm³/h' : 'GPM'}`,
            `Head: ${head} ${units === 'SI' ? 'm' : 'ft'}`,
            `Density: ${density} ${units === 'SI' ? 'kg/m³' : 'lb/ft³'}`,
            `Specific Gravity: ${specificGravity}`,
        ],
        status: 'OK',
        reasoning: `Hydraulic power calculated as ${powerKW.toFixed(2)} kW based on flow, head, and fluid density.`,
    };
}

/**
 * Calculate Brake Power (Shaft Power)
 * 
 * P_brake = P_hyd / η
 */
export function calculateBrakePower(
    hydraulicPower: number,  // kW
    efficiency: number       // decimal (0-1)
): CalculationResult {
    const efficiencyPercent = efficiency * 100;

    if (efficiency <= 0 || efficiency > 1) {
        return {
            value: 0,
            unit: 'kW',
            basis: 'P_brake = P_hyd / η',
            assumptions: [],
            status: 'Review',
            reasoning: `Invalid efficiency value (${efficiencyPercent}%). Efficiency must be between 0% and 100%.`,
        };
    }

    const brakePower = hydraulicPower / efficiency;

    return {
        value: brakePower,
        unit: 'kW',
        basis: 'P_brake = P_hyd / η',
        assumptions: [
            `Hydraulic power: ${hydraulicPower.toFixed(2)} kW`,
            `Pump efficiency: ${efficiencyPercent.toFixed(1)}%`,
        ],
        status: 'OK',
        reasoning: `Brake power calculated as ${brakePower.toFixed(2)} kW (hydraulic power ${hydraulicPower.toFixed(2)} kW ÷ efficiency ${efficiencyPercent.toFixed(1)}%).`,
    };
}

/**
 * Calculate recommended motor size
 */
export function calculateMotorSize(
    brakePower: number,       // kW
    criteria: CompanyCriteria
): CalculationResult {
    const marginMultiplier = 1 + (criteria.driverMargin.value / 100);
    const minMotorSize = brakePower * marginMultiplier;

    // Standard motor sizes (kW)
    const standardSizes = [0.75, 1.1, 1.5, 2.2, 3.0, 4.0, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75, 90, 110, 132, 160, 200, 250, 315, 400, 500, 630];

    // Find next standard size
    const selectedSize = standardSizes.find(size => size >= minMotorSize) ?? minMotorSize;

    const evaluation = evaluateDriverSizing(brakePower, selectedSize, criteria.driverMargin);

    return {
        value: selectedSize,
        unit: 'kW',
        basis: `Motor ≥ Brake Power × (1 + ${criteria.driverMargin.value}% margin)`,
        assumptions: [
            `Brake power: ${brakePower.toFixed(2)} kW`,
            `Margin rule: ${criteria.driverMargin.value}%`,
            `Minimum required: ${minMotorSize.toFixed(2)} kW`,
            criteria.driverMargin.isConfigured
                ? 'Margin criteria formally configured'
                : 'Using placeholder margin criteria',
        ],
        status: evaluation.status,
        reasoning: evaluation.reasoning,
    };
}

/**
 * Check minimum continuous flow
 * Returns warning if operating below typical minimum
 */
export function checkMinimumFlow(
    operatingFlow: number,
    bepFlow?: number,        // Best Efficiency Point flow if known
    minFlowPercent: number = 30  // Typical minimum as % of BEP
): { hasWarning: boolean; reasoning: string } {
    if (!bepFlow) {
        return {
            hasWarning: false,
            reasoning: 'BEP flow not specified. Minimum flow check requires vendor curve data.',
        };
    }

    const minFlow = bepFlow * (minFlowPercent / 100);
    const flowPercent = (operatingFlow / bepFlow) * 100;

    if (operatingFlow < minFlow) {
        return {
            hasWarning: true,
            reasoning: `Operating flow (${operatingFlow.toFixed(1)}) is ${flowPercent.toFixed(1)}% of BEP, below minimum continuous flow of ${minFlowPercent}% BEP. Recirculation line may be required.`,
        };
    }

    return {
        hasWarning: false,
        reasoning: `Operating flow (${operatingFlow.toFixed(1)}) is ${flowPercent.toFixed(1)}% of BEP, within acceptable operating region.`,
    };
}

/**
 * Find governing case for power (maximum brake power)
 */
export function findGoverningPowerCase(
    results: { caseId: string; caseName: string; brakePower: number }[]
): { caseId: string; caseName: string; value: number } | null {
    if (results.length === 0) return null;

    return results.reduce((max, curr) =>
        curr.brakePower > max.value
            ? { caseId: curr.caseId, caseName: curr.caseName, value: curr.brakePower }
            : max,
        { caseId: results[0].caseId, caseName: results[0].caseName, value: results[0].brakePower }
    );
}
