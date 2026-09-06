# 📡 Two-Phase IoT Data Pipeline Guide (AWS EC2 + Docker + PostgreSQL)
### ESP32 (Hardware Rover) ➔ AWS EC2 (Docker Backend + PostgreSQL) ➔ React Web Dashboard

---

## 🎯 Architecture Summary: EC2 + Docker Container Stack

```
+-----------------------------------------------------------------------------------------+
|                                    PHASE 1: INGESTION                                   |
|                                                                                         |
|   +-------------------+      HTTP/HTTPS POST       +--------------------------------+   |
|   |  ESP32 Gateway    | -------------------------> |  AWS EC2 Instance              |   |
|   |  (Rover Node)     |    /api/sensor-data        |  [ Docker Container: Backend ] |   |
|   +-------------------+                            +---------------+----------------+   |
|                                                                    |                    |
|                                                                    v                    |
|                                                    +---------------+----------------+   |
|                                                    |  Docker Container: PostgreSQL  |   |
|                                                    |  (sensor_telemetry table)      |   |
|                                                    +---------------+----------------+   |
+--------------------------------------------------------------------+--------------------+
                                                                     |
+--------------------------------------------------------------------+--------------------+
|                                    PHASE 2: CONSUMPTION            v                    |
|                                                                                         |
|   +-------------------+      HTTP/HTTPS GET        +--------------------------------+   |
|   |  React Website    | <------------------------- |  AWS EC2 Instance              |   |
|   |  (SCADA Dashboard)|    /api/latest             |  [ Docker Container: Backend ] |   |
|   |                   |    /api/history            |  (Reads from PostgreSQL)       |   |
|   +-------------------+    /api/alerts             +--------------------------------+   |
+-----------------------------------------------------------------------------------------+
```

---

## 🐳 Docker Stack on AWS EC2

### 1. `docker-compose.yml`
Save this on your EC2 instance (`/home/ubuntu/minesafe-backend/docker-compose.yml`):

```yaml
version: '3.8'

services:
  # PostgreSQL Database Container
  postgres-db:
    image: postgres:15-alpine
    container_name: minesafe_postgres
    restart: always
    environment:
      POSTGRES_DB: minesafe_db
      POSTGRES_USER: minesafe_user
      POSTGRES_PASSWORD: secure_password_here
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - minesafe-net

  # REST API Backend Container (Node.js / Express or FastAPI)
  api-backend:
    build: .
    container_name: minesafe_api
    restart: always
    environment:
      DATABASE_URL: postgresql://minesafe_user:secure_password_here@postgres-db:5432/minesafe_db
      PORT: 5000
    ports:
      - "5000:5000"
    depends_on:
      - postgres-db
    networks:
      - minesafe-net

volumes:
  pgdata:

networks:
  minesafe-net:
    driver: bridge
```

---

### 2. PostgreSQL Schema (`init.sql`)

```sql
-- Create Telemetry Table
CREATE TABLE IF NOT EXISTS sensor_telemetry (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL DEFAULT 'ROVER_01',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    distance_1 REAL,
    distance_2 REAL,
    distance_3 REAL,
    accel_x REAL,
    accel_y REAL,
    accel_z REAL,
    gyro_x REAL,
    gyro_y REAL,
    gyro_z REAL,
    tilt_x REAL,
    tilt_y REAL,
    vibration_rms REAL,
    gas INTEGER,
    temperature REAL,
    humidity REAL,
    battery_voltage REAL,
    connection_status VARCHAR(20) DEFAULT 'online'
);

-- Index for ultrafast real-time polling and historical range queries
CREATE INDEX idx_telemetry_device_time ON sensor_telemetry(device_id, timestamp DESC);

-- Create Alerts Table
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
```

---

### 3. Backend REST Server in Docker (`server.js` or `main.py`)

Here is the ready Node.js/Express server (`server.js`):

