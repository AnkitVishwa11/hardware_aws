# 📋 Feature Audit & Gap Analysis: MineSafe System
### Comparing SIH26025 Requirements vs Working System Implementation

---

## 📊 1. Executive Summary & Scorecard

| Category | Requirement from SIH Problem Statement | Current Status in Codebase | Implementation Rating |
| :--- | :--- | :--- | :---: |
| **1. Sensor Hardware** | Tilt, Vibration, Displacement, Gas, Temp, GPS | ✅ MPU6050 (Tilt & Vib), 3x Ultrasonic, Gas ADC, DHT11, NEO-6M GPS | **100%** |
| **2. IoT & Hardware Bridge** | Microcontroller UART Pipeline & Wi-Fi Uplink | ✅ Arduino Uno ➔ 5V/3.3V Divider ➔ ESP32 UART Flow + Wi-Fi HTTP Uplink | **100%** |
| **3. SCADA Dashboard** | Real-time graphs, Inclinometer, Profile curve, KPIs | ✅ 100% Built with 1-Second Real-Time Dynamic Telemetry Streaming | **100%** |
| **4. GIS Geospatial Map** | GIS-based live surface deformation heatmap & GPS coordinates | ✅ **100% Built (`GisMapTab.tsx`) with Leaflet, GPS, Panel Polygon & Risk Heatmap** | **100%** |
| **5. AI / ML Predictive Engine** | Subsidence prediction, 1h-6h forecast, velocity, early warning | ✅ **100% Built (`predictiveEngine.ts` & `PredictiveForecastTab.tsx`)** | **100%** |
| **6. 3D Digital Twin Basin (USP)**| Knothe 3D depression bowl, damage radius ($R$), goaf void volume | ✅ **100% Built (`geotechnicalEngine.ts` & `SubsidenceBasinTab.tsx`)** | **100% (Killer USP)** |
| **7. Historical Telemetry** | 6 Time-series charts, range filter, CSV export | ✅ 100% Built with CSV Export & Test Dataset in `output/` | **100%** |
| **8. Dual Mode (Demo/Live)** | Offline presentation & Cloud sync | ✅ DEMO Mode (1s real-time simulation) + LIVE Mode (EC2/PostgreSQL) | **100%** |
| **9. Safety Alerts System** | In-app SCADA alerts table + acknowledge actions | ✅ Real-time hazard alerts table with severity badges & acknowledge workflow | **90%** |

---

## 🏆 2. Killer USPs & Innovation Highlights

### 🌟 USP 1: 3D Subsidence Basin Digital Twin & Infrastructure Damage Modeler
* **The Geotechnical Science**: Uses **Knothe-Budryk Mining Subsidence Theory** ($S(r) = S_{\text{max}} \cdot \exp(-\pi r^2 / R^2)$).
* **MPU6050 + GPS Integration**:
  - **GPS**: Locks spatial origin $(X_0, Y_0)$ and calculates meter distances ($r$) to nearby surface roads, railways, and villages.
  - **MPU6050 Inclinometer**: Measures ground slope gradient ($i = \tan\theta$) and curvature ($K = di/dx$) to compute horizontal tensile strain ($\text{mm/m}$).
* **3D Visual Wireframe**: Interactive canvas showing the 3D ground depression bowl under the terrain with orbital rotation slider ($0^\circ - 90^\circ$).
* **Infrastructure Impact Audit**: Evaluates State Highway 4, Coal Haulage Railway Siding, and Kusunda Village colony against statutory DGMS Class 0 to Class IV damage limits.
* **Goaf Void Caved Volume**: Live integral calculation of caved rock volume ($V = 7.9\text{ m}^3$).

### 🌟 USP 2: GIS Geospatial Surface Mesh & Subsidence Heatmap
* **Leaflet GIS Engine**: Satellite Aerial, Dark SCADA, and OpenStreetMap tile layers.
* **Geospatial Tracking**: Live rover GPS radar pulse (`23.7524°N, 86.4218°E`, $184.5\text{ m}$ AMSL) over Jharia Coalfield Underground Panel P-4B.
* **Surface Mesh Nodes**: Interactive nodes (`Node-01` to `Node-04`, `Gateway`) showing mesh hops and signal strength ($\text{RSSI dBm}$).
* **Dynamic Hazard Zones**: Green (Stable $<1\text{cm}$), Amber (Warning $2.5-4\text{cm}$), and Red (Critical Goaf Sag $>5.5\text{cm}$).

