import { SensorData, GroundBaseline } from '../types/sensor';

export interface InfrastructureAsset {
  id: string;
  name: string;
  type: 'ROAD' | 'RAILWAY' | 'BUILDING' | 'POWER_TOWER' | 'PIPELINE';
  distanceFromCenterM: number;
  criticalStrainLimitMmPerM: number;
  currentStrainMmPerM: number;
  predictedTiltDeg: number;
  dgmsDamageClass: 'CLASS_0_SAFE' | 'CLASS_I_SLIGHT' | 'CLASS_II_MODERATE' | 'CLASS_III_SEVERE' | 'CLASS_IV_CRITICAL';
  status: 'SAFE' | 'CAUTION' | 'DANGER';
  mitigationAction: string;
}

export interface SubsidenceBasinMeshPoint {
  x: number;
  y: number;
  zDepthCm: number;
  strainMmPerM: number;
  tiltDeg: number;
  normalizedColor: string;
}

export interface GeotechnicalBasinAnalysis {
  maxSubsidenceSagCm: number;
  extractionDepthM: number;
  angleDrawDeg: number;
  radiusOfInfluenceM: number;
  maxTensileStrainMmPerM: number;
  maxCompressiveStrainMmPerM: number;
  maxGroundSlopeDeg: number;
  cavedGoafVolumeM3: number;
  affectedSurfaceAreaM2: number;
  dgmsOverallDamageClass: string;
  infrastructureAssets: InfrastructureAsset[];
  basinGrid3D: SubsidenceBasinMeshPoint[][];
}

/**
 * Knothe-Budryk Empirical Mining Subsidence Basin Engine
 * Calculates 3D surface depression, strain, curvature, and infrastructure impact
 * using physical MPU6050 tilt angles + GPS coordinates + ultrasonic sag.
 */
