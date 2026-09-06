# 📋 Feature Audit & Gap Analysis: MineSafe System
### Comparing SIH26025 Requirements vs Current Codebase Implementation

---

## 📊 Summary Scorecard

| Category | Requirement from SIH Problem Statement | Current Status in Codebase | Implementation Rating |
| :--- | :--- | :--- | :---: |
| **1. Sensor Hardware** | Tilt, Vibration, Displacement, Gas, Temp, GPS | ✅ MPU6050 (Tilt & Vib), 3x Ultrasonic, Gas ADC, DHT11, GPS Module | **100%** |
| **2. IoT Networking** | Wireless Mesh / Serial UART Ingestion | ✅ Arduino Uno ➔ 5V/3.3V Divider ➔ ESP32 UART Flow + Wi-Fi HTTP Uplink | **90%** |
| **3. SCADA Dashboard** | Real-time graphs, Inclinometer, Profile curve, KPIs | ✅ 100% Fully Built, 1-second dynamic streaming | **100%** |
| **4. GIS Geospatial Map** | GIS-based live surface deformation heatmap & coordinates | ✅ **100% Built (`GisMapTab.tsx`) with Leaflet, GPS, Panel Polygon & Risk Heatmap** | **100%** |
| **5. AI / ML Predictive Engine** | Subsidence prediction, 1h-6h forecast, velocity, early warning | ✅ **100% Built (`predictiveEngine.ts` & `PredictiveForecastTab.tsx`)** | **100%** |
| **6. Historical Data** | 6 Time-series charts, range filter, CSV export | ✅ 100% Fully Built with CSV Export & Test Dataset in `output/` | **100%** |
| **7. Dual Mode (Demo/Live)** | Offline presentation & Cloud sync | ✅ DEMO Mode (1s real-time simulation) + LIVE Mode (EC2/PostgreSQL) | **100%** |
| **8. Alert System** | In-app SCADA alerts table + acknowledge actions | ✅ Real-time hazard alerts table with severity badges & acknowledge workflow | **85%** |

---

## ✅ 1. KYA-KYA ABHI PROJECT ME HAI (Currently Built & Working)

### A. Hardware & Telemetry Ingestion Layer
1. ✅ **GPS Positioning Module**: Live Latitude, Longitude, Altitude ($184.5\text{ m}$ AMSL), 9 Satellites 3D Fix, Ground Speed, aur Heading compass degrees.
2. ✅ **Tilt & Inclination Monitoring**: MPU6050 IMU calculating Pitch (`Tilt X`) and Roll (`Tilt Y`) in degrees.
3. ✅ **Vibration RMS Analysis**: 3-axis accelerometer dynamic RMS acceleration ($g$ force) detecting micro-seismic vibrations.
4. ✅ **3-Point Ultrasonic Displacement Monitoring**: 3 × HC-SR04 sensors (Left `S1`, Center `S2`, Right `S3`) measuring acoustic distance to ground/roof in centimeters ($0.1\text{ cm}$ precision).
5. ✅ **Atmospheric Gas Detection**: MQ-series analog gas sensor reading raw ADC count ($0 - 1023$) with scientific labeling.
6. ✅ **Environmental Telemetry**: DHT11 ambient temperature ($^\circ\text{C}$) and relative humidity ($\%$) sensing.
7. ✅ **UART Serial Data Link**: Arduino Uno TX ➔ 5V/3.3V Voltage Divider ➔ ESP32 RX2 (Pin 16) JSON streaming.

