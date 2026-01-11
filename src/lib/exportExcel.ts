// ============================================================================
// Excel Export Utility for PumpCalc Engineering Reports
// ============================================================================

import * as XLSX from 'xlsx';
import { Project } from '@/types';
import { calculateTDH, findGoverningTDHCase } from './calculations/tdh';
import { calculateNPSHa } from './calculations/npsh';
import { calculateHydraulicPower, calculateBrakePower, calculateMotorSize } from './calculations/power';
import { DEFAULT_COMPANY_CRITERIA } from './companyCriteria';

/**
 * Generate comprehensive Excel workbook for a PumpCalc project
 */
export function generateExcel(project: Project): void {
    try {
        const units = project.units;
        const wb = XLSX.utils.book_new();

        const flowUnit = units === 'SI' ? 'm³/h' : 'GPM';
        const headUnit = units === 'SI' ? 'm' : 'ft';
        const tempUnit = units === 'SI' ? '°C' : '°F';
        const densityUnit = units === 'SI' ? 'kg/m³' : 'lb/ft³';
        const pressureUnit = units === 'SI' ? 'kPa' : 'psi';

        // Calculate all results
        const results = project.cases.map(c => {
            const tdh = calculateTDH(c, units);
            const npsha = calculateNPSHa(c, units);
            const efficiency = project.vendorData?.ratedEfficiency || 0.70;
            const hydraulicPower = calculateHydraulicPower(
                c.requiredFlow, tdh.value, c.fluid.density, c.fluid.specificGravity, units
            );
            const brakePower = calculateBrakePower(hydraulicPower.value, efficiency);
            const motorSize = calculateMotorSize(brakePower.value, DEFAULT_COMPANY_CRITERIA);

            return {
                caseData: c,
                caseId: c.id,
                caseName: c.name,
                flow: c.requiredFlow,
                tdh: tdh.value,
                tdhBreakdown: tdh.breakdown,
                npsha: npsha.value,
                hydraulicPower: hydraulicPower.value,
                brakePower: brakePower.value,
                motorSize: motorSize.value,
                efficiency,
            };
        });

        const tdhResults = results.map(r => ({ caseId: r.caseId, caseName: r.caseName, tdh: r.tdh }));
        const governingTDH = findGoverningTDHCase(tdhResults);
        const governingNPSH = results.reduce((min, r) => r.npsha < min.npsha ? r : min);
        const governingPower = results.reduce((max, r) => r.brakePower > max.brakePower ? r : max);

        // ========== Sheet 1: Summary ==========
        const summaryData = [
            ['PUMP CALCULATION REPORT'],
            ['Rekayasa Engineering — RE Mechanical'],
            [],
            ['DOCUMENT INFORMATION'],
            ['Project Name', project.metadata.projectName],
            ['Tag Number', project.metadata.tagNo],
            ['Client', project.metadata.client || '-'],
            ['Unit/Area', project.metadata.unitArea || '-'],
            ['Pump Standard', project.pumpStandard.replace('API', 'API ')],
            ['Unit System', units],
            ['Prepared By', project.metadata.createdBy],
            ['Date Created', new Date(project.metadata.createdDate).toLocaleDateString('id-ID')],
            [],
            ['KEY DESIGN PARAMETERS'],
            ['Parameter', 'Value', 'Unit', 'Basis'],
            ['Design Flow (Normal)', project.cases.find(c => c.name === 'Normal')?.requiredFlow || 0, flowUnit, 'Normal case'],
            ['Design TDH (Governing)', governingTDH?.value.toFixed(2) || '-', headUnit, `${governingTDH?.caseName} case`],
            ['NPSHa (Minimum)', governingNPSH.npsha.toFixed(2), headUnit, `${governingNPSH.caseName} case`],
            ['Brake Power (Maximum)', governingPower.brakePower.toFixed(2), 'kW', `${governingPower.caseName} case`],
            ['Recommended Motor', Math.ceil(governingPower.brakePower * 1.15), 'kW', 'Per company criteria'],
        ];

        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        wsSummary['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 10 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

        // ========== Sheet 2: Process Data ==========
        const processHeader = [
            'Case', `Flow (${flowUnit})`, `Temp (${tempUnit})`, `Density (${densityUnit})`,
            'SG', 'Viscosity (cP)', `Vapor Press (${pressureUnit})`,
            'Corrosive', 'Toxic', 'Flammable'
        ];

        const processData = project.cases.map(c => [
            c.name,
            c.requiredFlow,
            c.fluid.temperature,
            c.fluid.density,
            c.fluid.specificGravity,
            c.fluid.viscosity,
            c.fluid.vaporPressure,
            c.fluid.isCorrosive ? 'Yes' : 'No',
            c.fluid.isToxic ? 'Yes' : 'No',
            c.fluid.isFlammable ? 'Yes' : 'No',
        ]);

        const wsProcess = XLSX.utils.aoa_to_sheet([processHeader, ...processData]);
        wsProcess['!cols'] = processHeader.map(() => ({ wch: 15 }));
        XLSX.utils.book_append_sheet(wb, wsProcess, 'Process Data');

        // ========== Sheet 3: Hydraulic Input ==========
        const hydraulicsHeader = [
            'Case', `Flow (${flowUnit})`,
            'Suction Type', `Suct Press (${pressureUnit})`, `Suct Level (${headUnit})`, `Suct Losses (${pressureUnit})`,
            'Disch Type', `Disch Press (${pressureUnit})`, `Disch Elev (${headUnit})`, `Disch Losses (${pressureUnit})`,
            `CV ΔP (${pressureUnit})`, 'Fouling %', 'Uncert %'
        ];

        const hydraulicsData = project.cases.map(c => [
            c.name,
            c.requiredFlow,
            c.suction.sourceType,
            c.suction.vesselPressure,
            c.suction.liquidLevel,
            c.suction.lineLosses,
            c.discharge.destinationType,
            c.discharge.requiredPressure,
            c.discharge.elevation,
            c.discharge.lineLosses,
            c.discharge.controlValveDP || 0,
            c.foulingAllowance,
            c.uncertaintyAllowance,
        ]);

        const wsHydraulics = XLSX.utils.aoa_to_sheet([hydraulicsHeader, ...hydraulicsData]);
        wsHydraulics['!cols'] = hydraulicsHeader.map(() => ({ wch: 14 }));
        XLSX.utils.book_append_sheet(wb, wsHydraulics, 'Hydraulic Input');

        // ========== Sheet 4: Calculation Results ==========
        const resultsHeader = [
            'Case', `Flow (${flowUnit})`, `TDH (${headUnit})`,
            `Static (${headUnit})`, `Friction (${headUnit})`,
            `CV ΔP (${headUnit})`, `Allowance (${headUnit})`,
            `NPSHa (${headUnit})`, 'Hyd Power (kW)', 'Brake Power (kW)', 'Motor (kW)'
        ];

        const resultsData = results.map(r => [
            r.caseName,
            r.flow,
            r.tdh.toFixed(2),
            r.tdhBreakdown.staticHead.toFixed(2),
            r.tdhBreakdown.frictionLosses.toFixed(2),
            r.tdhBreakdown.controlValveDP.toFixed(2),
            r.tdhBreakdown.allowances.toFixed(2),
            r.npsha.toFixed(2),
            r.hydraulicPower.toFixed(2),
            r.brakePower.toFixed(2),
            r.motorSize.toFixed(0),
        ]);

        const wsResults = XLSX.utils.aoa_to_sheet([resultsHeader, ...resultsData]);
        wsResults['!cols'] = resultsHeader.map(() => ({ wch: 14 }));
        XLSX.utils.book_append_sheet(wb, wsResults, 'Calculation Results');

        // ========== Sheet 5: Governing Cases ==========
        const governingData = [
            ['GOVERNING CASES SUMMARY'],
            [],
            ['Parameter', 'Governing Case', 'Value', 'Unit', 'Remarks'],
            ['TDH (Maximum)', governingTDH?.caseName || '-', governingTDH?.value.toFixed(2) || '-', headUnit, 'Pump head capability'],
            ['NPSHa (Minimum)', governingNPSH.caseName, governingNPSH.npsha.toFixed(2), headUnit, 'Cavitation prevention'],
            ['Brake Power (Maximum)', governingPower.caseName, governingPower.brakePower.toFixed(2), 'kW', 'Motor sizing'],
            [],
            ['NOTES'],
            ['1. Calculations based on process data provided.'],
            [`2. Pump efficiency: ${((project.vendorData?.ratedEfficiency || 0.70) * 100).toFixed(0)}%`],
            [`3. Motor sizing margin: ${DEFAULT_COMPANY_CRITERIA.driverMargin.value}%`],
            ['4. Final selection to be verified against vendor curves.'],
        ];

        const wsGoverning = XLSX.utils.aoa_to_sheet(governingData);
        wsGoverning['!cols'] = [{ wch: 20 }, { wch: 18 }, { wch: 12 }, { wch: 8 }, { wch: 30 }];
        XLSX.utils.book_append_sheet(wb, wsGoverning, 'Governing Cases');

        // ========== Save ==========
        const filename = `PumpCalc_${project.metadata.tagNo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, filename);
    } catch (error) {
        console.error('Excel Export Error:', error);
        throw new Error('Gagal mengekspor Excel. Error: ' + (error as Error).message);
    }
}