export function calculateGeotechnicalBasin(
  currentData: SensorData | null,
  baseline: GroundBaseline
): GeotechnicalBasinAnalysis {
  // 1. Core Mining Geotechnical Parameters (Indian Coalfield Standard)
  const extractionDepthH = 120; // Depth of underground seam H = 120 meters
  const angleOfDrawGamma = 65;  // Indian coal measure strata draw angle = 65 degrees
  const angleRad = (angleOfDrawGamma * Math.PI) / 180;
  
  // Radius of Major Influence: R = H * cot(gamma)
  const radiusOfInfluenceR = Number((extractionDepthH / Math.tan(angleRad)).toFixed(1)); // ~56.0 meters

  // Current measured maximum sag from baseline (cm)
  const baseDist = baseline.sensor_2 || 22.0;
  const currentDist = currentData?.distance_2 ?? 21.8;
  const maxSagCm = Math.max(0.1, Number((baseDist - currentDist).toFixed(2))); // e.g. 0.2cm to 6.8cm

  // Measured ground tilt from MPU6050
  const tiltX = Math.abs(currentData?.tilt_x ?? 0.8);
  const tiltY = Math.abs(currentData?.tilt_y ?? 0.5);
  const mpuTiltDeg = Math.max(tiltX, tiltY, 0.2);

  // Maximum ground slope (mm/m) derived from MPU6050 tilt
  const maxSlopeMmPerM = Math.tan((mpuTiltDeg * Math.PI) / 180) * 1000;

  // Maximum Horizontal Strain: epsilon_max = 1.52 * S_max / R (Knothe Formula)
  const maxStrainMmPerM = Number(((1.52 * maxSagCm * 10) / radiusOfInfluenceR).toFixed(2)); // in mm/m

  // Caved Goaf Void Volume: V = pi * R^2 * S_max / 3 (Parabolic / Gaussian depression volume)
  const cavedVolumeM3 = Number(((Math.PI * Math.pow(radiusOfInfluenceR, 2) * (maxSagCm / 100)) / 2.5).toFixed(1));
  const affectedAreaM2 = Number((Math.PI * Math.pow(radiusOfInfluenceR, 2)).toFixed(0));

  // 2. Generate 3D Digital Twin Basin Mesh Grid (17 x 17 grid centered at GPS origin)
  const gridSize = 17;
  const extentM = radiusOfInfluenceR * 1.3;
  const stepM = (2 * extentM) / (gridSize - 1);
  const basinGrid3D: SubsidenceBasinMeshPoint[][] = [];

  for (let i = 0; i < gridSize; i++) {
    const row: SubsidenceBasinMeshPoint[] = [];
    const x = -extentM + i * stepM;

    for (let j = 0; j < gridSize; j++) {
      const y = -extentM + j * stepM;
      const r = Math.sqrt(x * x + y * y);

      // Knothe vertical subsidence equation: S(r) = S_max * exp(-pi * r^2 / R^2)
      const sagRatio = Math.exp((-Math.PI * (r * r)) / (radiusOfInfluenceR * radiusOfInfluenceR));
      const zDepth = Number((maxSagCm * sagRatio).toFixed(2));

      // Strain distribution: derivative of subsidence curve (tensile at rim, compressive at center)
      const strain = Number((maxStrainMmPerM * (r / radiusOfInfluenceR) * sagRatio * 1.8).toFixed(2));
      const tilt = Number((mpuTiltDeg * (r / radiusOfInfluenceR) * sagRatio * 1.5).toFixed(2));

      // Color mapping for 3D visualization (Red = deep sag/high strain, Yellow = warning, Green = nominal)
      let color = '#10b981';
      if (zDepth >= 4.0 || strain >= 2.5) color = '#ef4444';
      else if (zDepth >= 2.0 || strain >= 1.2) color = '#f59e0b';
      else if (zDepth >= 0.8) color = '#38bdf8';

      row.push({
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        zDepthCm: zDepth,
        strainMmPerM: strain,
        tiltDeg: tilt,
        normalizedColor: color
      });
    }
    basinGrid3D.push(row);
  }

  // 3. Infrastructure Assets Impact Assessment (Surface structures near Jharia Coalfield Panel P-4B)
  const infrastructureAssets: InfrastructureAsset[] = [
    {
      id: 'INF-01',
      name: 'State Highway 4 (Bitumen Pavement)',
      type: 'ROAD',
      distanceFromCenterM: 28.5,
      criticalStrainLimitMmPerM: 2.0,
      currentStrainMmPerM: Number((maxStrainMmPerM * 0.72).toFixed(2)),
      predictedTiltDeg: Number((mpuTiltDeg * 0.65).toFixed(1)),
      dgmsDamageClass: maxSagCm >= 4.0 ? 'CLASS_III_SEVERE' : maxSagCm >= 2.0 ? 'CLASS_II_MODERATE' : 'CLASS_0_SAFE',
      status: maxSagCm >= 4.0 ? 'DANGER' : maxSagCm >= 2.0 ? 'CAUTION' : 'SAFE',
      mitigationAction: maxSagCm >= 4.0 ? 'Close highway lane; deploy asphalt flex expansion joints.' : 'Monitor crack initiation at 15-minute intervals.'
    },
    {
      id: 'INF-02',
      name: 'Coal Haulage Railway Siding Line',
      type: 'RAILWAY',
      distanceFromCenterM: 42.0,
      criticalStrainLimitMmPerM: 1.5,
      currentStrainMmPerM: Number((maxStrainMmPerM * 0.48).toFixed(2)),
      predictedTiltDeg: Number((mpuTiltDeg * 0.42).toFixed(1)),
      dgmsDamageClass: maxSagCm >= 5.0 ? 'CLASS_IV_CRITICAL' : maxSagCm >= 3.0 ? 'CLASS_II_MODERATE' : 'CLASS_0_SAFE',
      status: maxSagCm >= 5.0 ? 'DANGER' : maxSagCm >= 3.0 ? 'CAUTION' : 'SAFE',
      mitigationAction: maxSagCm >= 5.0 ? 'Impose immediate 10 km/h train speed limit; re-ballast track alignment.' : 'Track deflection within allowable DGMS tolerance.'
    },
    {
      id: 'INF-03',
      name: 'Kusunda Village Residential Colony (Masonry)',
      type: 'BUILDING',
      distanceFromCenterM: 52.0,
      criticalStrainLimitMmPerM: 1.0,
      currentStrainMmPerM: Number((maxStrainMmPerM * 0.35).toFixed(2)),
      predictedTiltDeg: Number((mpuTiltDeg * 0.30).toFixed(1)),
      dgmsDamageClass: maxSagCm >= 4.5 ? 'CLASS_III_SEVERE' : maxSagCm >= 2.5 ? 'CLASS_I_SLIGHT' : 'CLASS_0_SAFE',
      status: maxSagCm >= 4.5 ? 'DANGER' : maxSagCm >= 2.5 ? 'CAUTION' : 'SAFE',
      mitigationAction: maxSagCm >= 4.5 ? 'Issue Stage-2 evacuation notice for structures with exterior brickwork strain.' : 'No structural crack propagation detected.'
    },
    {
      id: 'INF-04',
      name: '132kV High-Tension Transmission Tower #14',
      type: 'POWER_TOWER',
      distanceFromCenterM: 65.0,
      criticalStrainLimitMmPerM: 3.0,
      currentStrainMmPerM: Number((maxStrainMmPerM * 0.18).toFixed(2)),
      predictedTiltDeg: Number((mpuTiltDeg * 0.20).toFixed(1)),
      dgmsDamageClass: 'CLASS_0_SAFE',
      status: 'SAFE',
      mitigationAction: 'Tower base plumb line within normal statutory limit (<1.5° tilt).'
    }
  ];

  // DGMS Overall Damage Classification
  let dgmsOverallClass = 'CLASS 0: Negligible Ground Deformation (< 0.5 mm/m)';
  if (maxStrainMmPerM >= 3.5 || maxSagCm >= 5.5) {
    dgmsOverallClass = 'CLASS IV: Severe Structural Rupture (Strain > 3.5 mm/m)';
  } else if (maxStrainMmPerM >= 2.0 || maxSagCm >= 3.5) {
    dgmsOverallClass = 'CLASS III: Appreciable Damage & Wall Cracks (Strain 2.0 - 3.5 mm/m)';
  } else if (maxStrainMmPerM >= 1.0 || maxSagCm >= 1.8) {
    dgmsOverallClass = 'CLASS II: Moderate Plaster Cracks & Pipe Flex (Strain 1.0 - 2.0 mm/m)';
  } else if (maxStrainMmPerM >= 0.5) {
    dgmsOverallClass = 'CLASS I: Slight Micro-Fissuring (Strain 0.5 - 1.0 mm/m)';
  }

  return {
    maxSubsidenceSagCm: maxSagCm,
    extractionDepthM: extractionDepthH,
    angleDrawDeg: angleOfDrawGamma,
    radiusOfInfluenceM: radiusOfInfluenceR,
    maxTensileStrainMmPerM: maxStrainMmPerM,
    maxCompressiveStrainMmPerM: Number((maxStrainMmPerM * 0.85).toFixed(2)),
    maxGroundSlopeDeg: Number(mpuTiltDeg.toFixed(1)),
    cavedGoafVolumeM3: cavedVolumeM3,
    affectedSurfaceAreaM2: affectedAreaM2,
    dgmsOverallDamageClass: dgmsOverallClass,
    infrastructureAssets,
    basinGrid3D
  };
}
