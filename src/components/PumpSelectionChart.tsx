'use client';

import React from 'react';

interface Point {
    x: number;
    y: number;
    cx?: number; // Optional control point X for Quadratic Bezier
    cy?: number; // Optional control point Y for Quadratic Bezier
    isCurve?: boolean;
}

export interface FluidRating {
    score: number; // 1-5 (Higher is better)
    note: string;  // Fluid-specific engineering note
}

export interface PumpRegion {
    id: string;
    label: string;
    points: Point[]; // Linear values (GPM, ft)
    color: string;
    excludeIds?: string[]; // IDs of regions that should be subtracted from this one
    description: string; // Brief engineering description
    reasoning: string;   // Why pick this pump in overlapping areas
    fluidSuitability: Record<string, FluidRating>;
}

// Helper to interpolate points on a quadratic bezier curve
const getBezierPoints = (p0: Point, p1: Point, steps: number = 10): Point[] => {
    if (!p1.isCurve || p1.cx === undefined || p1.cy === undefined) return [p1];

    const results: Point[] = [];
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.cx + t * t * p1.x;
        const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.cy + t * t * p1.y;
        results.push({ x, y });
    }
    return results;
};

// Helper to get a fully flattened list of points for selection logic
const flattenPoints = (points: Point[]): Point[] => {
    const flattened: Point[] = [points[0]];
    for (let i = 1; i < points.length; i++) {
        if (points[i].isCurve) {
            flattened.push(...getBezierPoints(points[i - 1], points[i]));
        } else {
            flattened.push(points[i]);
        }
    }
    return flattened;
};

