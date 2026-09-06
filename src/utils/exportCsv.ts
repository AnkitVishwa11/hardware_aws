import { SensorData } from '../types/sensor';

/**
 * Generates and downloads a CSV export file from sensor data records
 */
export function exportSensorDataToCsv(records: SensorData[], filename?: string): void {
  if (!records || records.length === 0) {
    alert('No data records available to export.');
    return;
  }

  const headers = [
    'Timestamp',
    'Rover_ID',
    'Measurement_Point',
    'Distance_1_cm',
    'Distance_2_cm',
    'Distance_3_cm',
    'Accel_X_g',
    'Accel_Y_g',
    'Accel_Z_g',
    'Gyro_X_deg_s',
    'Gyro_Y_deg_s',
    'Gyro_Z_deg_s',
    'Tilt_X_deg',
    'Tilt_Y_deg',
    'Vibration_RMS_g',
    'Raw_Gas_ADC',
    'Temperature_C',
    'Humidity_Pct',
    'Battery_Voltage_V',
    'Connection_Status',
    'Is_Demo_Data'
  ];

  const rows = records.map((r) => [
    `"${r.timestamp || ''}"`,
    `"${r.device_id || ''}"`,
    `"${r.measurement_point || 'Moving'}"`,
    r.distance_1 !== null ? r.distance_1 : 'N/A',
    r.distance_2 !== null ? r.distance_2 : 'N/A',
    r.distance_3 !== null ? r.distance_3 : 'N/A',
    r.accel_x !== null ? r.accel_x : 'N/A',
    r.accel_y !== null ? r.accel_y : 'N/A',
    r.accel_z !== null ? r.accel_z : 'N/A',
    r.gyro_x !== null ? r.gyro_x : 'N/A',
    r.gyro_y !== null ? r.gyro_y : 'N/A',
    r.gyro_z !== null ? r.gyro_z : 'N/A',
    r.tilt_x !== null ? r.tilt_x : 'N/A',
    r.tilt_y !== null ? r.tilt_y : 'N/A',
    r.vibration_rms !== null ? r.vibration_rms : 'N/A',
    r.gas !== null ? r.gas : 'N/A',
    r.temperature !== null ? r.temperature : 'N/A',
    r.humidity !== null ? r.humidity : 'N/A',
    r.battery_voltage !== null ? r.battery_voltage : 'N/A',
    `"${r.connection_status || 'online'}"`,
    r.is_demo ? 'YES' : 'NO'
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const actualFilename = filename || `subsentry_rover_telemetry_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_')}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', actualFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
