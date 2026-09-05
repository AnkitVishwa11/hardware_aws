import { SensorData, RiskAnalysis, RiskFactor, RiskLevel, GroundBaseline } from '../types/sensor';
import { PROTOTYPE_THRESHOLDS, DISCLAIMERS } from '../utils/constants';

/**
 * Prototype Rule-Based Risk Assessment Engine
 * Designed for SIH26025 technical evaluation.
 * Computes individual contributing factors and a combined prototype risk index (0-100).
 * Architecture allows plug-and-play machine learning model integration.
 */
export function evaluateRisk(
  current: SensorData,
  baseline: GroundBaseline,
  rateOfChangeCmMin?: number | null
): RiskAnalysis {
  const factors: RiskFactor[] = [];
  let score = 0; // Cumulative score 0 - 100

  // 1. Ground Displacement factor
  // Calculate average displacement delta across available ultrasonic sensors
  const deltas: number[] = [];
  if (current.distance_1 !== null) deltas.push(Math.abs(current.distance_1 - baseline.sensor_1));
  if (current.distance_2 !== null) deltas.push(Math.abs(current.distance_2 - baseline.sensor_2));
  if (current.distance_3 !== null) deltas.push(Math.abs(current.distance_3 - baseline.sensor_3));

  const maxDelta = deltas.length > 0 ? Math.max(...deltas) : 0;
  const displacementThresh = PROTOTYPE_THRESHOLDS.displacement;

  let dispStatus: 'normal' | 'warning' | 'critical' = 'normal';
  if (maxDelta >= displacementThresh.criticalCm) {
    dispStatus = 'critical';
    score += 35;
  } else if (maxDelta >= displacementThresh.warningCm) {
    dispStatus = 'warning';
    score += 20;
  } else {
    score += Math.min(10, Math.round((maxDelta / displacementThresh.warningCm) * 10));
  }

  // Rate of displacement factor
  const rateVal = rateOfChangeCmMin ?? 0;
  if (Math.abs(rateVal) >= displacementThresh.rateWarningCmPerMin) {
    if (dispStatus === 'normal') dispStatus = 'warning';
    score += 10;
  }

  factors.push({
    name: 'Ground Displacement',
    category: 'displacement',
    status: dispStatus,
    detail: deltas.length > 0 
      ? `Max delta: ${maxDelta.toFixed(1)} cm from baseline${rateVal ? ` (${rateVal > 0 ? '+' : ''}${rateVal.toFixed(2)} cm/min)` : ''}`
      : 'Sensor data not available',
    metricValue: `${maxDelta.toFixed(1)} cm`,
    threshold: `Warning: ≥${displacementThresh.warningCm} cm, Critical: ≥${displacementThresh.criticalCm} cm`
  });

  // 2. Rover Tilt factor
  const tiltX = Math.abs(current.tilt_x ?? 0);
  const tiltY = Math.abs(current.tilt_y ?? 0);
  const maxTilt = Math.max(tiltX, tiltY);
  const tiltThresh = PROTOTYPE_THRESHOLDS.tilt;

  let tiltStatus: 'normal' | 'warning' | 'critical' = 'normal';
  if (current.tilt_x === null && current.tilt_y === null) {
    tiltStatus = 'normal';
  } else if (maxTilt >= tiltThresh.criticalDeg) {
    tiltStatus = 'critical';
    score += 25;
  } else if (maxTilt >= tiltThresh.warningDeg) {
    tiltStatus = 'warning';
    score += 15;
  } else {
    score += Math.min(8, Math.round((maxTilt / tiltThresh.warningDeg) * 8));
  }

  factors.push({
    name: 'Rover Tilt & Inclination',
    category: 'tilt',
    status: tiltStatus,
    detail: (current.tilt_x !== null || current.tilt_y !== null)
      ? `Tilt X: ${current.tilt_x?.toFixed(1) ?? 'N/A'}°, Tilt Y: ${current.tilt_y?.toFixed(1) ?? 'N/A'}°`
      : 'MPU6050 tilt data not available',
    metricValue: `${maxTilt.toFixed(1)}°`,
    threshold: `Warning: ≥${tiltThresh.warningDeg}°, Critical: ≥${tiltThresh.criticalDeg}°`
  });

  // 3. Vibration RMS factor
  const vibRms = current.vibration_rms ?? 0;
  const vibThresh = PROTOTYPE_THRESHOLDS.vibrationRms;

  let vibStatus: 'normal' | 'warning' | 'critical' = 'normal';
  if (current.vibration_rms === null) {
    vibStatus = 'normal';
  } else if (vibRms >= vibThresh.criticalG) {
    vibStatus = 'critical';
    score += 20;
  } else if (vibRms >= vibThresh.warningG) {
    vibStatus = 'warning';
    score += 12;
  } else {
    score += Math.min(6, Math.round((vibRms / vibThresh.warningG) * 6));
  }

  factors.push({
    name: 'Vibration (RMS)',
    category: 'vibration',
    status: vibStatus,
    detail: current.vibration_rms !== null
      ? `Vibration RMS: ${vibRms.toFixed(2)} g`
      : 'Vibration data not available',
    metricValue: current.vibration_rms !== null ? `${vibRms.toFixed(2)} g` : 'N/A',
    threshold: `Warning: ≥${vibThresh.warningG} g, Critical: ≥${vibThresh.criticalG} g`
  });

  // 4. Raw Gas Level factor
  const gasVal = current.gas ?? 0;
  const gasThresh = PROTOTYPE_THRESHOLDS.gasRaw;

  let gasStatus: 'normal' | 'warning' | 'critical' = 'normal';
  if (current.gas === null) {
    gasStatus = 'normal';
  } else if (gasVal >= gasThresh.criticalRaw) {
    gasStatus = 'critical';
    score += 25;
  } else if (gasVal >= gasThresh.warningRaw) {
    gasStatus = 'warning';
    score += 14;
  } else {
    score += Math.min(6, Math.round((gasVal / gasThresh.warningRaw) * 6));
  }

  factors.push({
    name: 'Raw Gas Level (Analog)',
    category: 'gas',
    status: gasStatus,
    detail: current.gas !== null
      ? `Raw ADC Value: ${gasVal} (Uncalibrated analog sensor)`
      : 'Gas sensor data not available',
    metricValue: current.gas !== null ? `${gasVal} ADC` : 'N/A',
    threshold: `Warning: ≥${gasThresh.warningRaw} ADC, Critical: ≥${gasThresh.criticalRaw} ADC`
  });

  // 5. Environmental factor (Temperature & Humidity)
  const tempVal = current.temperature ?? 0;
  const humVal = current.humidity ?? 0;
  const tempThresh = PROTOTYPE_THRESHOLDS.temperature;
  const humThresh = PROTOTYPE_THRESHOLDS.humidity;

  let envStatus: 'normal' | 'warning' | 'critical' = 'normal';
  if (current.temperature !== null && tempVal >= tempThresh.criticalC) {
    envStatus = 'critical';
    score += 15;
  } else if (current.temperature !== null && tempVal >= tempThresh.warningC) {
    envStatus = 'warning';
    score += 8;
  } else if (current.humidity !== null && humVal >= humThresh.criticalPct) {
    envStatus = 'warning';
    score += 6;
  }

  factors.push({
    name: 'Environmental (Temp & Humidity)',
    category: 'environment',
    status: envStatus,
    detail: (current.temperature !== null || current.humidity !== null)
      ? `Temp: ${current.temperature ?? 'N/A'} °C, Humidity: ${current.humidity ?? 'N/A'}%`
      : 'DHT11 data not available',
    metricValue: `${current.temperature ?? 'N/A'} °C | ${current.humidity ?? 'N/A'}%`,
    threshold: `Temp Warn: ≥${tempThresh.warningC}°C, Humidity Warn: ≥${humThresh.warningPct}%`
  });

  // Clamp overall score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine overall risk level
  let overallRisk: RiskLevel = 'NORMAL';
  if (factors.some(f => f.status === 'critical') || finalScore >= 60) {
    overallRisk = 'CRITICAL';
  } else if (factors.some(f => f.status === 'warning') || finalScore >= 30) {
    overallRisk = 'WARNING';
  } else {
    overallRisk = 'NORMAL';
  }

  // Recommendations for prototype demonstration
  let recommendation = 'All sensor telemetry within nominal prototype operational bounds.';
  if (overallRisk === 'CRITICAL') {
    recommendation = 'CRITICAL ALERT: Multiple prototype threshold breaches detected. Stop rover traversal and verify ground convergence and atmospheric telemetry.';
  } else if (overallRisk === 'WARNING') {
    recommendation = 'CAUTION: Elevated reading observed in one or more sensor channels. Closely observe trend progression at next stationary hold point.';
  }

  return {
    overallRisk,
    score: finalScore,
    label: "Prototype Rule-Based Risk Assessment",
    disclaimer: DISCLAIMERS.prototypeRules,
    factors,
    timestamp: current.timestamp || new Date().toISOString(),
    recommendation
  };
}