export const PUMP_REGIONS: PumpRegion[] = [
    {
        id: 'axial',
        label: 'Axial flow',
        points: [
            { x: 1200, y: 10 }, { x: 1450, y: 17 }, { x: 10000, y: 22 }, { x: 10000, y: 10 }
        ],
        color: 'rgba(20, 184, 166, 0.2)',
        description: 'Pompa khusus untuk flow raksasa dengan head yang sangat rendah.',
        reasoning: 'Satu-satunya pilihan efisien untuk memindahkan volume air besar pada ketinggian angkat rendah seperti drainase atau kanal.',
        fluidSuitability: {
            water_clean: { score: 5, note: 'Sangat efisien untuk banjir dan irigasi.' },
            water_sea: { score: 4, note: 'Digunakan untuk intake air pendingin PLTU.' },
            water_waste: { score: 3, note: 'Dapat menangani debit besar limbah cair yang sudah disaring.' }
        }
    },
    {
        id: 'metering-diaphragm',
        label: 'Metering - diaphragm',
        points: [
            { x: 1, y: 10 }, { x: 1, y: 600 }, { x: 5, y: 100 }, { x: 5, y: 10 }
        ],
        color: 'rgba(239, 68, 68, 0.2)',
        description: 'Pompa perpindahan positif dengan diafragma fleksibel untuk dosing kimia.',
        reasoning: 'Pilihan utama untuk dosing kimia yang korosif atau berbahaya karena desainnya yang bebas bocor (hermetically sealed).',
        fluidSuitability: {
            chemical_corrosive: { score: 5, note: 'Tingkat keamanan tertinggi untuk asam dan basa kuat.' },
            chemical_toxic: { score: 5, note: 'Desain tanpa seal dinamis mencegah kebocoran zat berbahaya.' },
            slurry: { score: 4, note: 'Dapat menangani suspensi karena tidak ada bagian berputar yang bersentuhan.' }
        }
    },
    {
        id: 'metering-plunger',
        label: 'Metering - plunger',
        points: [
            { x: 1, y: 10 }, { x: 1, y: 2500 }, { x: 25, y: 100 }, { x: 25, y: 10 }
        ],
        color: 'rgba(236, 72, 153, 0.2)',
        description: 'Pompa metering berbasis plunger untuk akurasi tinggi pada tekanan sangat tinggi.',
        reasoning: 'Memberikan akurasi dosing terbaik untuk fluida non-korosif pada tekanan operasional yang sangat ekstrem.',
        fluidSuitability: {
            water_clean: { score: 4, note: 'Digunakan untuk injeksi air pada tekanan tinggi.' },
            oil_crude: { score: 3, note: 'Dapat digunakan untuk injeksi aditif pada minyak bumi.' },
            chemical_toxic: { score: 2, note: 'Risiko kebocoran kecil pada packing plunger.' }
        }
    },
    {
        id: 'screw',
        label: 'Screw',
        points: [
            { x: 1, y: 10 }, { x: 1, y: 600 }, { x: 30, y: 600 }, { x: 60, y: 220 }, { x: 60, y: 10 }
        ],
        color: 'rgba(107, 114, 128, 0.1)',
        description: 'Pompa rotari yang sangat tenang dengan aliran konstan tanpa pulsa.',
        reasoning: 'Sangat baik untuk menangani fluida dengan viskositas tinggi atau yang sensitif terhadap geseran (shear-sensitive).',
        fluidSuitability: {
            oil_crude: { score: 5, note: 'Unggul dalam menangani minyak mentah kental dengan efisiensi tinggi.' },
            oil_fuel: { score: 5, note: 'Pilihan terbaik untuk bongkar muat kapal tanker BBM.' },
            lube_oil: { score: 5, note: 'Memberikan aliran pelumasan yang stabil dan tanpa pulsa.' }
        }
    },
    {
        id: 'regenerative',
        label: 'Regenerative',
        points: [
            { x: 1, y: 10 }, { x: 1, y: 1000 }, { x: 4.5, y: 1000 }, { x: 200, y: 150 }
        ],
        color: 'rgba(245, 158, 11, 0.2)',
        description: 'Pompa khusus untuk flow sangat rendah dengan tekanan tinggi.',
        reasoning: 'Solusi kompak untuk aplikasi low-flow industri yang membutuhkan head tinggi yang tidak bisa dicapai centrifugal standar.',
        fluidSuitability: {
            water_clean: { score: 5, note: 'Sempurna untuk sirkulasi boiler kecil atau pendingin peralatan.' },
            oil_fuel: { score: 4, note: 'Dapat digunakan untuk transfer bahan bakar berviskositas rendah.' },
            chemical_corrosive: { score: 3, note: 'Tersedia dalam opsi material stainless steel.' }
        }
    },
    {
        id: 'gear',
        label: 'Gear',
        points: [
            { x: 1, y: 10 }, { x: 1, y: 1500 }, { x: 45, y: 1500 }, { x: 3000, y: 50 }, { x: 3000, y: 10 }
        ],
        color: 'rgba(251, 191, 36, 0.1)',
        description: 'Pompa rotari sederhana dengan roda gigi yang presisi.',
        reasoning: 'Pilihan hemat biaya untuk pelumasan (lube oil) atau transfer fluida kental pada tekanan menengah.',
        fluidSuitability: {
            oil_fuel: { score: 5, note: 'Sangat umum digunakan sebagai pompa transfer solar/minyak bakar.' },
            lube_oil: { score: 5, note: 'Standar de-facto untuk sistem pelumasan mesin.' },
            oil_crude: { score: 2, note: 'Cepat aus jika minyak mengandung pasir atau kotoran.' }
        }
    },
    {
        id: 'steam',
        label: 'Direct-acting steam',
        points: [
            { x: 1, y: 10 }, { x: 1, y: 1500 }, { x: 170, y: 1500 }, { x: 2000, y: 500 }, { x: 2000, y: 10 }
        ],
        color: 'rgba(75, 85, 99, 0.2)',
        description: 'Pompa tangguh yang digerakkan langsung oleh tekanan steam tanpa memerlukan motor listrik.',
        reasoning: 'Ideal untuk aplikasi darurat (fire pump cadangan) atau lokasi terpencil yang memiliki akses steam melimpah.',
        fluidSuitability: {
            water_clean: { score: 3, note: 'Cocok untuk aplikasi boiler feed darurat.' },
            oil_crude: { score: 4, note: 'Dapat menangani viskositas tinggi dengan kecepatan rendah.' },
            slurry: { score: 2, note: 'Packing dan valve rentan aus terhadap abrasive.' }
        }
    },
    {
        id: 'centrifugal-ss-ss',
        label: 'Centrifugal - single stage single suction',
        points: [
            { x: 1, y: 10 }, { x: 5.5, y: 300 }, { x: 150, y: 300 }, { x: 10000, y: 100, isCurve: true, cx: 2000, cy: 320 }, { x: 10000, y: 10 }
        ],
        color: 'rgba(59, 130, 246, 0.2)',
        description: 'Tipe pompa paling umum untuk kebutuhan head dan flow rendah hingga menengah.',
        reasoning: 'Pilihan paling ekonomis dengan biaya instalasi dan perawatan terendah untuk rentang kerja standar.',
        fluidSuitability: {
            water_clean: { score: 5, note: 'Sangat efisien dan ekonomis untuk air bersih.' },
            water_sea: { score: 3, note: 'Membutuhkan material khusus (Bronze/Duplex) untuk mencegah korosi.' },
            water_waste: { score: 2, note: 'Berisiko tersumbat jika terdapat padatan besar.' },
            oil_fuel: { score: 4, note: 'Cocok untuk viskositas rendah seperti solar atau minyak tanah.' },
            chemical_corrosive: { score: 3, note: 'Dapat digunakan dengan mechanical seal dan material yang tepat.' },
            hot_water: { score: 4, note: 'Standar industri untuk sirkulasi air panas.' }
        }
    },
    {
        id: 'centrifugal-ds',
        label: 'Centrifugal - double suction',
        points: [
            { x: 127, y: 10 }, { x: 1750, y: 1900 }, { x: 10000, y: 1000, isCurve: true, cx: 4600, cy: 1650 }, { x: 10000, y: 10 }
        ],
        color: 'rgba(139, 92, 246, 0.2)',
        excludeIds: ['centrifugal-ss-ss'],
        description: 'Didesain untuk menangani flow yang sangat besar dengan efisiensi tinggi.',
        reasoning: 'NPSH yang lebih baik dan gaya aksial yang lebih seimbang dibandingkan single-suction pada flow besar.',
        fluidSuitability: {
            water_clean: { score: 5, note: 'Pilihan utama untuk instalasi pengolahan air kota dan pengairan.' },
            water_sea: { score: 4, note: 'Sangat baik untuk sistem pendingin seawater pada power plant.' },
            water_waste: { score: 3, note: 'Hanya untuk air limbah yang sudah melalui proses penyaringan.' }
        }
    },
    {
        id: 'centrifugal-ms',
        label: 'Centrifugal - multistage',
        points: [
            { x: 1, y: 10 }, { x: 17.4, y: 3000 }, { x: 300, y: 3000 }, { x: 2500, y: 2400, isCurve: true, cx: 1110, cy: 3040 }, { x: 161, y: 10 }
        ],
        color: 'rgba(16, 185, 129, 0.2)',
        excludeIds: ['centrifugal-ds', 'centrifugal-ss-ss'],
        description: 'Pompa dengan beberapa impeller untuk menghasilkan head (tekanan) yang sangat tinggi.',
        reasoning: 'Lebih efisien daripada pompa single-stage untuk tekanan tinggi namun tetap mempertahankan flow yang moderat.',
        fluidSuitability: {
            water_clean: { score: 5, note: 'Pilihan standar untuk boiler feed dan distribusi air gedung tinggi.' },
            water_sea: { score: 2, note: 'Risiko korosi celah (crevice corrosion) tinggi pada sambungan antar stage.' },
            hot_water: { score: 5, note: 'Sangat baik untuk sistem umpan boiler (boiler feedwater).' }
        }
    },
    {
        id: 'multicylinder',
        label: 'Multicylinder plunger',
        points: [
            { x: 1, y: 10 }, { x: 1, y: 10000 }, { x: 70, y: 10000 }, { x: 2000, y: 500 }, { x: 2000, y: 10 }
        ],
        color: 'rgba(17, 24, 39, 0.2)',
        description: 'Pompa plunger heavy-duty untuk tekanan dan flow yang sangat ekstrem.',
        reasoning: 'Memberikan efisiensi volumetrik tertinggi untuk pemrosesan industri berat di tekanan ribuan PSI.',
        fluidSuitability: {
            water_clean: { score: 5, note: 'Terbaik untuk jetting air bertekanan tinggi.' },
            oil_crude: { score: 5, note: 'Digunakan untuk injeksi air/minyak pada sumur minyak bumi.' },
            slurry: { score: 3, note: 'Membutuhkan plunger keramik dan valve khusus untuk abrasive.' }
        }
    }
];

