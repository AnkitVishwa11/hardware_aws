const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins (supports Wi-Fi hardware, local dev, and cloud web clients)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Configure PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://subsentry_user:secure_password_here@postgres-db:5432/subsentry_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL database at:', res.rows[0].now);
  }
});

// ==========================================
// 1. Health Check Endpoint
// ==========================================
app.get('/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      database: dbCheck ? 'connected' : 'disconnected',
      service: 'subsentry-backend-api',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'error',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==========================================
// 2. Shared Telemetry Ingestion Handler
// Handles both standard payload and ESP32 nested MPU format:
// {"device":"ESP32_NODE_2","mpu":{"accel_x":0.00,"accel_y":0.00,"accel_z":0.00,"gyro_x":0.00,"gyro_y":0.00,"gyro_z":0.00},"gas":0}
// ==========================================
const handleTelemetryIngest = async (req, res) => {
  try {
    const body = req.body || {};
    console.log('📥 Ingest packet received:', JSON.stringify(body));

    // Support "device": "ESP32_NODE_2" or "device_id": "ROVER_01"
    const device_id = body.device_id || body.device || 'ESP32_NODE_2';

    // Support nested "mpu" object or flat fields
    const mpu = body.mpu || {};
    const accel_x = body.accel_x !== undefined ? parseFloat(body.accel_x) : (mpu.accel_x !== undefined ? parseFloat(mpu.accel_x) : 0.0);
    const accel_y = body.accel_y !== undefined ? parseFloat(body.accel_y) : (mpu.accel_y !== undefined ? parseFloat(mpu.accel_y) : 0.0);
    const accel_z = body.accel_z !== undefined ? parseFloat(body.accel_z) : (mpu.accel_z !== undefined ? parseFloat(mpu.accel_z) : 9.81);
    const gyro_x = body.gyro_x !== undefined ? parseFloat(body.gyro_x) : (mpu.gyro_x !== undefined ? parseFloat(mpu.gyro_x) : 0.0);
    const gyro_y = body.gyro_y !== undefined ? parseFloat(body.gyro_y) : (mpu.gyro_y !== undefined ? parseFloat(mpu.gyro_y) : 0.0);
    const gyro_z = body.gyro_z !== undefined ? parseFloat(body.gyro_z) : (mpu.gyro_z !== undefined ? parseFloat(mpu.gyro_z) : 0.0);

    // Compute vibration RMS from accelerometer or default
    const norm = Math.sqrt(accel_x * accel_x + accel_y * accel_y + accel_z * accel_z);
    let vibration_rms = body.vibration_rms !== undefined 
      ? parseFloat(body.vibration_rms) 
      : parseFloat(Math.sqrt((accel_x * accel_x + accel_y * accel_y) / 2).toFixed(3));
    if (isNaN(vibration_rms) || vibration_rms === 0) vibration_rms = 0.04;

    // Compute tilt angles from accelerometer if available
    let tilt_x = body.tilt_x !== undefined ? parseFloat(body.tilt_x) : 0.0;
    let tilt_y = body.tilt_y !== undefined ? parseFloat(body.tilt_y) : 0.0;
    if (body.tilt_x === undefined && norm > 0.1) {
      tilt_x = parseFloat((Math.atan2(accel_y, Math.sqrt(accel_x * accel_x + accel_z * accel_z)) * (180 / Math.PI)).toFixed(1));
      tilt_y = parseFloat((Math.atan2(-accel_x, Math.sqrt(accel_y * accel_y + accel_z * accel_z)) * (180 / Math.PI)).toFixed(1));
    }

    // Ultrasonic Distances (null if sensor not mounted on node)
    const distance_1 = body.distance_1 !== undefined ? parseFloat(body.distance_1) : (body.dist1 !== undefined ? parseFloat(body.dist1) : null);
    const distance_2 = body.distance_2 !== undefined ? parseFloat(body.distance_2) : (body.dist2 !== undefined ? parseFloat(body.dist2) : null);
    const distance_3 = body.distance_3 !== undefined ? parseFloat(body.distance_3) : (body.dist3 !== undefined ? parseFloat(body.dist3) : null);

    const gas = body.gas !== undefined ? parseInt(body.gas, 10) : 0;
    const temperature = body.temperature !== undefined ? parseFloat(body.temperature) : 26.0;
    const humidity = body.humidity !== undefined ? parseFloat(body.humidity) : 65.0;
    const battery_voltage = body.battery_voltage !== undefined ? parseFloat(body.battery_voltage) : (body.battery !== undefined ? parseFloat(body.battery) : 12.5);
    const connection_status = body.connection_status || 'online';

    const query = `
      INSERT INTO sensor_telemetry (
        device_id, distance_1, distance_2, distance_3,
        accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z,
        tilt_x, tilt_y, vibration_rms, gas,
        temperature, humidity, battery_voltage, connection_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *;
    `;

    const values = [
      device_id,
      distance_1, distance_2, distance_3,
      accel_x, accel_y, accel_z,
      gyro_x, gyro_y, gyro_z,
      tilt_x, tilt_y,
      vibration_rms,
      gas,
      temperature, humidity,
      battery_voltage,
      connection_status
    ];

    const result = await pool.query(query, values);
    const saved = result.rows[0];

    // Automated hazard check & alert generation
    if (saved.distance_2 !== null && saved.distance_2 < 16.0) {
      await pool.query(
        `INSERT INTO sensor_alerts (id, timestamp, device_id, sensor, value, threshold, severity, status, message)
         VALUES ($1, NOW(), $2, $3, $4, $5, $6, 'ACTIVE', $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          `ALT-${Date.now()}`,
          device_id,
          'Ultrasonic Distance S2 (Center)',
          `${saved.distance_2.toFixed(1)} cm`,
          '< 16.0 cm',
          'CRITICAL',
          'Roof subsidence / ground sag hazard detected by center ultrasonic sensor.'
        ]
      );
    } else if (saved.gas > 600) {
      await pool.query(
        `INSERT INTO sensor_alerts (id, timestamp, device_id, sensor, value, threshold, severity, status, message)
         VALUES ($1, NOW(), $2, $3, $4, $5, $6, 'ACTIVE', $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          `ALT-${Date.now()}`,
          device_id,
          'Gas Sensor (MQ)',
          `${saved.gas} ADC`,
          '> 600 ADC',
          'WARNING',
          'Elevated toxic/combustible gas concentration detected in drift.'
        ]
      );
    }

    res.status(201).json({
      success: true,
      data: {
        received: true,
        id: saved.id,
        device_id: saved.device_id
      },
      timestamp: saved.timestamp
    });
  } catch (err) {
    console.error('Error inserting telemetry:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Register ingestion handler on all paths the ESP32 might send to
app.post('/api/sensor-data', handleTelemetryIngest);
app.post('/sensor-data', handleTelemetryIngest);
app.post('/index.html', handleTelemetryIngest);
app.post('/', handleTelemetryIngest);

// ==========================================
// 3. GET Latest Telemetry Record
// ==========================================
app.get('/api/latest', async (req, res) => {
  try {
    const requestedDevice = req.query.device_id;
    let result;

    if (requestedDevice && requestedDevice !== 'all') {
      result = await pool.query(
        'SELECT * FROM sensor_telemetry WHERE device_id = $1 ORDER BY timestamp DESC LIMIT 1',
        [requestedDevice]
      );
    }

    // Fallback: If device has no rows or not specified, fetch latest across any device
    if (!result || result.rows.length === 0) {
      result = await pool.query(
        'SELECT * FROM sensor_telemetry ORDER BY timestamp DESC LIMIT 1'
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No telemetry records found'
      });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        id: row.id,
        device_id: row.device_id,
        timestamp: row.timestamp,
        distance_1: row.distance_1 ?? 22.0,
        distance_2: row.distance_2 ?? 22.0,
        distance_3: row.distance_3 ?? 22.0,
        accel_x: row.accel_x,
        accel_y: row.accel_y,
        accel_z: row.accel_z,
        gyro_x: row.gyro_x,
        gyro_y: row.gyro_y,
        gyro_z: row.gyro_z,
        tilt_x: row.tilt_x,
        tilt_y: row.tilt_y,
        vibration_rms: row.vibration_rms,
        gas: row.gas,
        temperature: row.temperature,
        humidity: row.humidity,
        battery_voltage: row.battery_voltage,
        connection_status: row.connection_status
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. GET Historical Telemetry
// ==========================================
app.get('/api/history', async (req, res) => {
  try {
    const device_id = req.query.device_id;
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);

    let result;
    if (device_id && device_id !== 'all') {
      result = await pool.query(
        'SELECT * FROM sensor_telemetry WHERE device_id = $1 ORDER BY timestamp DESC LIMIT $2',
        [device_id, limit]
      );
    }

    if (!result || result.rows.length === 0) {
      result = await pool.query(
        'SELECT * FROM sensor_telemetry ORDER BY timestamp DESC LIMIT $1',
        [limit]
      );
    }

    // Return chronological order (oldest to newest) for charting
    const records = result.rows.reverse();

    res.json({
      success: true,
      data: {
        total: records.length,
        records: records,
        measurementPoints: []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. GET & UPDATE Alerts
// ==========================================
app.get('/api/alerts', async (req, res) => {
  try {
    const device_id = req.query.device_id;
    let query = 'SELECT * FROM sensor_alerts ORDER BY timestamp DESC LIMIT 50';
    let values = [];

    if (device_id && device_id !== 'all') {
      query = 'SELECT * FROM sensor_alerts WHERE device_id = $1 ORDER BY timestamp DESC LIMIT 50';
      values = [device_id];
    }

    const result = await pool.query(query, values);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/alerts/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE sensor_alerts SET status = 'ACKNOWLEDGED' WHERE id = $1",
      [id]
    );
    res.json({ success: true, message: `Alert ${id} acknowledged` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. GET Devices Status
// ==========================================
app.get('/api/devices', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        device_id as id,
        MAX(timestamp) as last_seen,
        COUNT(*) as total_samples,
        (ARRAY_AGG(battery_voltage ORDER BY timestamp DESC))[1] as battery_voltage,
        (ARRAY_AGG(connection_status ORDER BY timestamp DESC))[1] as status
      FROM sensor_telemetry
      GROUP BY device_id
    `);

    const devices = result.rows.map(row => {
      const batteryVoltage = row.battery_voltage || 12.4;
      const batteryPct = Math.min(100, Math.max(0, Math.round(((batteryVoltage - 11.0) / (12.6 - 11.0)) * 100)));
      return {
        id: row.id,
        name: row.id === 'ROVER_01' ? 'SubSentry Alpha-1' : (row.id === 'ESP32_NODE_2' ? 'SubSentry Node-2' : `SubSentry ${row.id}`),
        model: 'SS-RVR-V2',
        firmware: 'v2.4.1',
        gateway_type: 'ESP32 Wi-Fi / LTE',
        sensor_node: 'Arduino Uno R3',
        last_seen: row.last_seen,
        status: row.status || 'online',
        battery_level_pct: batteryPct,
        battery_voltage: batteryVoltage,
        current_location: 'Mine Section 4B - Drift A',
        total_samples: parseInt(row.total_samples, 10)
      };
    });

    if (devices.length === 0) {
      devices.push({
        id: 'ESP32_NODE_2',
        name: 'SubSentry Node-2',
        model: 'SS-RVR-V2',
        firmware: 'v2.4.1',
        gateway_type: 'ESP32 Wi-Fi / LTE',
        sensor_node: 'Arduino Uno R3',
        last_seen: new Date().toISOString(),
        status: 'online',
        battery_level_pct: 92,
        battery_voltage: 12.5,
        current_location: 'Mine Section 4B - Drift A',
        total_samples: 1
      });
    }

    res.json({
      success: true,
      data: devices
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. GET Analytics Summary
// ==========================================
app.get('/api/analytics', async (req, res) => {
  try {
    const device_id = req.query.device_id || 'ESP32_NODE_2';
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_samples,
        AVG(gas)::numeric(10,2) as avg_gas,
        MAX(vibration_rms)::numeric(10,3) as max_vibration,
        AVG(temperature)::numeric(10,1) as avg_temperature,
        AVG(humidity)::numeric(10,1) as avg_humidity
      FROM sensor_telemetry
      WHERE device_id = $1
    `, [device_id]);

    res.json({
      success: true,
      data: {
        device_id,
        summary: stats.rows[0] || {},
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SubSentry API Server listening on port ${PORT}`);
});
