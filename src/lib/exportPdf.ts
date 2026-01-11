// ============================================================================
// PDF Export Utility for PumpCalc Engineering Reports
// Professional Technical Report with Logo Header
// ============================================================================

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Project } from '@/types';
import { calculateTDH, findGoverningTDHCase } from './calculations/tdh';
import { calculateNPSHa } from './calculations/npsh';
import { calculateHydraulicPower, calculateBrakePower, calculateMotorSize } from './calculations/power';
import { DEFAULT_COMPANY_CRITERIA } from './companyCriteria';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
    interface jsPDF {
        lastAutoTable: { finalY: number };
    }
}

// RE Brand Colors
const RE_BLUE = [30, 90, 160] as const;
const RE_GREEN = [45, 157, 79] as const;
const RE_YELLOW = [240, 165, 0] as const;
const RE_ORANGE = [232, 93, 4] as const;
const GRAY = [100, 100, 100] as const;

/**
 * Add page header
 */
function addHeader(doc: jsPDF, project: Project, pageNum: number, totalPages: number) {
    const pageWidth = doc.internal.pageSize.width;

    // Header background
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, 25, 'F');

    // Header line
    doc.setDrawColor(...RE_BLUE);
    doc.setLineWidth(0.5);
    doc.line(14, 25, pageWidth - 14, 25);

    // Company name (left)
    doc.setFontSize(12);
    doc.setTextColor(...RE_BLUE);
    doc.setFont('helvetica', 'bold');
    doc.text('REKAYASA ENGINEERING', 14, 12);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text('RE Mechanical — Pump Calculation Report', 14, 18);

    // Project info (right)
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.text(`${project.metadata.tagNo}`, pageWidth - 14, 12, { align: 'right' });
    doc.setTextColor(...GRAY);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 14, 18, { align: 'right' });
}

/**
 * Add page footer
 */
function addFooter(doc: jsPDF) {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(
        `PumpCalc v1.0 — Generated: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`,
        14,
        pageHeight - 10
    );
    doc.text(
        '© Rekayasa Engineering — Internal Use Only',
        pageWidth - 14,
        pageHeight - 10,
        { align: 'right' }
    );
}

/**
 * Add section title
 */
function addSectionTitle(doc: jsPDF, title: string, yPos: number, sectionNum?: string): number {
    doc.setFontSize(12);
    doc.setTextColor(...RE_BLUE);
    doc.setFont('helvetica', 'bold');

    const displayTitle = sectionNum ? `${sectionNum}. ${title}` : title;
    doc.text(displayTitle, 14, yPos);

    doc.setFont('helvetica', 'normal');
    return yPos + 6;
}

/**
 * Check if new page is needed
 */
function checkNewPage(doc: jsPDF, yPos: number, neededSpace: number = 40): number {
    const pageHeight = doc.internal.pageSize.height;
    if (yPos + neededSpace > pageHeight - 20) {
        doc.addPage();
        return 35;
    }
    return yPos;
}

/**
 * Generate comprehensive PDF report for a PumpCalc project
 */