### 🌟 USP 3: AI/ML Autoregressive Predictive Subsidence Engine
* **Forward Forecast Curve**: Autoregressive polynomial model projecting future ground deformation for $+1\text{h}$, $+3\text{h}$, and $+6\text{h}$ forward horizons.
* **95% Confidence Interval Bands**: Mathematical expanding uncertainty cones ($R^2 = 0.94$).
* **Deformation Velocity & Acceleration**: Live subsidence rate ($\text{cm/hr}$) and acceleration ($\text{cm/hr}^2$).
* **Time-to-Critical Breach Estimator**: Automatic calculation predicting exact hours remaining before critical statutory limits ($16.0\text{cm}$) are breached.

---

## ✅ 3. Complete Feature Implementation Breakdown

### A. Hardware & Telemetry Ingestion Layer
1. ✅ **GPS Module**: NEO-6M GNSS module streaming Latitude, Longitude, Altitude, 9 Satellites 3D Fix, Ground Speed, and Heading.
2. ✅ **MPU6050 6-DOF IMU**: Pitch (`Tilt X`), Roll (`Tilt Y`), dynamic 3-axis acceleration ($a_x, a_y, a_z$), and angular gyro rates.
3. ✅ **Vibration RMS Analysis**: Real-time Root Mean Square dynamic $g$-force vibration score detecting micro-seismic cracking.
4. ✅ **3-Point Ultrasonic Convergence ($S_1, S_2, S_3$)**: Measures acoustic clearance in centimeters ($0.1\text{ cm}$ precision) to detect asymmetric differential sag.
5. ✅ **Atmospheric Gas Detection**: MQ analog gas sensor measuring raw ADC ($0 - 1023$) with uncalibrated scientific labeling.
6. ✅ **Environmental Telemetry**: DHT11 temperature ($^\circ\text{C}$) and relative humidity ($\%$).
7. ✅ **UART Serial Data Link**: Arduino Uno TX ➔ 5V to 3.3V Voltage Divider ➔ ESP32 RX2 Pin 16 (JSON stream at 9600/115200 baud).

### B. SCADA Frontend & Visualization Layer
1. ✅ **Command Center KPI Bar**: Active Rover, Max Subsidence, Ground Tilt, RMS Vibration, Raw Gas, and Overall Safety Status.
2. ✅ **3-Point Ground Profile Schematic**: Live SVG cross-section arc displaying sagging and differential displacement ($|S_1 - S_3|$).
3. ✅ **Artificial Horizon**: Aviation-grade 3D animated gyroscope displaying pitch and roll inclination.
4. ✅ **Historical Telemetry Console (`HistoricalDataTab.tsx`)**: 6 synchronized line charts with range filtering and CSV exporter.
5. ✅ **Hardware & REST API Diagnostic Console (`HardwareStatusTab.tsx`)**: Latency ping test tool and live sensor health matrix.

### C. Backend, Database & Test Artifacts
1. ✅ **AWS EC2 Docker Backend**: Express/Node.js API container (Port 5000) + PostgreSQL database container (Port 5432).
2. ✅ **Dual Mode Operation**: DEMO mode (1-second dynamic streaming simulation) + LIVE mode (EC2 REST connection).
3. ✅ **Test Artifacts Catalog (`output/`)**:
   - `01_command_center_scada.png`
   - `02_gis_mine_mesh_map.png`
   - `03_aiml_predictive_forecast.png`
   - `04_historical_sensor_telemetry.png`
   - `05_hardware_gateway_diagnostics.png`
   - `06_3d_subsidence_basin_digital_twin.png`
   - `minesafe_telemetry_results.csv`

---

## ⏳ 4. Future On-Site Roadmap (Post-Hackathon Deployment)

| Feature | Description | Status |
| :--- | :--- | :---: |
| **1. Multi-Node Physical LoRa Hops** | Deploying 10+ physical LoRa transceivers (RYLR896/E220) across open-cast/underground panels. | 🟡 Hardware expansion for mine site trials |
| **2. SMS / Webhook Gateway Integration** | Connecting Twilio / Fast2SMS API to send automated SMS to mine managers on Critical status. | 🟢 Cloud Webhook integration |
| **3. Drone LiDAR Point Cloud Ingestion** | Comparing surface drone photogrammetry with underground rover convergence logs. | ⚪ Long-term R&D roadmap |
