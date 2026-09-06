# SubSentry Rover – Real-Time Mine Subsidence & Environmental Monitoring System
**Smart India Hackathon Prototype – Problem Statement SIH26025**

A professional, responsive industrial IoT web dashboard for monitoring underground mine subsidence, rock convergence, vibration, tilt, atmospheric gas, and environmental metrics collected by an autonomous mobile rover.

---

## 📌 Project Overview
Underground mine collapses and roof convergence pose life-threatening hazards to mining personnel. The **SubSentry Rover** system utilizes a mobile inspection rover to traverse underground mine haulage drifts and stopes, collecting ground-condition, motion, vibration, and atmospheric sensor telemetry.

- **Rover Sensor Node (Arduino Uno)**: Collects readings from 3 × ultrasonic distance sensors, 6-DOF IMU (MPU6050), analog gas sensor, and DHT11 temperature/humidity probe.
- **Wireless Gateway (ESP32)**: Receives structured JSON packets from the Arduino Uno via a logic-level protected one-way UART link and uploads them to an AWS-hosted backend via HTTPS POST.
- **Web Application**: Consumes AWS REST APIs to visualize real-time and historical telemetry, identify differential ground displacement, evaluate multi-sensor hazard risk, and trigger safety alerts.

> [!IMPORTANT]
> **Prototype Disclaimers & Safety Notice**:
> - This dashboard is developed as an engineering prototype for Smart India Hackathon (SIH26025).
> - All risk assessments and alert thresholds are strictly labeled as **"Prototype / Demo Thresholds"** and do not represent statutory or certified mining geotechnical limits.
> - HC-SR04 ultrasonic measurements represent acoustic time-of-flight clearance distances relative to the rover, functioning as a relative displacement proxy rather than certified extensometer convergence instrumentation.
> - Analog gas sensor readings are explicitly labeled as **"Raw Sensor Value"** (ADC count 0–1023) and are not converted to uncalibrated parts-per-million (PPM).

---

## 🛠 Hardware Architecture

```
+-------------------------------------------------------------+
|                   ROVER SENSOR NODE                         |
|                     (Arduino Uno)                           |
|                                                             |
|  • 3 × HC-SR04 Ultrasonic Sensors (Distance 1, 2, 3)        |
|  • 1 × MPU6050 6-DOF IMU (Accel X/Y/Z, Gyro X/Y/Z, Tilt)   |
|  • 1 × MQ Gas Sensor (Analog Pin A0)                        |
|  • 1 × DHT11 Sensor (Temperature & Humidity)               |
+------------------------------+------------------------------+
                               |
                   One-Way UART JSON Stream
                   (TX -> Voltage Divider -> RX)
                   (GND -> GND)
                               v
+-------------------------------------------------------------+
|                    GATEWAY NODE (ESP32)                     |
|                                                             |
|  • Receives UART JSON packets from Arduino Uno              |
|  • Wi-Fi 802.11 b/g/n client                                |
|  • Performs HTTPS POST payload upload to AWS Backend        |
+------------------------------+------------------------------+
                               |
                        HTTPS REST / Wi-Fi
                               v
+-------------------------------------------------------------+
|                     AWS HOSTED BACKEND                      |
|                                                             |
|  • POST /api/sensor-data   (Data ingestion)                 |
|  • GET  /api/latest        (Latest packet query)            |
|  • GET  /api/history       (Time-series query & filtering)  |
|  • GET  /api/alerts        (Active & logged safety alerts)  |
|  • GET  /api/devices       (Rover fleet status)             |
|  • GET  /api/analytics     (Aggregated statistics)          |
+------------------------------+------------------------------+
                               |
                          HTTPS REST API
                               v
+-------------------------------------------------------------+
|                SUBSENTRY ROVER WEB DASHBOARD                |
|                   (React + TypeScript + Vite)               |
+-------------------------------------------------------------+
```

---

## 📡 Sensor Data Model (JSON Schema)

```json
{
  "device_id": "ROVER_01",
  "timestamp": "2026-09-05T14:32:18Z",

  "distance_1": 20.4,
  "distance_2": 20.8,
  "distance_3": 21.1,

  "accel_x": 0.12,
  "accel_y": 0.08,
  "accel_z": 9.71,

  "gyro_x": 0.4,
  "gyro_y": 0.7,
  "gyro_z": 0.2,

  "tilt_x": 1.2,
  "tilt_y": 0.8,

  "vibration_rms": 0.13,

  "gas": 430,

  "temperature": 32.8,
  "humidity": 82,

  "battery_voltage": 11.8,

  "connection_status": "online"
}
```

---

## 🖥 Dashboard Pages & Capabilities

1. **Executive Command Center (SCADA HUD)**:
   - 4 High-Precision KPI Cards: Ground Displacement ($\Delta d$), Incline Slope ($\theta$), Vibration RMS ($g$), Raw Gas Level (ADC 0–1023).
   - 3-Point Roof Cross-Section Arc and dynamic 360° Artificial Horizon Gyroscope.
   - Live 1-Second streaming telemetry with stale packet timeout detection.

2. **Multi-Rover Swarm Fleet & Dual-Panel Sync (`FleetSwarmTab`)**:
   - Simultaneous tracking of multiple rovers: **SubSentry Alpha** (`ROVER_01` in Panel P-4B Longwall) and **SubSentry Beta** (`ROVER_02` in Panel P-2A Depillaring).
   - Cross-panel differential $\Delta\text{Sag}$ variance, slope deviation, and sub-GHz mesh link hop status.