interface PumpSelectionChartProps {
    capacity: number;
    head: number;
    selectedRegionId?: string | null;
    onRegionSelect?: (regionId: string | null) => void;
    onSelectedPumpsChange?: (pumps: string[]) => void;
}

const PumpSelectionChart: React.FC<PumpSelectionChartProps> = ({
    capacity,
    head,
    selectedRegionId,
    onRegionSelect,
    onSelectedPumpsChange
}) => {
    const clickedRegion = PUMP_REGIONS.find(r => r.id === selectedRegionId) || null;

    const width = 600;
    const height = 450;
    const margin = { top: 40, right: 60, bottom: 60, left: 70 };

    const minLogX = 0; // log10(1)
    const maxLogX = 4; // log10(10000)
    const minLogY = 1; // log10(10)
    const maxLogY = 4; // log10(10000)

    const scaleX = (val: number) => {
        const logVal = Math.log10(Math.max(val, 1));
        return margin.left + ((logVal - minLogX) / (maxLogX - minLogX)) * (width - margin.left - margin.right);
    };

    const scaleY = (val: number) => {
        const logVal = Math.log10(Math.max(val, 10));
        return (height - margin.bottom) - ((logVal - minLogY) / (maxLogY - minLogY)) * (height - margin.top - margin.bottom);
    };

    const isInside = (point: Point, vs: Point[]) => {
        const x = Math.log10(point.x);
        const y = Math.log10(point.y);
        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            const xi = Math.log10(vs[i].x), yi = Math.log10(vs[i].y);
            const xj = Math.log10(vs[j].x), yj = Math.log10(vs[j].y);
            const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    };

    const checkInside = (p: { x: number, y: number }, region: PumpRegion) => {
        const flatVs = flattenPoints(region.points);
        if (!isInside(p, flatVs)) return false;

        // If inside this region, check if it's inside any of the excluded regions
        if (region.excludeIds) {
            for (const exId of region.excludeIds) {
                const exRegion = PUMP_REGIONS.find(r => r.id === exId);
                if (exRegion) {
                    const exFlatVs = flattenPoints(exRegion.points);
                    if (isInside(p, exFlatVs)) return false;
                }
            }
        }
        return true;
    };

    const selectedPumps = PUMP_REGIONS.filter(region => checkInside({ x: capacity, y: head }, region)).map(r => r.label);

    const getRegionPath = (region: PumpRegion) => {
        const pts = region.points;
        if (pts.length === 0) return '';

        let d = `M ${scaleX(pts[0].x)} ${scaleY(pts[0].y)}`;
        for (let i = 1; i < pts.length; i++) {
            if (pts[i].isCurve && pts[i].cx !== undefined && pts[i].cy !== undefined) {
                const cx = scaleX(pts[i].cx!);
                const cy = scaleY(pts[i].cy!);
                const x = scaleX(pts[i].x);
                const y = scaleY(pts[i].y);
                d += ` Q ${cx} ${cy}, ${x} ${y}`;
            } else {
                d += ` L ${scaleX(pts[i].x)} ${scaleY(pts[i].y)}`;
            }
        }
        d += ' Z';
        return d;
    };

    React.useEffect(() => {
        if (onSelectedPumpsChange) {
            onSelectedPumpsChange(selectedPumps);
        }
    }, [capacity, head, onSelectedPumpsChange]);

    const renderGridLines = () => {
        const lines = [];
        // X-axis log lines
        for (let i = 0; i <= 4; i++) {
            const x = scaleX(Math.pow(10, i));
            lines.push(
                <line key={`grid-x-${i}`} x1={x} y1={margin.top} x2={x} y2={height - margin.bottom} stroke="#e5e7eb" strokeWidth="2" />
            );
            if (i < 4) {
                for (let j = 2; j < 10; j++) {
                    const subX = scaleX(j * Math.pow(10, i));
                    lines.push(
                        <line key={`grid-x-${i}-${j}`} x1={subX} y1={margin.top} x2={subX} y2={height - margin.bottom} stroke="#f3f4f6" strokeWidth="1" />
                    );
                }
            }
        }
        // Y-axis log lines
        for (let i = 1; i <= 4; i++) {
            const y = scaleY(Math.pow(10, i));
            lines.push(
                <line key={`grid-y-${i}`} x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#e5e7eb" strokeWidth="2" />
            );
            if (i < 4) {
                for (let j = 2; j < 10; j++) {
                    const subY = scaleY(j * Math.pow(10, i));
                    lines.push(
                        <line key={`grid-y-${i}-${j}`} x1={margin.left} y1={subY} x2={width - margin.right} y2={subY} stroke="#f3f4f6" strokeWidth="1" />
                    );
                }
            }
        }
        return lines;
    };

    return (
        <div className="w-full bg-white rounded-xl shadow-lg p-4 flex flex-col items-center">
            {/* Top Selection Banner */}
            <div className={`w-full min-h-[48px] flex items-center justify-center p-3 rounded-lg border transition-all duration-300 ${clickedRegion
                ? 'bg-white shadow-sm border-gray-200'
                : 'bg-gray-50 border-dashed border-gray-200 opacity-60'
                }`}>
                {clickedRegion ? (
                    <div className="flex items-center gap-3 w-full justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-3 h-3 rounded-full shadow-inner border border-black/10"
                                style={{ backgroundColor: clickedRegion.color }}
                            ></div>
                            <span className="text-sm font-bold text-gray-800 tracking-tight">
                                {clickedRegion.label}
                            </span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRegionSelect?.(null);
                            }}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <span className="text-xs text-gray-400 font-medium italic">
                        Klik area pada grafik untuk melihat detail tipe pompa
                    </span>
                )}
            </div>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto font-sans"
                onClick={() => onRegionSelect?.(null)}
            >
                {/* Background Grid */}
                {renderGridLines()}

                {/* Masks for excluded areas */}
                <defs>
                    {PUMP_REGIONS.map(region => (
                        <mask key={`mask-${region.id}`} id={`mask-${region.id}`}>
                            {/* Base visibility: Transparent everywhere (black) */}
                            <rect x="0" y="0" width={width} height={height} fill="black" />
                            {/* Show only this region (white) */}
                            <path d={getRegionPath(region)} fill="white" />
                            {/* Subtract any excluded regions (black) */}
                            {region.excludeIds?.map(exId => {
                                const exRegion = PUMP_REGIONS.find(r => r.id === exId);
                                if (!exRegion) return null;
                                return <path key={`ex-${region.id}-${exId}`} d={getRegionPath(exRegion)} fill="black" />;
                            })}
                        </mask>
                    ))}
                </defs>

                {/* Regions */}
                {[...PUMP_REGIONS].reverse().map(region => (
                    <path
                        key={region.id}
                        d={getRegionPath(region)}
                        mask={`url(#mask-${region.id})`}
                        fill={clickedRegion?.id === region.id ? region.color.replace('0.2', '0.4').replace('0.1', '0.3') : region.color}
                        stroke={clickedRegion?.id === region.id ? region.color.replace('0.2', '0.8').replace('0.1', '0.6') : region.color.replace('0.2', '0.5').replace('0.1', '0.3')}
                        strokeWidth={clickedRegion?.id === region.id ? "2" : "1"}
                        className="transition-all hover:opacity-100 opacity-80 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRegionSelect?.(region.id);
                        }}
                    />
                ))}

                {/* Region Labels (Optional, but might make it too cluttered) */}

                {/* Axes */}
                <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#374151" strokeWidth="2" />
                <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#374151" strokeWidth="2" />

                {/* Labels X */}
                {[1, 10, 100, 1000, 10000].map(val => (
                    <text key={`lx-${val}`} x={scaleX(val)} y={height - margin.bottom + 20} textAnchor="middle" className="text-xs fill-gray-600">
                        {val.toLocaleString()}
                    </text>
                ))}
                <text x={width / 2} y={height - 10} textAnchor="middle" className="text-sm font-semibold fill-gray-900">
                    Capacity, gal/min
                </text>

                {/* Labels Y */}
                {[10, 100, 1000, 10000].map(val => (
                    <text key={`ly-${val}`} x={margin.left - 10} y={scaleY(val) + 4} textAnchor="end" className="text-xs fill-gray-600">
                        {val.toLocaleString()}
                    </text>
                ))}
                <text x={20} y={height / 2} transform={`rotate(-90 20 ${height / 2})`} textAnchor="middle" className="text-sm font-semibold fill-gray-900">
                    Total Head, ft
                </text>

                {/* The Dot */}
                {capacity > 0 && head > 0 && (
                    <circle
                        cx={scaleX(capacity)}
                        cy={scaleY(head)}
                        r="6"
                        fill="#ef4444"
                        stroke="white"
                        strokeWidth="2"
                        className="animate-pulse"
                    />
                )}

            </svg>
        </div>
    );
};

export default PumpSelectionChart;