export function generatePDF(project: Project): void {
    try {
        const doc = new jsPDF();
        const units = project.units;
        let yPos = 35;

        // Calculate all results first
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

        const tdhResults = results.map(r => ({ caseId: r.caseName, caseName: r.caseName, tdh: r.tdh }));
        const governingTDH = findGoverningTDHCase(tdhResults);
        const governingNPSH = results.reduce((min, r) => r.npsha < min.npsha ? r : min);
        const governingPower = results.reduce((max, r) => r.brakePower > max.brakePower ? r : max);
        const normalCase = project.cases.find(c => c.name === 'Normal') || project.cases[0];

        // ========================================================================
        // COVER / TITLE PAGE
        // ========================================================================
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, 210, 297, 'F');

        // Top decoration
        doc.setFillColor(...RE_BLUE);
        doc.rect(0, 0, 210, 8, 'F');

        // Company name
        doc.setFontSize(14);
        doc.setTextColor(...RE_BLUE);
        doc.setFont('helvetica', 'bold');
        doc.text('REKAYASA ENGINEERING', 105, 50, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...GRAY);
        doc.text('RE Mechanical Division', 105, 58, { align: 'center' });

        // Main title
        doc.setFontSize(28);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        doc.text('PUMP CALCULATION', 105, 90, { align: 'center' });
        doc.text('REPORT', 105, 103, { align: 'center' });

        // Project details box
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(30, 120, 150, 80, 3, 3, 'F');
        doc.setDrawColor(...RE_BLUE);
        doc.setLineWidth(0.5);
        doc.roundedRect(30, 120, 150, 80, 3, 3, 'S');

        const detailsStartY = 135;
        doc.setFontSize(10);
        doc.setTextColor(...GRAY);
        doc.text('Project Name:', 40, detailsStartY);
        doc.text('Tag Number:', 40, detailsStartY + 12);
        doc.text('Client:', 40, detailsStartY + 24);
        doc.text('Standard:', 40, detailsStartY + 36);
        doc.text('Unit System:', 40, detailsStartY + 48);
        doc.text('Date:', 40, detailsStartY + 60);

        doc.setTextColor(0);
        doc.setFont('helvetica', 'bold');
        doc.text(project.metadata.projectName, 90, detailsStartY);
        doc.text(project.metadata.tagNo, 90, detailsStartY + 12);
        doc.text(project.metadata.client || '-', 90, detailsStartY + 24);
        doc.text(project.pumpStandard.replace('API', 'API '), 90, detailsStartY + 36);
        doc.text(units, 90, detailsStartY + 48);
        doc.text(new Date(project.metadata.createdDate).toLocaleDateString('id-ID'), 90, detailsStartY + 60);

        // Prepared by
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...GRAY);
        doc.text(`Prepared by: ${project.metadata.createdBy}`, 105, 220, { align: 'center' });

        // Bottom decoration
        doc.setFillColor(...RE_BLUE);
        doc.rect(0, 289, 210, 8, 'F');

        // ========================================================================
        // PAGE 2: EXECUTIVE SUMMARY
        // ========================================================================
        doc.addPage();
        yPos = 35;

        yPos = addSectionTitle(doc, 'EXECUTIVE SUMMARY', yPos, '1');

        // Summary box
        doc.setFillColor(232, 240, 248);
        doc.roundedRect(14, yPos, 182, 35, 2, 2, 'F');

        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`This report presents the hydraulic calculations for ${project.metadata.tagNo}.`, 20, yPos + 10);
        doc.text(`The pump is specified per ${project.pumpStandard.replace('API', 'API ')} standard.`, 20, yPos + 18);
        doc.text(`Based on ${project.cases.length} operating case(s): ${project.cases.map(c => c.name).join(', ')}.`, 20, yPos + 26);

        yPos += 45;

        // Key Results Table
        yPos = addSectionTitle(doc, 'Key Design Parameters', yPos);

        autoTable(doc, {
            startY: yPos,
            head: [['Parameter', 'Value', 'Basis']],
            body: [
                ['Design Flow (Normal)', `${normalCase?.requiredFlow || 0} ${units === 'SI' ? 'm³/h' : 'GPM'}`, 'Normal case'],
                ['Design TDH (Governing)', `${governingTDH?.value.toFixed(2) || '-'} ${units === 'SI' ? 'm' : 'ft'}`, `${governingTDH?.caseName || '-'} case`],
                ['NPSHa (Minimum)', `${governingNPSH.npsha.toFixed(2)} ${units === 'SI' ? 'm' : 'ft'}`, `${governingNPSH.caseName} case`],
                ['Brake Power (Maximum)', `${governingPower.brakePower.toFixed(2)} kW`, `${governingPower.caseName} case`],
                ['Recommended Motor', `${Math.ceil(governingPower.brakePower * 1.15)} kW`, 'Per criteria'],
            ],
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [...RE_BLUE] },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 }, 1: { cellWidth: 50 } },
        });

        yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

        // ========================================================================
        // PROCESS DATA
        // ========================================================================
        yPos = checkNewPage(doc, yPos, 80);
        yPos = addSectionTitle(doc, 'PROCESS DATA & FLUID PROPERTIES', yPos, '2');

        autoTable(doc, {
            startY: yPos,
            head: [['Property', 'Minimum', 'Normal', 'Maximum', 'Unit']],
            body: [
                ['Flow Rate',
                    project.cases.find(c => c.name === 'Minimum')?.requiredFlow?.toString() || '-',
                    project.cases.find(c => c.name === 'Normal')?.requiredFlow?.toString() || '-',
                    project.cases.find(c => c.name === 'Maximum')?.requiredFlow?.toString() || '-',
                    units === 'SI' ? 'm³/h' : 'GPM'
                ],
                ['Temperature',
                    project.cases.find(c => c.name === 'Minimum')?.fluid.temperature?.toString() || '-',
                    project.cases.find(c => c.name === 'Normal')?.fluid.temperature?.toString() || '-',
                    project.cases.find(c => c.name === 'Maximum')?.fluid.temperature?.toString() || '-',
                    units === 'SI' ? '°C' : '°F'
                ],
                ['Density',
                    project.cases.find(c => c.name === 'Minimum')?.fluid.density?.toString() || '-',
                    project.cases.find(c => c.name === 'Normal')?.fluid.density?.toString() || '-',
                    project.cases.find(c => c.name === 'Maximum')?.fluid.density?.toString() || '-',
                    units === 'SI' ? 'kg/m³' : 'lb/ft³'
                ],
                ['Specific Gravity',
                    project.cases.find(c => c.name === 'Minimum')?.fluid.specificGravity?.toString() || '-',
                    project.cases.find(c => c.name === 'Normal')?.fluid.specificGravity?.toString() || '-',
                    project.cases.find(c => c.name === 'Maximum')?.fluid.specificGravity?.toString() || '-',
                    '-'
                ],
                ['Viscosity',
                    project.cases.find(c => c.name === 'Minimum')?.fluid.viscosity?.toString() || '-',
                    project.cases.find(c => c.name === 'Normal')?.fluid.viscosity?.toString() || '-',
                    project.cases.find(c => c.name === 'Maximum')?.fluid.viscosity?.toString() || '-',
                    'cP'
                ],
            ],
            theme: 'grid',
            styles: { fontSize: 9, halign: 'center' },
            headStyles: { fillColor: [...RE_BLUE] },
            columnStyles: { 0: { fontStyle: 'bold', halign: 'left' } },
        });

        yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

        // ========================================================================
        // CALCULATION RESULTS
        // ========================================================================
        yPos = checkNewPage(doc, yPos, 60);
        yPos = addSectionTitle(doc, 'CALCULATION RESULTS', yPos, '3');

        autoTable(doc, {
            startY: yPos,
            head: [['Case', `Flow`, `TDH`, `NPSHa`, 'Hyd. Power', 'Brake Power']],
            body: results.map(r => [
                r.caseName,
                `${r.flow} ${units === 'SI' ? 'm³/h' : 'GPM'}`,
                `${r.tdh.toFixed(2)} ${units === 'SI' ? 'm' : 'ft'}`,
                `${r.npsha.toFixed(2)} ${units === 'SI' ? 'm' : 'ft'}`,
                `${r.hydraulicPower.toFixed(2)} kW`,
                `${r.brakePower.toFixed(2)} kW`,
            ]),
            theme: 'striped',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [...RE_BLUE] },
        });

        yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

        // ========================================================================
        // TDH BREAKDOWN
        // ========================================================================
        yPos = checkNewPage(doc, yPos, 60);
        yPos = addSectionTitle(doc, 'TDH BREAKDOWN', yPos, '4');

        autoTable(doc, {
            startY: yPos,
            head: [['Case', 'Static', 'Friction', 'CV ΔP', 'Allowance', 'Total TDH']],
            body: results.map(r => [
                r.caseName,
                `${r.tdhBreakdown.staticHead.toFixed(2)}`,
                `${r.tdhBreakdown.frictionLosses.toFixed(2)}`,
                `${r.tdhBreakdown.controlValveDP.toFixed(2)}`,
                `${r.tdhBreakdown.allowances.toFixed(2)}`,
                `${r.tdh.toFixed(2)} ${units === 'SI' ? 'm' : 'ft'}`,
            ]),
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [...RE_GREEN] },
        });

        yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

        // ========================================================================
        // GOVERNING CASES
        // ========================================================================
        yPos = checkNewPage(doc, yPos, 50);
        yPos = addSectionTitle(doc, 'GOVERNING CASES', yPos, '5');

        autoTable(doc, {
            startY: yPos,
            head: [['Parameter', 'Governing Case', 'Value', 'Remarks']],
            body: [
                ['TDH (Maximum)', governingTDH?.caseName || '-',
                    `${governingTDH?.value.toFixed(2) || '-'} ${units === 'SI' ? 'm' : 'ft'}`,
                    'Pump head capability'],
                ['NPSHa (Minimum)', governingNPSH.caseName,
                    `${governingNPSH.npsha.toFixed(2)} ${units === 'SI' ? 'm' : 'ft'}`,
                    'Cavitation prevention'],
                ['Brake Power (Maximum)', governingPower.caseName,
                    `${governingPower.brakePower.toFixed(2)} kW`,
                    'Motor sizing'],
            ],
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [...RE_ORANGE] },
            columnStyles: { 0: { fontStyle: 'bold' } },
        });

        yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

        // ========================================================================
        // NOTES
        // ========================================================================
        yPos = checkNewPage(doc, yPos, 50);
        yPos = addSectionTitle(doc, 'NOTES & ASSUMPTIONS', yPos, '6');

        doc.setFontSize(9);
        doc.setTextColor(0);

        const notes = [
            '1. Calculations based on process data provided.',
            `2. Pump efficiency: ${((project.vendorData?.ratedEfficiency || 0.70) * 100).toFixed(0)}%`,
            `3. Motor sizing margin: ${DEFAULT_COMPANY_CRITERIA.driverMargin.value}%`,
            '4. Final selection to be verified against vendor curves.',
        ];

        notes.forEach((note, idx) => {
            doc.text(note, 14, yPos + (idx * 6));
        });

        yPos += notes.length * 6 + 15;

        // ========================================================================
        // APPROVAL
        // ========================================================================
        yPos = checkNewPage(doc, yPos, 50);
        yPos = addSectionTitle(doc, 'DOCUMENT APPROVAL', yPos, '7');

        autoTable(doc, {
            startY: yPos,
            head: [['Role', 'Name', 'Signature', 'Date']],
            body: [
                ['Prepared By', project.metadata.createdBy, '', ''],
                ['Checked By', '', '', ''],
                ['Approved By', '', '', ''],
            ],
            theme: 'grid',
            styles: { fontSize: 9, minCellHeight: 15 },
            headStyles: { fillColor: [...RE_BLUE] },
        });

        // ========================================================================
        // ADD HEADERS AND FOOTERS
        // ========================================================================
        const pageCount = doc.getNumberOfPages();
        for (let i = 2; i <= pageCount; i++) {
            doc.setPage(i);
            addHeader(doc, project, i - 1, pageCount - 1);
            addFooter(doc);
        }

        // Save
        const filename = `PumpCalc_${project.metadata.tagNo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
    } catch (error) {
        console.error('PDF Export Error:', error);
        throw new Error('Gagal mengekspor PDF. Error: ' + (error as Error).message);
    }
}