```javascript
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://minesafe_user:secure_password_here@postgres-db:5432/minesafe_db'
});

// ==========================================
// PHASE 1: INGESTION (ESP32 -> EC2 Backend)
// ==========================================
app.post('/api/sensor-data', async (req, res) => {
  try {
    const {
      device_id = 'ROVER_01',
      distance_1, distance_2, distance_3,
      accel_x, accel_y, accel_z,
      gyro_x, gyro_y, gyro_z,
      tilt_x, tilt_y,
      vibration_rms, gas,
      temperature, humidity,
      battery_voltage
    } = req.body;

    const query = `
      INSERT INTO sensor_telemetry (
        device_id, distance_1, distance_2, distance_3,
        accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z,
        tilt_x, tilt_y, vibration_rms, gas,
        temperature, humidity, battery_voltage
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *;
    `;

    const values = [
      device_id, distance_1, distance_2, distance_3,
      accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z,
      tilt_x, tilt_y, vibration_rms, gas,
      temperature, humidity, battery_voltage
    ];

    const result = await pool.query(query, values);
    res.status(201).json({ success: true, data: { received: true, id: result.rows[0].id } });
  } catch (err) {
    console.error('Error saving telemetry:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// PHASE 2: CONSUMPTION (EC2 Backend -> Website)
// ==========================================

// 1. GET Latest Telemetry
app.get('/api/latest', async (req, res) => {
  try {
    const device_id = req.query.device_id || 'ROVER_01';
    const result = await pool.query(
      'SELECT * FROM sensor_telemetry WHERE device_id = $1 ORDER BY timestamp DESC LIMIT 1',
      [device_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No data found' });
    }

    res.json({ success: true, data: result.rows[0], timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. GET Historical Records
app.get('/api/history', async (req, res) => {
  try {
    const device_id = req.query.device_id || 'ROVER_01';
    const limit = parseInt(req.query.limit) || 100;
    
    const result = await pool.query(
      'SELECT * FROM sensor_telemetry WHERE device_id = $1 ORDER BY timestamp DESC LIMIT $2',
      [device_id, limit]
    );

    // Return chronological (oldest to newest)
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

// 3. GET Alerts
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
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. GET Devices
app.get('/api/devices', async (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'ROVER_01',
        name: 'MineSafe Alpha-1',
        model: 'MS-RVR-V2',
        firmware: 'v2.4.1',
        gateway_type: 'ESP32',
        sensor_node: 'Arduino Uno',
        last_seen: new Date().toISOString(),
        status: 'online',
        battery_level_pct: 88,
        battery_voltage: 12.4,
        current_location: 'Mine Section 4B',
        total_samples: 1000
      }
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MineSafe API Server running on port ${PORT}`));
```

---

## 📍 PHASE 1: ESP32 ➔ EC2 (Ingestion Setup)

### ESP32 C++ Code (Pointing to EC2 IP)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Replace with your EC2 Public IP or Domain (e.g. 13.234.xx.xx or ec2-xx.compute.amazonaws.com)
const char* serverUrl = "http://YOUR_EC2_PUBLIC_IP:5000/api/sensor-data";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected! IP: " + WiFi.localIP().toString());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<512> doc;
    doc["device_id"] = "ROVER_01";
    doc["distance_1"] = 21.8;
    doc["distance_2"] = 22.1;
    doc["distance_3"] = 21.9;
    doc["accel_x"] = 0.05;
    doc["accel_y"] = -0.02;
    doc["accel_z"] = 9.81;
    doc["gyro_x"] = 0.01;
    doc["gyro_y"] = -0.01;
    doc["gyro_z"] = 0.00;
    doc["tilt_x"] = 0.9;
    doc["tilt_y"] = 0.6;
    doc["vibration_rms"] = 0.12;
    doc["gas"] = 412;
    doc["temperature"] = 27.5;
    doc["humidity"] = 72.0;
    doc["battery_voltage"] = 12.4;

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);
    
    if (httpResponseCode > 0) {
      Serial.printf("Uploaded to EC2 Docker. HTTP Status: %d\n", httpResponseCode);
    } else {
      Serial.printf("Upload error: %s\n", http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  }

  delay(5000); // Send data every 5 seconds
}
```

---

## 📍 PHASE 2: EC2 ➔ React Website (Consumption Setup)

1. **Update `.env` in your React project root**:
   ```env
   VITE_API_BASE_URL=http://YOUR_EC2_PUBLIC_IP:5000
   ```
2. **EC2 Security Group Rule**:
   - Make sure your AWS EC2 Security Group allows **Inbound Traffic on Port 5000** (Custom TCP, Port `5000`, Source `0.0.0.0/0`).
3. **Start Dashboard**:
   ```bash
   npm run dev
   ```
4. In the top navigation bar of the web dashboard, toggle mode from **DEMO** to **LIVE**.
5. The website will poll `http://YOUR_EC2_PUBLIC_IP:5000/api/latest` and display live rover sensor graphs, ground displacement, and hazard alerts.

---

## 🧪 Testing Commands

### Test 1: Upload Data to EC2 Docker (Phase 1 Test)
```bash
curl -X POST http://YOUR_EC2_PUBLIC_IP:5000/api/sensor-data `
  -H "Content-Type: application/json" `
  -d '{"device_id":"ROVER_01","distance_1":21.5,"distance_2":21.8,"distance_3":21.6,"tilt_x":1.2,"tilt_y":0.8,"vibration_rms":0.15,"gas":430,"temperature":28.2,"humidity":71.0,"battery_voltage":12.2}'
```

### Test 2: Fetch Latest Data from EC2 Docker (Phase 2 Test)
```bash
curl -X GET "http://YOUR_EC2_PUBLIC_IP:5000/api/latest?device_id=ROVER_01"
```
