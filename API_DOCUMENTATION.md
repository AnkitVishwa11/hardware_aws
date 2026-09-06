# 🛰️ MineSafe Rover SCADA Dashboard — API Documentation (AWS EC2 + Docker + PostgreSQL)

This document provides the REST API contracts, database schemas, and integration flows for the **MineSafe Rover SCADA Monitoring System** hosted on **AWS EC2 via Docker Containers (PostgreSQL & Node.js/FastAPI API Service)**.

---

## 📌 Architecture Overview

```mermaid
flowchart LR
    subgraph Hardware [Rover IoT Node]
        Sensors[Ultrasonic x3 / MPU6050 / Gas / DHT11] --> Arduino[Arduino Uno Sensor Node]
        Arduino -->|UART Serial| ESP32[ESP32 WiFi/LTE Gateway]
    end

    subgraph EC2 [AWS EC2 Instance (Docker Compose)]
        APIServer[Docker: REST API Service (Port 5000)]
        PostgresDB[(Docker: PostgreSQL Database (Port 5432))]
        
        APIServer <-->|SQL Queries / Inserts| PostgresDB
    end

    subgraph Dashboard [React SCADA Frontend]
        App[App.tsx / useRoverData Hook]
        ApiService[apiService.ts]
        
        App --> ApiService
    end

    ESP32 -->|POST /api/sensor-data| APIServer
    ApiService -->|GET /api/latest| APIServer
    ApiService -->|GET /api/alerts| APIServer
    ApiService -->|GET /api/history| APIServer
    ApiService -->|GET /api/devices| APIServer
```

---

## ⚙️ Environment Configuration

The frontend dynamically connects to the cloud backend via `VITE_API_BASE_URL`.

Edit `.env` in the project root:

```env
# AWS EC2 Public IP or Custom Domain
VITE_API_BASE_URL=http://YOUR_EC2_PUBLIC_IP:5000

# Polling interval in milliseconds (Default: 5000)
VITE_DEFAULT_POLL_INTERVAL=5000
```

---

## 🚀 Endpoint Reference

### 1. `POST /api/sensor-data` (Phase 1: Ingestion)
Telemetry ingestion endpoint used by ESP32 Gateway to write data into PostgreSQL.

* **Method:** `POST`
* **Path:** `/api/sensor-data`
* **Headers:** `Content-Type: application/json`
* **Request Payload:**
```json
{
  "device_id": "ROVER_01",
  "distance_1": 21.8,
  "distance_2": 22.1,
  "distance_3": 21.9,
  "accel_x": 0.05,
  "accel_y": -0.02,
  "accel_z": 9.81,
  "gyro_x": 0.01,
  "gyro_y": -0.01,
  "gyro_z": 0.00,
  "tilt_x": 0.9,
  "tilt_y": 0.6,
  "vibration_rms": 0.12,
  "gas": 412,
  "temperature": 27.5,
  "humidity": 72.0,
  "battery_voltage": 12.4
}
```

* **Success Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "received": true,
    "id": 142
  },
  "timestamp": "2026-09-06T11:30:00.000Z"
}
```

---

### 2. `GET /api/latest` (Phase 2: Live SCADA Display)
Fetch the most recent real-time sensor record from PostgreSQL for a specific rover.

* **Method:** `GET`
* **Path:** `/api/latest`
* **Query Parameters:**
  | Parameter | Type | Required | Default | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `device_id` | `string` | No | `ROVER_01` | Unique identifier of the rover device. |

* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": 142,
    "device_id": "ROVER_01",
    "timestamp": "2026-09-06T11:30:00.000Z",
    "distance_1": 21.8,
    "distance_2": 22.1,
    "distance_3": 21.9,
    "accel_x": 0.05,
    "accel_y": -0.02,
    "accel_z": 9.81,
    "gyro_x": 0.01,
    "gyro_y": -0.01,
    "gyro_z": 0.00,
    "tilt_x": 0.9,
    "tilt_y": 0.6,
    "vibration_rms": 0.12,
    "gas": 412,
    "temperature": 27.5,
    "humidity": 72.0,
    "battery_voltage": 12.4,
    "connection_status": "online"
  },
  "timestamp": "2026-09-06T11:30:00.100Z"
}
```

---

### 3. `GET /api/history`
Query historical telemetry rows for graphing and CSV export.

* **Method:** `GET`
* **Path:** `/api/history`
* **Query Parameters:**
  | Parameter | Type | Required | Default | Description |
  | :--- | :--- | :--- | :--- | :--- |
  | `device_id` | `string` | No | `ROVER_01` | Filter by rover ID. |
  | `limit` | `number` | No | `100` | Number of historical records. |

* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "records": [
      {
        "id": 1,
        "device_id": "ROVER_01",
        "timestamp": "2026-09-06T10:00:00.000Z",
        "distance_1": 22.0,
        "distance_2": 22.0,
        "distance_3": 22.1,
        "tilt_x": 0.5,
        "tilt_y": 0.4,
        "vibration_rms": 0.08,
        "gas": 395,
        "temperature": 26.8,
        "humidity": 70.2,
        "battery_voltage": 12.6,
        "connection_status": "online"
      }
    ],
    "measurementPoints": []
  }
}
```

---

### 4. `GET /api/alerts`
Retrieve safety hazard alerts logged in the PostgreSQL `sensor_alerts` table.

* **Method:** `GET`
* **Path:** `/api/alerts`

* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "ALT-001",
      "timestamp": "2026-09-06T11:10:00.000Z",
      "device_id": "ROVER_01",
      "sensor": "Ultrasonic Distance S2 (Center)",
      "value": "15.4 cm",
      "threshold": "< 16.0 cm",
      "severity": "CRITICAL",
      "status": "ACTIVE",
      "message": "Critical ground sag detected on center sensor."
    }
  ]
}
```

---

### 5. `GET /api/devices`
List active rovers and network connection metrics.

* **Method:** `GET`
* **Path:** `/api/devices`

* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "ROVER_01",
      "name": "MineSafe Alpha-1",
      "model": "MS-RVR-V2",
      "firmware": "v2.4.1",
      "gateway_type": "ESP32",
      "sensor_node": "Arduino Uno",
      "last_seen": "2026-09-06T11:30:00.000Z",
      "status": "online",
      "battery_level_pct": 88,
      "battery_voltage": 12.4,
      "current_location": "Mine Section 4B",
      "total_samples": 18420
    }
  ]
}
```
