import React, { useMemo, useState } from 'react';
import { SensorData, GroundBaseline } from '../../types/sensor';
import { calculateGeotechnicalBasin } from '../../services/geotechnicalEngine';
import { 
  Boxes, 
  Layers, 
  CircleDot, 
  Ruler, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  HardHat, 
  Compass, 
  Building2, 
  Train, 
  Car, 
  Zap, 
  Info,
  ChevronRight,
  Eye
} from 'lucide-react';

export interface SubsidenceBasinTabProps {
  currentData: SensorData | null;
  baseline: GroundBaseline;
  roverId: string;
  isDemo?: boolean;
}

export const SubsidenceBasinTab: React.FC<SubsidenceBasinTabProps> = ({
  currentData,
  baseline,
  roverId,
  isDemo = false
}) => {
  const [viewMode, setViewMode] = useState<'3d' | 'contour' | 'profile'>('3d');
  const [rotationAngle, setRotationAngle] = useState<number>(35);

  // Compute Geotechnical Basin Model
  const basin = useMemo(() => {
    return calculateGeotechnicalBasin(currentData, baseline);
  }, [currentData, baseline]);

  // Project 3D Grid points to 2D Isometric Coordinates for SVG rendering
  const isoProject = (x: number, y: number, z: number) => {
    const rad = (rotationAngle * Math.PI) / 180;
    const rotX = x * Math.cos(rad) - y * Math.sin(rad);
    const rotY = x * Math.sin(rad) + y * Math.cos(rad);

    // Isometric projection mapping
    const isoScale = 2.4;
    const depthScale = 8.5; // Visual exaggeration for vertical sag

    const screenX = 280 + (rotX - rotY) * 2.1 * isoScale;
    const screenY = 160 + (rotX + rotY) * 1.1 * isoScale + (z * depthScale);

    return { screenX, screenY };
  };

  const isCritical = basin.maxTensileStrainMmPerM >= 3.0 || basin.maxSubsidenceSagCm >= 4.5;
  const isWarning = basin.maxTensileStrainMmPerM >= 1.5 || basin.maxSubsidenceSagCm >= 2.5;

  return (
    <div className="space-y-3">
      {/* Top Geotechnical Summary & DGMS Rating */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-amber-50 text-amber-600 border border-amber-100">
            <Boxes className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-xs sm:text-sm">3D Subsidence Basin Digital Twin & Impact Modeler</span>
            <span className="text-slate-500 text-[10px] sm:text-[11px]">Knothe-Budryk Ground Depression Curve • MPU6050 Slope + GPS Integration</span>
          </div>
        </div>

        {/* DGMS Overall Damage Rating Badge */}
        <div className={`rounded-lg border px-2.5 py-1 font-mono text-xs flex items-center gap-1.5 ${
          isCritical 
            ? 'border-rose-200 bg-rose-50 text-rose-800' 
            : isWarning 
            ? 'border-amber-200 bg-amber-50 text-amber-800' 
            : 'border-emerald-200 bg-emerald-50 text-emerald-800'
        }`}>
          {isCritical ? (
            <ShieldAlert className="h-3.5 w-3.5 text-rose-600 animate-pulse" />
          ) : isWarning ? (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          )}
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-semibold">DGMS Risk:</span>
            <span className="font-bold text-xs">{basin.dgmsOverallDamageClass.split(':')[0]}</span>
          </div>
        </div>
      </div>

      {/* Top 4 Mining Geotechnical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {/* 1. Max Subsidence Sag */}
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs space-y-0.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Max Basin Sag (S_max)</span>
          <div className="flex items-baseline justify-between">
            <span className={`text-xl font-bold ${isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-slate-900'}`}>
              {basin.maxSubsidenceSagCm.toFixed(1)} cm
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Slope: {basin.maxGroundSlopeDeg}°</span>
          </div>
          <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-100 font-medium">
            Central maximum trough depth
          </div>
        </div>

        {/* 2. Radius of Influence (R) */}
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs space-y-0.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Damage Radius (R)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-sky-600">{basin.radiusOfInfluenceM} m</span>
            <span className="text-[11px] text-slate-500 font-medium">Draw: {basin.angleDrawDeg}°</span>
          </div>
          <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-100 font-medium">
            R = H · cot(γ) @ Depth {basin.extractionDepthM}m
          </div>
        </div>

        {/* 3. Maximum Tensile Strain */}
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs space-y-0.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Max Tensile Strain (ε)</span>
          <div className="flex items-baseline justify-between">
            <span className={`text-xl font-bold ${basin.maxTensileStrainMmPerM >= 2.0 ? 'text-rose-600' : 'text-amber-600'}`}>
              {basin.maxTensileStrainMmPerM} mm/m
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Limit: 2.0</span>
          </div>
          <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-100 font-medium">
            Derived from MPU6050 tilt curvature
          </div>
        </div>

        {/* 4. Caved Goaf Void Volume */}
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs space-y-0.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Goaf Void Volume (V)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-purple-600">{basin.cavedGoafVolumeM3} m³</span>
            <span className="text-[11px] text-slate-500 font-medium">Area: {basin.affectedSurfaceAreaM2}m²</span>
          </div>
          <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-100 font-medium">
            3D integrated void depression
          </div>
        </div>
      </div>

      {/* Main 3D Digital Twin Viewer & Geotechnical Formula Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left 3D Digital Twin Wireframe Mesh Canvas (7 cols) */}
        <div className="xl:col-span-7 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs space-y-2.5">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 pb-2 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-semibold text-[11px]">Mode:</span>
              <div className="inline-flex rounded-md bg-slate-100 p-0.5 border border-slate-200">
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${viewMode === '3d' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  3D Isometric
                </button>
                <button
                  onClick={() => setViewMode('contour')}
                  className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${viewMode === 'contour' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  2D Contours
                </button>
                <button
                  onClick={() => setViewMode('profile')}
                  className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${viewMode === 'profile' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Knothe Curve
                </button>
              </div>
            </div>

            {viewMode === '3d' && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="text-[10px] font-semibold">Orbit:</span>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={rotationAngle}
                  onChange={(e) => setRotationAngle(Number(e.target.value))}
                  className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <span className="text-[10px] text-amber-700 w-5 font-bold">{rotationAngle}°</span>
              </div>
            )}
          </div>

          {/* 3D Wireframe SVG Canvas */}
          <div className="relative h-[250px] sm:h-[270px] w-full rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-1.5">
            {viewMode === '3d' ? (
              <svg viewBox="0 0 560 320" className="w-full h-full">
                <defs>
                  <radialGradient id="goafCenterGlowLight" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Ground Reference Grid Base */}
                <ellipse cx="280" cy="180" rx="220" ry="110" fill="none" stroke="#cbd5e1" strokeDasharray="3 3" />
                <ellipse cx="280" cy="180" rx="140" ry="70" fill="url(#goafCenterGlowLight)" stroke="#dc2626" strokeWidth="1" opacity="0.6" />

                {/* 3D Wireframe Rows and Columns */}
                {basin.basinGrid3D.map((row, i) => {
                  const pointsStr = row
                    .map((pt) => {
                      const { screenX, screenY } = isoProject(pt.x, pt.y, pt.zDepthCm);
                      return `${screenX},${screenY}`;
                    })
                    .join(' ');

                  return (
                    <polyline
                      key={`row-${i}`}
                      points={pointsStr}
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="1"
                      opacity="0.85"
                    />
                  );
                })}

                {/* Cross Columns */}
                {basin.basinGrid3D[0].map((_, colIdx) => {
                  const pointsStr = basin.basinGrid3D
                    .map((row) => {
                      const pt = row[colIdx];
                      const { screenX, screenY } = isoProject(pt.x, pt.y, pt.zDepthCm);
                      return `${screenX},${screenY}`;
                    })
                    .join(' ');

                  return (
                    <polyline
                      key={`col-${colIdx}`}
                      points={pointsStr}
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="1"
                      opacity="0.75"
                    />
                  );
                })}

                {/* Highlighted Sinking Depression Basin Points */}
                {basin.basinGrid3D.map((row, i) =>
                  row.map((pt, j) => {
                    if (pt.zDepthCm >= 0.8) {
                      const { screenX, screenY } = isoProject(pt.x, pt.y, pt.zDepthCm);
                      return (
                        <circle
                          key={`pt-${i}-${j}`}
                          cx={screenX}
                          cy={screenY}
                          r={pt.zDepthCm >= 3.0 ? 3 : 2}
                          fill={pt.normalizedColor}
                          stroke="#ffffff"
                          strokeWidth="0.5"
                        />
                      );
                    }
                    return null;
                  })
                )}

                {/* Rover Position Marker at Center */}
                {(() => {
                  const { screenX, screenY } = isoProject(0, 0, basin.maxSubsidenceSagCm);
                  return (
                    <g transform={`translate(${screenX}, ${screenY})`}>
                      <circle r="8" fill="rgba(217, 119, 6, 0.3)" className="animate-ping" />
                      <circle r="5" fill="#d97706" stroke="#ffffff" strokeWidth="1.5" />
                      <text x="8" y="-4" fill="#b45309" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        {roverId} GPS Trough Center
                      </text>
                    </g>
                  );
                })()}

                {/* Dimension Legend */}
                <text x="15" y="25" fill="#475569" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  3D Digital Twin: S(r) = {basin.maxSubsidenceSagCm}cm · exp(-π·r²/{basin.radiusOfInfluenceM}²)
                </text>
                <text x="15" y="40" fill="#64748b" fontSize="9" fontFamily="monospace">
                  Overburden Strata H = {basin.extractionDepthM}m | Inclinometer Tilt = {basin.maxGroundSlopeDeg}°
                </text>
              </svg>
            ) : viewMode === 'contour' ? (
              /* 2D Contour View */
              <svg viewBox="0 0 500 300" className="w-full h-full">
                <circle cx="250" cy="150" r="130" fill="none" stroke="#059669" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="250" y="30" fill="#047857" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  Safe Outer Boundary (r = {basin.radiusOfInfluenceM}m)
                </text>

                <circle cx="250" cy="150" r="85" fill="none" stroke="#d97706" strokeWidth="2" />
                <text x="250" y="75" fill="#b45309" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  Warning Tension Zone (r = {(basin.radiusOfInfluenceM * 0.65).toFixed(0)}m, ε = 1.5 mm/m)
                </text>

                <circle cx="250" cy="150" r="45" fill="rgba(220, 38, 38, 0.15)" stroke="#dc2626" strokeWidth="2.5" />
                <text x="250" y="145" fill="#dc2626" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  Critical Goaf Core Sag ({basin.maxSubsidenceSagCm} cm)
                </text>

                <circle cx="250" cy="150" r="5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
              </svg>
            ) : (
              /* Knothe Cross-Section Profile */
              <svg viewBox="0 0 500 300" className="w-full h-full">
                <line x1="40" y1="60" x2="460" y2="60" stroke="#94a3b8" strokeDasharray="3 3" />
                <text x="40" y="50" fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="bold">Surface Baseline (0.0 cm)</text>

                <path
                  d={`M 40 60 Q 250 ${60 + basin.maxSubsidenceSagCm * 25} 460 60`}
                  fill="none"
                  stroke={isCritical ? "#dc2626" : "#d97706"}
                  strokeWidth="3"
                />

                <path
                  d={`M 40 60 Q 250 ${60 + basin.maxSubsidenceSagCm * 25} 460 60 L 460 260 L 40 260 Z`}
                  fill="url(#profileGradLight)"
                  opacity="0.2"
                />

                <defs>
                  <linearGradient id="profileGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isCritical ? "#dc2626" : "#d97706"} />
                    <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <circle cx="250" cy={60 + basin.maxSubsidenceSagCm * 25} r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                <text x="250" y={80 + basin.maxSubsidenceSagCm * 25} fill="#0f172a" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  S_max = {basin.maxSubsidenceSagCm} cm
                </text>
              </svg>
            )}
          </div>
        </div>

        {/* Right Knothe Geotechnical HUD & Equation Matrix (5 cols) */}
        <div className="xl:col-span-5 space-y-3 font-mono text-xs">
          {/* Scientific Equation Block */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Compass className="h-3.5 w-3.5 text-amber-600" />
              Knothe Subsidence Formulation
            </h4>

            <div className="rounded-lg bg-slate-50 p-2 border border-slate-200 text-amber-800 space-y-0.5">
              <div className="text-[10px] sm:text-[11px] font-bold">S(x, y) = S_max · exp(-π · r² / R²)</div>
              <div className="text-[9px] text-slate-600">
                Ground Slope (Tilt): i = tan(θ_mpu) = {basin.maxGroundSlopeDeg}°
              </div>
              <div className="text-[9px] text-slate-600">
                Influence Radius: R = {basin.extractionDepthM}m · cot({basin.angleDrawDeg}°) = {basin.radiusOfInfluenceM} m
              </div>
            </div>

            <div className="space-y-1 text-slate-700 text-[10px]">
              <div className="flex justify-between border-b border-slate-100 pb-0.5">
                <span className="text-slate-500">Overburden Strata:</span>
                <span className="text-slate-900 font-semibold">Barakar Sandstone & Shale</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-0.5">
                <span className="text-slate-500">Draw Angle (γ):</span>
                <span className="text-slate-900 font-semibold">{basin.angleDrawDeg}° (Indian Standard)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-0.5">
                <span className="text-slate-500">Horizontal Displacement:</span>
                <span className="text-sky-700 font-semibold">B = 0.35 · R = {(0.35 * basin.radiusOfInfluenceM).toFixed(1)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Goaf Caving Ratio:</span>
                <span className="text-purple-700 font-semibold">Bulking Factor 1.32</span>
              </div>
            </div>
          </div>

          {/* DGMS Damage Severity Classification Guide */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <HardHat className="h-3.5 w-3.5 text-sky-600" />
              DGMS Surface Damage Classification
            </h4>

            <div className="space-y-1 text-[9px]">
              <div className="flex items-center justify-between p-1 rounded bg-slate-50 border border-slate-200">
                <span className="text-emerald-700 font-bold">Class 0 (&lt; 0.5 mm/m)</span>
                <span className="text-slate-500 font-medium">No damage to surface structures</span>
              </div>
              <div className="flex items-center justify-between p-1 rounded bg-slate-50 border border-slate-200">
                <span className="text-sky-700 font-bold">Class I (0.5 - 1.0 mm/m)</span>
                <span className="text-slate-500 font-medium">Slight plaster micro-fissuring</span>
              </div>
              <div className="flex items-center justify-between p-1 rounded bg-slate-50 border border-slate-200">
                <span className="text-amber-700 font-bold">Class II (1.0 - 2.0 mm/m)</span>
                <span className="text-slate-500 font-medium">Wall cracks, pipe flexure</span>
              </div>
              <div className="flex items-center justify-between p-1 rounded bg-slate-50 border border-slate-200">
                <span className="text-rose-700 font-bold">Class III &gt; 2.0 mm/m</span>
                <span className="text-slate-500 font-medium">Structural rupture, evacuation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Surface Infrastructure Vulnerability Assessment Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-amber-600" />
              Real-Time Surface Infrastructure Strain & Vulnerability Audit
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              Live damage prediction for public assets located within Knothe Radius of Influence (R = {basin.radiusOfInfluenceM}m)
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 font-semibold">
            {basin.infrastructureAssets.length} Monitored Assets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[9px] border-b border-slate-200">
              <tr>
                <th className="py-2 px-2.5">Infrastructure Asset</th>
                <th className="py-2 px-2.5">Type</th>
                <th className="py-2 px-2.5">Distance</th>
                <th className="py-2 px-2.5">Induced Strain (ε)</th>
                <th className="py-2 px-2.5">Predicted Tilt</th>
                <th className="py-2 px-2.5">DGMS Class</th>
                <th className="py-2 px-2.5">Status</th>
                <th className="py-2 px-2.5">Action Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
              {basin.infrastructureAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-2.5 font-semibold text-slate-900 flex items-center gap-1.5">
                    {asset.type === 'ROAD' && <Car className="h-3 w-3 text-sky-600" />}
                    {asset.type === 'RAILWAY' && <Train className="h-3 w-3 text-amber-600" />}
                    {asset.type === 'BUILDING' && <Building2 className="h-3 w-3 text-rose-600" />}
                    {asset.type === 'POWER_TOWER' && <Zap className="h-3 w-3 text-purple-600" />}
                    <span>{asset.name}</span>
                  </td>
                  <td className="py-2 px-2.5 text-slate-500 text-[10px]">{asset.type}</td>
                  <td className="py-2 px-2.5 text-sky-700 font-bold">{asset.distanceFromCenterM} m</td>
                  <td className="py-2 px-2.5 font-bold">
                    <span className={asset.currentStrainMmPerM >= asset.criticalStrainLimitMmPerM ? 'text-rose-700' : 'text-amber-700'}>
                      {asset.currentStrainMmPerM} mm/m
                    </span>
                    <span className="text-[9px] text-slate-400 block font-normal">Limit: {asset.criticalStrainLimitMmPerM}</span>
                  </td>
                  <td className="py-2 px-2.5 text-slate-700">{asset.predictedTiltDeg}°</td>
                  <td className="py-2 px-2.5">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      asset.dgmsDamageClass.includes('CLASS_IV') || asset.dgmsDamageClass.includes('CLASS_III')
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : asset.dgmsDamageClass.includes('CLASS_II') || asset.dgmsDamageClass.includes('CLASS_I')
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {asset.dgmsDamageClass.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2 px-2.5">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      asset.status === 'DANGER' ? 'bg-red-600 text-white' : asset.status === 'CAUTION' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-[10px] text-slate-600 max-w-[260px]">
                    {asset.mitigationAction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