### B. SCADA Frontend & Visualization Layer
1. ✅ **Command Center KPI Bar**: Top summary metrics (Active Rover, Max Subsidence, Ground Tilt, RMS Vibration, Raw Gas, Overall Safety Status).
2. ✅ **Interactive 3-Point Ground Profile Schematic**: Live SVG curved arc showing real-time roof sagging and differential left-to-right sag ($|S_1 - S_3|$).
3. ✅ **Artificial Horizon (Aviation-Grade Inclinometer)**: 3D-styled animated pitch/roll gyroscope gauge.
4. ✅ **Vibration Spectrum Panel**: Dynamic RMS status, peak acceleration, and stationary vibration hold metrics.
5. ✅ **GIS Surface Mesh & Mine Map (`GisMapTab.tsx`)**:
   - Leaflet interactive map with Dark SCADA, Satellite Aerial, and OSM layer switcher.
   - Live rover radar marker with dynamic heading and GPS coordinates.
   - Underground Panel P-4B boundary polygon overlay (Jharia Coalfield Sector).
   - Surface mesh anchor nodes with node-to-node signal lines ($\text{RSSI dBm}$) and interactive inspector card.
   - Color-coded Subsidence Risk Heatmap (Green = Stable, Amber = Warning $2.5-4.0\text{cm}$, Red = Critical Sag $>5.5\text{cm}$).
6. ✅ **AI/ML Predictive Subsidence Engine (`PredictiveForecastTab.tsx`)**:
   - Autoregressive forward projection curve (+1h to +6h horizon).
   - Expanding 95% confidence interval uncertainty bands ($R^2 = 0.94$).
   - Real-time ground deformation velocity ($\text{cm/hr}$) and acceleration ($\text{cm/hr}^2$).
   - Automated time-to-critical breach estimator (e.g. `1.8 hours remaining`).
   - AI Early Warning advisory banner for mine shift supervisors.
7. ✅ **Historical Telemetry Console (`HistoricalDataTab.tsx`)**:
   - 6 interactive time-series line graphs (Distance, Tilt, Vibration, Gas, Temperature, Humidity).
   - Time range filtering (`1h`, `6h`, `24h`, `All`), Rover unit selector, and Search.
   - One-click **Export to CSV** for historical logs.
8. ✅ **Hardware & REST API Diagnostic Console (`HardwareStatusTab.tsx`)**:
   - REST endpoint ping latency test tool.
   - Sensor health matrix (HC-SR04 1-3, MPU6050, Gas, DHT11, GPS, ESP32).
   - Live JSON payload inspector.

### C. Logic, Safety & Dual-Mode Engine
1. ✅ **Multi-Factor Risk Assessment Engine (`riskEngine.ts`)**:
   - Combines Ground Displacement (35 pts), Rate of Sag (10 pts), Tilt (25 pts), Vibration (20 pts), Gas (25 pts), and Environment (15 pts).
   - Normalizes to a $0 - 100$ risk score and classifies into **NORMAL**, **WARNING**, or **CRITICAL**.
2. ✅ **1-Second Real-Time Live Streaming Simulation**:
   - Seamless per-second telemetry generation in DEMO mode across all sensors, GPS pathing, and IMU vectors.
3. ✅ **Dual Mode Engine (Demo vs Live)**:
   - **DEMO Mode**: 5 offline demonstration scenarios (Normal, Roof Sag Subsidence, High Vibration, Gas Anomaly, Stale Connection).
   - **LIVE Mode**: Automated REST polling ($1\text{s} - 30\text{s}$) connecting to AWS EC2 Docker (Node.js API + PostgreSQL).
4. ✅ **Output Test Artifacts Catalog (`output/`)**:
   - 5 high-resolution screenshot images of all result graphs.
   - Formatted CSV telemetry dataset (`minesafe_telemetry_results.csv`).
   - Catalog index file (`output/README.md`).

---

## ⏳ 2. KYA-KYA FUTURE ROADMAP ME HAI (Optional Additions for On-Site Trials)

| Feature | Description | Status / Plan |
| :--- | :--- | :---: |
| **1. Multi-Node Physical Mesh Hops** | Expanding the single rover UART gateway to 10+ stationary physical LoRa mesh field nodes. | 🟡 Hardware expansion for field trials |
| **2. External SMS / Webhook Gateway** | Connecting Twilio / AWS SNS / Fast2SMS API to send direct SMS to shift managers on Critical Risk. | 🟢 Backend Webhook integration |
| **3. Drone LiDAR Cross-Validation** | Ingesting surface drone 3D point clouds to compare with rover acoustic convergence data. | ⚪ Post-hackathon R&D roadmap |
