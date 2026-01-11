// ============================================================================
// TDH (Total Dynamic Head) Calculation
// ============================================================================

import { OperatingCase, TDHResult, UnitSystem } from '@/types';

const GRAVITY = 9.81; // m/s²

/**
 * Calculate TDH for a single operating case
 * 
 * TDH = (Pd - Ps) / (ρg) + (Zd - Zs) + hf_total + allowances
 * 
 * Where:
 * - Pd = discharge pressure
 * - Ps = suction pressure
 * - ρ = fluid density
 * - g = gravitational acceleration
 * - Zd = discharge elevation
 * - Zs = suction elevation
 * - hf_total = total friction losses (suction + discharge + control valve)
 */
export function calculateTDH(
    operatingCase: OperatingCase,
    units: UnitSystem
): TDHResult {
    const { fluid, suction, discharge, foulingAllowance, uncertaintyAllowance } = operatingCase;

    // Unit conversions
    const pressureToHead = units === 'SI'
        ? (p: number) => (p * 1000) / (fluid.density * GRAVITY) // kPa to m
        : (p: number) => p * 2.31 / fluid.specificGravity;      // psi to ft

    const lossesToHead = units === 'SI'
        ? (dp: number) => (dp * 1000) / (fluid.density * GRAVITY) // kPa to m
        : (dp: number) => dp * 2.31 / fluid.specificGravity;       // psi to ft

    // Calculate components
    const suctionHead = pressureToHead(suction.vesselPressure) + suction.liquidLevel;
    const dischargeHead = pressureToHead(discharge.requiredPressure) + discharge.elevation;

    // Static head (discharge - suction)
    const staticHead = dischargeHead - suctionHead;

    // Friction losses
    const suctionLossHead = lossesToHead(suction.lineLosses);
    const dischargeLossHead = lossesToHead(discharge.lineLosses);
    const controlValveHead = discharge.controlValveDP ? lossesToHead(discharge.controlValveDP) : 0;
    const frictionLosses = suctionLossHead + dischargeLossHead;

    // Allowances
    const baseHead = staticHead + frictionLosses + controlValveHead;
    const foulingHead = baseHead * (foulingAllowance / 100);
    const uncertaintyHead = baseHead * (uncertaintyAllowance / 100);
    const totalAllowances = foulingHead + uncertaintyHead;

    // Total TDH
    const totalTDH = baseHead + totalAllowances;

    const unit = units === 'SI' ? 'm' : 'ft';

    return {
        value: totalTDH,
        unit,
        basis: 'TDH = Static Head + Friction Losses + CV ΔP + Allowances',
        assumptions: [
            `Fluid density: ${fluid.density} ${units === 'SI' ? 'kg/m³' : 'lb/ft³'}`,
            `Suction vessel pressure: ${suction.vesselPressure} ${units === 'SI' ? 'kPa(g)' : 'psig'}`,
            `Discharge required pressure: ${discharge.requiredPressure} ${units === 'SI' ? 'kPa(g)' : 'psig'}`,
            suction.lineLossMethod === 'Direct' ? 'Line losses provided directly' : 'Line losses calculated from pipe data',
            foulingAllowance > 0 ? `Fouling allowance: ${foulingAllowance}%` : 'No fouling allowance',
            uncertaintyAllowance > 0 ? `Uncertainty allowance: ${uncertaintyAllowance}%` : 'No uncertainty allowance',
        ],
        status: 'OK',
        reasoning: `TDH calculated as ${totalTDH.toFixed(2)} ${unit}. Components: Static ${staticHead.toFixed(2)} ${unit} + Friction ${frictionLosses.toFixed(2)} ${unit}${controlValveHead > 0 ? ` + CV ΔP ${controlValveHead.toFixed(2)} ${unit}` : ''}${totalAllowances > 0 ? ` + Allowances ${totalAllowances.toFixed(2)} ${unit}` : ''}.`,
        breakdown: {
            staticHead,
            frictionLosses,
            controlValveDP: controlValveHead,
            allowances: totalAllowances,
        },
    };
}

/**
 * Find governing case for TDH (maximum TDH)
 */
export function findGoverningTDHCase(
    results: { caseId: string; caseName: string; tdh: number }[]
): { caseId: string; caseName: string; value: number } | null {
    if (results.length === 0) return null;

    return results.reduce((max, curr) =>
        curr.tdh > max.value
            ? { caseId: curr.caseId, caseName: curr.caseName, value: curr.tdh }
            : max,
        { caseId: results[0].caseId, caseName: results[0].caseName, value: results[0].tdh }
    );
}
