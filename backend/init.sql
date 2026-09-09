-- ==========================================================
-- SubSentry Rover SCADA Monitoring System - Database Schema
-- Database: PostgreSQL 15+
-- ==========================================================

-- 1. Create Telemetry Table
CREATE TABLE IF NOT EXISTS sensor_telemetry (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL DEFAULT 'ROVER_01',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    distance_1 REAL,
    distance_2 REAL,
    distance_3 REAL,
    accel_x REAL DEFAULT 0.0,
    accel_y REAL DEFAULT 0.0,
    accel_z REAL DEFAULT 9.81,
    gyro_x REAL DEFAULT 0.0,
    gyro_y REAL DEFAULT 0.0,
    gyro_z REAL DEFAULT 0.0,
    tilt_x REAL DEFAULT 0.0,
    tilt_y REAL DEFAULT 0.0,
    vibration_rms REAL DEFAULT 0.05,
    gas INTEGER DEFAULT 350,
    temperature REAL DEFAULT 26.0,
    humidity REAL DEFAULT 65.0,
    battery_voltage REAL DEFAULT 12.6,
    connection_status VARCHAR(20) DEFAULT 'online'
);

-- Index for ultrafast real-time polling and historical range queries
CREATE INDEX IF NOT EXISTS idx_telemetry_device_time ON sensor_telemetry(device_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_time ON sensor_telemetry(timestamp DESC);

-- 2. Create Alerts Table
CREATE TABLE IF NOT EXISTS sensor_alerts (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    device_id VARCHAR(50) NOT NULL,
    sensor VARCHAR(100) NOT NULL,
    value VARCHAR(50) NOT NULL,
    threshold VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'INFO', 'WARNING', 'CRITICAL'
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'
    message TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_alerts_device_time ON sensor_alerts(device_id, timestamp DESC);

-- 3. Seed Initial Baseline Records
INSERT INTO sensor_telemetry (
    device_id, timestamp, distance_1, distance_2, distance_3,
    accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z,
    tilt_x, tilt_y, vibration_rms, gas, temperature, humidity, battery_voltage, connection_status
) VALUES 
('ROVER_01', NOW() - INTERVAL '2 minutes', 22.0, 22.1, 22.0, 0.02, -0.01, 9.81, 0.0, 0.0, 0.0, 0.4, 0.3, 0.08, 395, 26.8, 68.2, 12.5, 'online'),
('ROVER_01', NOW() - INTERVAL '1 minute',  21.9, 21.8, 22.0, 0.03, -0.02, 9.80, 0.01, -0.01, 0.0, 0.6, 0.4, 0.10, 410, 27.1, 69.0, 12.4, 'online'),
('ROVER_01', NOW(),                        21.8, 21.6, 21.9, 0.04, -0.01, 9.81, 0.01, 0.0, 0.0, 0.8, 0.5, 0.11, 415, 27.4, 70.1, 12.4, 'online')
ON CONFLICT DO NOTHING;

INSERT INTO sensor_alerts (id, timestamp, device_id, sensor, value, threshold, severity, status, message)
VALUES 
('ALT-INIT-001', NOW(), 'ROVER_01', 'System Status', 'Nominal', 'N/A', 'INFO', 'ACTIVE', 'SubSentry EC2 Telemetry Cloud Database initialized successfully.')
ON CONFLICT (id) DO NOTHING;
