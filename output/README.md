# 📊 SubSentry Rover — Result Graphs & Test Artifacts Catalog
### Smart India Hackathon (SIH26025) Testing & Visual Output

This folder contains the captured visual graphs, GIS geospatial maps, AI predictive forecast charts, and raw telemetry logs generated during real-time system testing.

---

## 📁 Output Artifacts Directory

| File Name | View Type | Description |
| :--- | :--- | :--- |
| **`01_command_center_scada.png`** | **Command Center Master SCADA** | Real-time 3-point ground displacement profile, artificial horizon inclinometer, vibration RMS, gas level, and composite risk gauge. |
| **`02_gis_mine_mesh_map.png`** | **GIS Surface Mesh & Mine Map** | Interactive Leaflet GIS map with GPS coordinates, Panel P-4B boundary polygon, surface mesh nodes, and subsidence risk heatmap. |
| **`03_aiml_predictive_forecast.png`** | **AI/ML Predictive Subsidence Engine** | Polynomial forward projection curve (+1h to +6h), 95% confidence interval bands, deformation velocity ($10.0\text{ cm/hr}$), and early warning advisory. |
| **`04_historical_sensor_telemetry.png`** | **Historical Telemetry Logs** | Multi-parameter query console with 6 time-series line charts ($S_1/S_2/S_3$, Tilt, Vibration, Gas, Temp, Humidity) and CSV exporter. |
| **`05_hardware_gateway_diagnostics.png`** | **Hardware & Gateway Health** | System architecture block diagram, REST API diagnostic tool, and individual sensor health status. |
| **`06_3d_subsidence_basin_digital_twin.png`** | **3D Subsidence Digital Twin (USP)** | Knothe empirical 3D ground depression bowl, damage radius ($R = 56\text{m}$), horizontal strain ($\text{mm/m}$), caved goaf volume ($7.9\text{ m}^3$), and infrastructure vulnerability audit. |
| **`subsentry_telemetry_results.csv`** | **Raw Telemetry Dataset (CSV)** | Exported time-series records formatted for AI model training and DGMS compliance auditing. |

---

## 🖼️ Visual Breakdown of Result Graphs

### 1. Master Command Center Dashboard (`01_command_center_scada.png`)
* **3-Point Ground Profile Arc**: Measures roof/ground sagging across $S_1$ (Left), $S_2$ (Center), and $S_3$ (Right).
* **Artificial Horizon**: Displays live Pitch & Roll inclination degrees to prevent rover rollover.
* **Vibration Spectrum**: Isolates micro-seismic dynamic shockwaves indicating rock fracture initiation.

---

### 2. GIS Surface Mesh & Mine Map (`02_gis_mine_mesh_map.png`)
* **Real-time GPS Telemetry**: `23.75061°N, 86.42157°E` with 9 Satellites 3D Fix and Altitude ($183.0\text{ m}$).
* **Wireless Mesh Routing**: Visualizes node-to-node signal links ($\text{RSSI dBm}$) between surface anchors and base gateway.
* **Subsidence Risk Zones**: Highlights green (stable), amber (moderate sag), and red (critical goaf boundary) risk areas.

---

### 3. AI/ML Predictive Forecast Engine (`03_aiml_predictive_forecast.png`)
* **Predictive Horizon**: Projects future ground sag trajectory for $+1\text{h}$, $+3\text{h}$, and $+6\text{h}$.
* **Model Confidence**: $R^2 = 0.94$ ($94\%$ statistical confidence).
* **Time-to-Critical Breach**: Automatically calculates estimated hours remaining until critical statutory limit breach.