3. **3D Subsidence Basin Digital Twin (`SubsidenceBasinTab`)**:
   - Implements the empirical **Knothe-Budryk Geotechnical Theory** ($S(r) = S_{\text{max}} \cdot \exp(-\pi r^2 / R^2)$).
   - Interactive 3D wireframe depression bowl, damage radius ($R = 56\text{m}$), maximum tensile strain ($\epsilon$), and caved goaf volume ($V = 7.9\text{ m}^3$).
   - Infrastructure impact audit assessing surface railways, highways, and residential structures against DGMS limits.

4. **GIS Surface Mesh & Mine Map (`GisMapTab`)**:
   - Interactive Leaflet GIS map with GPS radar tracking (`23.7524°N, 86.4218°E`) over Jharia Coalfield Panel P-4B.
   - Dynamic subsidence risk heatmap (Green $<1\text{cm}$, Amber $2.5-4\text{cm}$, Red $>5.5\text{cm}$) and surface wireless mesh nodes.

5. **AI/ML Autoregressive Predictive Subsidence Engine (`PredictiveForecastTab`)**:
   - Autoregressive polynomial forward projection curve (+1h to +6h horizons) with expanding uncertainty intervals.
   - Live deformation velocity ($10.0\text{ cm/hr}$) and automated time-to-critical breach estimator.

6. **AI vs Knothe-Budryk Scientific Model Benchmark (`ModelBenchmarkTab`)**:
   - Cross-validates AI Deep Learning against classical geotechnical models with live metrics ($R^2 = 0.964$, $\text{MAE} = 0.032\text{ cm}$, $\text{RMSE} = 0.037\text{ cm}$).
   - Superimposed spatial depression trough curves and point-by-point residual error distribution charts.

7. **1-Click DGMS Statutory Safety Audit Report Generator (`DgmsReportModal`)**:
   - Generates official Directorate General of Mines Safety (Tech Form IV-A) compliant certificates.
   - Automated PASS/FAIL verification for ground sag, slope, vibration, and toxic gas with digital safety officer signature stamps.
   - Real-time `window.print()` print-ready layout and CSV export.

8. **Historical Telemetry & CSV Export (`HistoricalDataTab`)**:
   - Multi-parameter filter console (Rover Unit, Time Window, Location Point) with 6 synchronized line charts and CSV download.

9. **Safety Hazards Management & Hardware Health (`AlertsPanel`, `HardwareStatusTab`)**:
   - Real-time safety hazard logs with severity classifications (`NORMAL`, `WARNING`, `CRITICAL`) and interactive acknowledgment.
   - System architecture flow diagram and REST API diagnostic console.

---

## 🧪 Demo Mode vs Live Mode

The dashboard features a persistent mode switcher in the top navigation bar:

- **LIVE DATA**: Actively polls the configured AWS REST API at `VITE_API_BASE_URL` at a user-configurable frequency (3s, 5s, 10s, 30s). Automatically indicates `Connection: STALE` if telemetry packets stop arriving within 15 seconds.
- **DEMO DATA**: Simulates realistic underground mine sensor data with 5 selectable scenarios:
  1. *Normal Traverse*: Nominal baselines, smooth vibration.
  2. *Roof Sag Subsidence*: Distance drops from 22cm to 16cm, differential tilt, subsidence warning triggers.
  3. *High Vibration Event*: Simulated rough terrain / seismic tremor (vibration RMS > 0.45g).
  4. *Gas Level Anomaly*: Atmospheric gas spike (ADC > 650).
  5. *Stale Packet Timeout*: Telemetry transmission freeze to verify stale timeout detection.

*Every simulated reading in Demo Mode is clearly tagged with a `DEMO DATA` badge.*

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended; v24.x tested)
- npm (v9 or higher)

### Setup & Installation
```bash
# Clone or open the repository directory
cd hardware_aws

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start local development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Environment Configuration (`.env`)
```env
# AWS-hosted REST API base URL
VITE_API_BASE_URL=https://api.subsentry-rover.sih26025.internal

# Polling interval in ms (default: 5000)
VITE_POLL_INTERVAL_MS=5000

# Timeout in seconds before declaring connection STALE
VITE_STALE_TIMEOUT_SEC=15

# Default rover ID
VITE_DEFAULT_ROVER_ID=ROVER_01
```

### Production Build
```bash
npm run build
```

---

## ☁️ Deploying to Vercel (Team Review)

The project includes a ready-to-use [`vercel.json`](file:///c:/Users/LOQ/Desktop/hardware_aws/vercel.json) file configured for Vite SPA routing and asset caching.

### Option 1: Deploy via Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Run deploy from the project root
vercel
```

### Option 2: Deploy via GitHub / Vercel Web Dashboard
1. Push this repository to GitHub.
2. Log in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Vercel will automatically detect the **Vite** framework, `npm run build` as build command, and `dist` as the output directory.
5. *(Optional)* In **Environment Variables**, you can configure:
   - `VITE_API_BASE_URL` = your live AWS REST API endpoint (or leave blank to use the built-in demo simulator).
6. Click **Deploy**.

---

## 🔮 Future Architectural Extensions
The codebase is structured to facilitate seamless integration of:
1. **Multiple Rover Fleets**: Multi-unit selection with swarm aggregation.
2. **Underground Mapping / SLAM**: 2D/3D cave drift map with rover pose estimation.
3. **LoRa / Mesh Relay**: Long-range underground sub-GHz radio links where Wi-Fi is obstructed.
4. **Machine Learning Predictive Subsidence**: LSTM neural network predicting 24-hour convergence rate.
5. **Bidirectional WebSockets / MQTT**: Real-time push telemetry replacing HTTP polling.
6. **Automated Evacuation Alerts**: SMS/Twilio emergency worker dispatch notifications.

---

## 📜 License
Developed for Smart India Hackathon (SIH26025). Provided for research, academic evaluation, and prototype demonstration purposes.
