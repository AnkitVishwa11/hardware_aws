/**
 * System constants, prototype threshold configurations, and mandatory safety disclaimers
 */

export const PROJECT_INFO = {
  name: "SubSentry Rover",
  subtitle: "Real-Time Mine Subsidence & Environmental Monitoring System",
  hackathonId: "SIH26025",
  competition: "Smart India Hackathon",
  version: "1.0.0-prototype",
  architecture: "Arduino Uno (Sensors) → ESP32 (Wi-Fi/HTTPS) → AWS Cloud API → Web App"
};

export const DISCLAIMERS = {
  prototypeRules: "Prototype / Demo Thresholds – Designed for technical evaluation and prototype demonstration. Not certified mining safety limits.",
  geotechnical: "Note: HC-SR04 ultrasonic readings measure relative acoustic travel distance to rover overhead/floor baseline. They serve as a relative proxy and do not replace certified geotechnical mine subsidence convergence instrumentation.",
  gasSensor: "Raw Sensor Value (ADC 0–1023). Uncalibrated analog sensor data. Not calibrated parts-per-million (PPM).",
  mlExtensibility: "Current engine: Prototype Rule-Based Risk Assessment. Architecture supports plug-and-play machine learning predictive models (e.g., Random Forest or LSTM convergence forecaster)."
};

// Prototype rule thresholds (Clearly labeled as prototype/demo limits)
export const PROTOTYPE_THRESHOLDS = {
  // Distance delta from baseline in cm
  displacement: {
    warningCm: 2.0,
    criticalCm: 4.0,
    rateWarningCmPerMin: 1.5,
    unit: 'cm'
  },
  // Tilt in degrees
  tilt: {
    warningDeg: 4.5,
    criticalDeg: 9.0,
    unit: '°'
  },
  // Vibration RMS in g (m/s^2 equivalent)
  vibrationRms: {
    warningG: 0.28,
    criticalG: 0.55,
    unit: 'g'
  },
  // Gas sensor raw analog reading (0 to 1023)
  gasRaw: {
    warningRaw: 520,
    criticalRaw: 720,
    unit: 'ADC'
  },
  // Temperature in deg C
  temperature: {
    warningC: 36.0,
    criticalC: 42.0,
    unit: '°C'
  },
  // Humidity in %
  humidity: {
    warningPct: 85,
    criticalPct: 92,
    unit: '%'
  },
  // Battery in Volts
  battery: {
    lowVolt: 10.8,
    criticalVolt: 10.2,
    nominalVolt: 12.0
  }
};

export const DEFAULT_BASELINES = {
  sensor_1: 22.0, // cm
  sensor_2: 22.0, // cm
  sensor_3: 22.0, // cm
  set_at: new Date().toISOString()
};

export const STATIONARY_POINTS = [
  { id: 'MP-01', name: 'Shaft 2 Adit Convergence Point', target_distance: 21.5 },
  { id: 'MP-02', name: 'Stope 3 Roof Junction', target_distance: 22.0 },
  { id: 'MP-03', name: 'Sub-Level B Haulage Entry', target_distance: 23.2 },
  { id: 'MP-04', name: 'Crosscut 5 Pillar Face', target_distance: 20.8 }
];

export const AVAILABLE_ROVERS = [
  { id: 'ROVER_01', name: 'SubSentry Rover Alpha (Primary)', status: 'online' },
  { id: 'ROVER_02', name: 'SubSentry Rover Beta (Standby Unit)', status: 'offline' }
];
