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

    // Isometric projection mapping: screenX = originX + (rotX - rotY) * cos(30), screenY = originY + (rotX + rotY) * sin(30) + zScale * z
    const isoScale = 2.4;
    const depthScale = 8.5; // Visual exaggeration for vertical sag

    const screenX = 280 + (rotX - rotY) * 2.1 * isoScale;
    const screenY = 160 + (rotX + rotY) * 1.1 * isoScale + (z * depthScale);

    return { screenX, screenY };
  };

  const isCritical = basin.maxTensileStrainMmPerM >= 3.0 || basin.maxSubsidenceSagCm >= 4.5;
  const isWarning = basin.maxTensileStrainMmPerM >= 1.5 || basin.maxSubsidenceSagCm >= 2.5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1c2842] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Boxes className="h-5 w-5 text-amber-400" />
              3D Subsidence Basin Digital Twin & Geotechnical Impact Modeler
            </h2>
            {isDemo && (
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-400 border border-amber-500/30">
                KNOTHE-BUDRYK MODEL
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Empirical 3D ground depression bowl & infrastructure strain radius derived from physical MPU6050 tilt + GPS
          </p>
        </div>

        {/* DGMS Overall Damage Rating Badge */}
        <div className={`rounded-xl border px-3.5 py-1.5 font-mono text-xs flex items-center gap-2.5 shadow-sm ${
          isCritical 
            ? 'border-rose-500/50 bg-rose-950/30 text-rose-300' 
            : isWarning 
            ? 'border-amber-500/50 bg-amber-950/30 text-amber-300' 
            : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
        }`}>
          {isCritical ? (
            <ShieldAlert className="h-4 w-4 text-rose-400 animate-pulse" />
          ) : isWarning ? (
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          )}
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">DGMS Status:</span>
            <span className="font-bold">{basin.dgmsOverallDamageClass.split(':')[0]}</span>
          </div>
        </div>
      </div>

      {/* Top 4 Mining Geotechnical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* 1. Max Subsidence Sag */}
        <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Max Basin Sag (S_max)</span>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-bold ${isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-white'}`}>
              {basin.maxSubsidenceSagCm.toFixed(1)} cm
            </span>
            <span className="text-xs text-slate-400">Slope: {basin.maxGroundSlopeDeg}°</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1c2842]">
            Central maximum trough depth
          </div>
        </div>

        {/* 2. Radius of Influence (R) */}
        <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Damage Radius (R)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-sky-400">{basin.radiusOfInfluenceM} m</span>
            <span className="text-xs text-slate-400">Draw: {basin.angleDrawDeg}°</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1c2842]">
            R = H · cot(γ) @ Depth {basin.extractionDepthM}m
          </div>
        </div>

        {/* 3. Maximum Tensile Strain */}
        <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Max Tensile Strain (ε)</span>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-bold ${basin.maxTensileStrainMmPerM >= 2.0 ? 'text-rose-400' : 'text-amber-400'}`}>
              {basin.maxTensileStrainMmPerM} mm/m
            </span>
            <span className="text-xs text-slate-400">Limit: 2.0</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1c2842]">
            Derived from MPU6050 tilt curvature
          </div>
        </div>

        {/* 4. Caved Goaf Void Volume */}
        <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm space-y-1">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Goaf Void Volume (V)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-purple-400">{basin.cavedGoafVolumeM3} m³</span>
            <span className="text-xs text-slate-400">Area: {basin.affectedSurfaceAreaM2}m²</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1c2842]">
            3D integrated void depression volume
          </div>
        </div>
      </div>

      {/* Main 3D Digital Twin Viewer & Geotechnical Formula Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left 3D Digital Twin Wireframe Mesh Canvas (7 cols) */}
        <div className="xl:col-span-7 rounded-xl border border-[#1c2842] bg-[#10192d] p-5 shadow-sm space-y-3">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c2842] pb-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Perspective Mode:</span>
              <div className="inline-flex rounded-md bg-[#070a12] p-0.5 border border-[#1c2842]">
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${viewMode === '3d' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  3D Isometric
                </button>
                <button
                  onClick={() => setViewMode('contour')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${viewMode === 'contour' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  2D Strain Contours
                </button>
                <button
                  onClick={() => setViewMode('profile')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${viewMode === 'profile' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Knothe Curve
                </button>
              </div>
            </div>

            {viewMode === '3d' && (
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-[11px] text-slate-400">Orbit Angle:</span>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={rotationAngle}
                  onChange={(e) => setRotationAngle(Number(e.target.value))}
                  className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-[11px] text-amber-400 w-6 font-bold">{rotationAngle}°</span>
              </div>
            )}
          </div>

          {/* 3D Wireframe SVG Canvas */}
          <div className="relative h-[340px] w-full rounded-lg bg-[#070a12] border border-[#1c2842] overflow-hidden flex items-center justify-center p-2">
            {viewMode === '3d' ? (
              <svg viewBox="0 0 560 320" className="w-full h-full">
                <defs>
                  <radialGradient id="goafCenterGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#070a12" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Ground Reference Grid Base */}
                <ellipse cx="280" cy="180" rx="220" ry="110" fill="none" stroke="#1c2842" strokeDasharray="3 3" />
                <ellipse cx="280" cy="180" rx="140" ry="70" fill="url(#goafCenterGlow)" stroke="#ef4444" strokeWidth="1" opacity="0.6" />

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
                      stroke="#2a3b5e"
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
                      stroke="#1e293b"
                      strokeWidth="1"
                      opacity="0.7"
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
                      <circle r="8" fill="rgba(245, 158, 11, 0.3)" className="animate-ping" />
                      <circle r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                      <text x="8" y="-4" fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        {roverId} GPS Trough Center
                      </text>
                    </g>
                  );
                })()}

                {/* Dimension Legend */}
                <text x="15" y="25" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                  3D Digital Twin: S(r) = {basin.maxSubsidenceSagCm}cm · exp(-π·r²/{basin.radiusOfInfluenceM}²)
                </text>
                <text x="15" y="40" fill="#64748b" fontSize="9" fontFamily="monospace">
                  Overburden Strata H = {basin.extractionDepthM}m | Inclinometer Tilt = {basin.maxGroundSlopeDeg}°
                </text>
              </svg>
            ) : viewMode === 'contour' ? (
              /* 2D Contour View */
              <svg viewBox="0 0 500 300" className="w-full h-full">
                <circle cx="250" cy="150" r="130" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="250" y="30" fill="#10b981" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  Safe Outer Boundary (r = {basin.radiusOfInfluenceM}m)
                </text>

                <circle cx="250" cy="150" r="85" fill="none" stroke="#f59e0b" strokeWidth="2" />
                <text x="250" y="75" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle">
                  Warning Tension Zone (r = {(basin.radiusOfInfluenceM * 0.65).toFixed(0)}m, ε = 1.5 mm/m)
                </text>

                <circle cx="250" cy="150" r="45" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="2.5" />
                <text x="250" y="145" fill="#ef4444" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  Critical Goaf Core Sag ({basin.maxSubsidenceSagCm} cm)
                </text>

                <circle cx="250" cy="150" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
              </svg>
            ) : (
              /* Knothe Cross-Section Profile */
              <svg viewBox="0 0 500 300" className="w-full h-full">
                <line x1="40" y1="60" x2="460" y2="60" stroke="#475569" strokeDasharray="3 3" />
                <text x="40" y="50" fill="#64748b" fontSize="9" fontFamily="monospace">Surface Baseline (0.0 cm)</text>

                <path
                  d={`M 40 60 Q 250 ${60 + basin.maxSubsidenceSagCm * 25} 460 60`}
                  fill="none"
                  stroke={isCritical ? "#ef4444" : "#f59e0b"}
                  strokeWidth="3"
                />

                <path
                  d={`M 40 60 Q 250 ${60 + basin.maxSubsidenceSagCm * 25} 460 60 L 460 260 L 40 260 Z`}
                  fill="url(#profileGrad)"
                  opacity="0.3"
                />

                <defs>
                  <linearGradient id="profileGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isCritical ? "#ef4444" : "#f59e0b"} />
                    <stop offset="100%" stopColor="#070a12" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <circle cx="250" cy={60 + basin.maxSubsidenceSagCm * 25} r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                <text x="250" y={80 + basin.maxSubsidenceSagCm * 25} fill="#ffffff" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  S_max = {basin.maxSubsidenceSagCm} cm
                </text>
              </svg>
            )}
          </div>
        </div>

        {/* Right Knothe Geotechnical HUD & Equation Matrix (5 cols) */}
        <div className="xl:col-span-5 space-y-4 font-mono text-xs">
          {/* Scientific Equation Block */}
          <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-[#1c2842] pb-2">
              <Compass className="h-3.5 w-3.5 text-amber-400" />
              Knothe Subsidence Formulation
            </h4>

            <div className="rounded bg-[#070a12] p-2.5 border border-[#1c2842] text-amber-300 space-y-1">
              <div className="text-[11px] font-bold">S(x, y) = S_max · exp(-π · r² / R²)</div>
              <div className="text-[10px] text-slate-400">
                Ground Slope (Tilt): i = tan(θ_mpu) = {basin.maxGroundSlopeDeg}°
              </div>
              <div className="text-[10px] text-slate-400">
                Influence Radius: R = {basin.extractionDepthM}m · cot({basin.angleDrawDeg}°) = {basin.radiusOfInfluenceM} m
              </div>
            </div>

            <div className="space-y-1.5 text-slate-300 text-[11px]">
              <div className="flex justify-between border-b border-[#1c2842]/60 pb-1">
                <span className="text-slate-400">Overburden Rock Strata:</span>
                <span className="text-white font-semibold">Barakar Sandstone & Shale</span>
              </div>
              <div className="flex justify-between border-b border-[#1c2842]/60 pb-1">
                <span className="text-slate-400">Draw Angle (γ):</span>
                <span className="text-white font-semibold">{basin.angleDrawDeg}° (Indian Standard)</span>
              </div>
              <div className="flex justify-between border-b border-[#1c2842]/60 pb-1">
                <span className="text-slate-400">Horizontal Displacement Coeff:</span>
                <span className="text-sky-400 font-semibold">B = 0.35 · R = {(0.35 * basin.radiusOfInfluenceM).toFixed(1)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Goaf Caving Ratio:</span>
                <span className="text-purple-300 font-semibold">Bulking Factor 1.32</span>
              </div>
            </div>
          </div>

          {/* DGMS Damage Severity Classification Guide */}
          <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-4 shadow-sm space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 border-b border-[#1c2842] pb-2">
              <HardHat className="h-3.5 w-3.5 text-sky-400" />
              DGMS Surface Damage Classification
            </h4>

            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between p-1.5 rounded bg-[#0c1222] border border-[#1c2842]">
                <span className="text-emerald-400 font-bold">Class 0 (&lt; 0.5 mm/m)</span>
                <span className="text-slate-400">No damage to surface structures</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-[#0c1222] border border-[#1c2842]">
                <span className="text-sky-400 font-bold">Class I (0.5 - 1.0 mm/m)</span>
                <span className="text-slate-400">Slight plaster micro-fissuring</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-[#0c1222] border border-[#1c2842]">
                <span className="text-amber-400 font-bold">Class II (1.0 - 2.0 mm/m)</span>
                <span className="text-slate-400">Wall cracks, pipe flexure</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-[#0c1222] border border-[#1c2842]">
                <span className="text-rose-400 font-bold">Class III &gt; 2.0 mm/m</span>
                <span className="text-slate-400">Structural rupture, evacuation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Surface Infrastructure Vulnerability Assessment Table */}
      <div className="rounded-xl border border-[#1c2842] bg-[#10192d] p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c2842] pb-3">
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-400" />
              Real-Time Surface Infrastructure Strain & Vulnerability Audit
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Live damage prediction for public assets located within the Knothe Radius of Influence (R = {basin.radiusOfInfluenceM}m)
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {basin.infrastructureAssets.length} Monitored Assets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#070a12] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1c2842]">
              <tr>
                <th className="py-2.5 px-3">Infrastructure Asset</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Distance from Trough</th>
                <th className="py-2.5 px-3">Induced Strain (ε)</th>
                <th className="py-2.5 px-3">Predicted Tilt</th>
                <th className="py-2.5 px-3">DGMS Damage Class</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Action Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2842]/80 text-slate-300">
              {basin.infrastructureAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                    {asset.type === 'ROAD' && <Car className="h-3.5 w-3.5 text-sky-400" />}
                    {asset.type === 'RAILWAY' && <Train className="h-3.5 w-3.5 text-amber-400" />}
                    {asset.type === 'BUILDING' && <Building2 className="h-3.5 w-3.5 text-rose-400" />}
                    {asset.type === 'POWER_TOWER' && <Zap className="h-3.5 w-3.5 text-purple-400" />}
                    <span>{asset.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{asset.type}</td>
                  <td className="py-3 px-3 text-sky-300 font-bold">{asset.distanceFromCenterM} m</td>
                  <td className="py-3 px-3 font-bold">
                    <span className={asset.currentStrainMmPerM >= asset.criticalStrainLimitMmPerM ? 'text-rose-400' : 'text-amber-400'}>
                      {asset.currentStrainMmPerM} mm/m
                    </span>
                    <span className="text-[10px] text-slate-500 block">Limit: {asset.criticalStrainLimitMmPerM}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{asset.predictedTiltDeg}°</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      asset.dgmsDamageClass.includes('CLASS_IV') || asset.dgmsDamageClass.includes('CLASS_III')
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : asset.dgmsDamageClass.includes('CLASS_II') || asset.dgmsDamageClass.includes('CLASS_I')
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {asset.dgmsDamageClass.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      asset.status === 'DANGER' ? 'bg-red-600 text-white' : asset.status === 'CAUTION' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-300 max-w-[280px]">
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
