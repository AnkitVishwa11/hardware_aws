# ⛏️ MineSafe — AI-Enabled Low-Cost Real-Time Mine Subsidence Monitoring & Early Warning System
### Problem Statement: SIH26025 (Underground Coal Mines in India)

---

## 📖 1. What is the Problem? (Layman & Mining Engineering Context)

### 🌍 Underground Coal Mine Subsidence Explained in Simple Terms
In underground coal mining (such as in **Jharia, Raniganj, Singareni, Korba**), coal is extracted from deep underground panels (using *Bord & Pillar* or *Longwall* mining methods). 

When coal is extracted, massive empty voids (called *goaf*) are created underground. Over time, the heavy weight of the overlying rock layers (overburden strata) causes the roof to sag, crack, and eventually cave in. This causes:
1. **Underground Roof Collapse**: Threatens the lives of underground miners.
2. **Surface Subsidence (Ground Sinking)**: The surface land above the mine sinks, creating massive cracks, damaging roads, railways, buildings, pipelines, and releasing trapped toxic/explosive gases (Methane $\text{CH}_4$, Carbon Monoxide $\text{CO}$).

```
========================= SURFACE GROUND LEVEL =========================
   [Surface Mesh Nodes]         [Crack Formation]       [Surface Sinking]
           ▼                            ▼                       ▼
   ┌───────┴───────┐             / / / / / / /         \               /
   │ Wireless Node │            /             /         \  Subsidence /
   └───────────────┘           /               /         \   Trough   /
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                         OVERBURDEN ROCK STRATA
                        (Layers of Sandstone & Shale)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   ▲ Roof Sagging               ▲ Rock Fracture          ▲ Micro-Vibrations
   │                            │                        │
┌──┴────────────────────────────┴────────────────────────┴─────────────┐
│                 UNDERGROUND COAL SEAM / MINE PANEL                   │
│                                                                      │
│   [ROVER INSPECTION NODE] ───► Traverses haulage roadways            │
│   (Ultrasonic S1/S2/S3, Inclinometer, Vibration, Gas, Temp/Humidity) │
│                                                                      │
│   [COAL PILLAR]              [VOID / GOAF AREA]        [COAL PILLAR] │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 💡 2. The Innovation Hook: Why Traditional Systems Fail & What Makes This Unique

| Traditional Methods | Why They Fail | **MineSafe Solution** |
| :--- | :--- | :--- |
| **Manual Surveying (Total Stations / Levelling Pegs)** | Requires manual surveyor visits; cannot detect sudden overnight collapses. | **Continuous 24/7 Automated IoT Telemetry**. |
| **Satellite InSAR Radar** | Revisit time is days to weeks; zero underground visibility; weather & cloud interference. | **Real-time Surface Wireless Mesh + Underground Mobile Rover Node**. |
| **Expensive Imported Geotechnical Sensors** | Costs lakhs to crores of INR; impractical for widespread deployment across Indian mines. | **Low-Cost Distributed Hardware** (Arduino / ESP32 / LoRa Mesh / MEMS sensors). |
| **Single-Parameter Alerts** | High false alarm rate. | **Multi-Sensor AI/ML Fusion** (Displacement + Tilt + Vibration + Gas). |

---

## 📊 3. Deep Dive: Every Graph, Visual & Sensor Explained

Here is the exhaustive analysis of every component in the **MineSafe SCADA Dashboard**, why it was chosen, how it works, and its mathematical significance:

```
+----------------------------------------------------------------------------------------------------+
|                                    MASTER COMMAND CENTER SCADA                                     |
+----------------------------------------------------------------------------------------------------+
|  [1. Ground Subsidence & Convergence]         [2. 3-Point Ground Profile Schematic]               |
|  - Time-Series Line Graph (S1, S2, S3)        - SVG Roof Cross-Section Arc                         |
|  - Measures distance sag over time            - Calculates Differential S1-S3 tilt & sag           |
+-----------------------------------------------+----------------------------------------------------+
|  [3. Rover Orientation & Artificial Horizon]  [4. Structural Vibration RMS Analysis]               |
|  - Pitch (Tilt X) & Roll (Tilt Y)             - Real-time RMS g-force vibration spikes             |
|  - Inclinometer warning when ground tilts     - Detects micro-seismic rock fracture signatures     |
+-----------------------------------------------+----------------------------------------------------+
|  [5. Atmospheric Gas Telemetry]               [6. Environmental Temperature & Humidity]            |
|  - Raw ADC reading (0 - 1023)                 - Monitors mine atmosphere & strata moisture         |
|  - Detects trapped gas leakage from fractures - High humidity indicates potential water inundation |
+-----------------------------------------------+----------------------------------------------------+
|  [7. Multi-Factor Risk Assessment Engine]     [8. Real-Time Safety Alerts Table]                   |
|  - Weighted 0-100 Composite Risk Index        - Active / Acknowledged / Resolved status            |
|  - Automated Safety Rule & ML Classification  - Instant warning dispatch                           |
+----------------------------------------------------------------------------------------------------+
```

---

### 🔍 Detailed Breakdown of Every Graph & Component:

### 1️⃣ Ground Subsidence & Acoustic Convergence Graph (`S1`, `S2`, `S3`)
* **Sensors Used**: 3 × HC-SR04 Ultrasonic Distance Sensors (Left `S1`, Center `S2`, Right `S3`).
* **Graph Type**: Real-time multi-line time-series graph with Warning (18 cm) & Critical (16 cm) threshold lines.
* **Why it is Needed**:
  * As the roof sags or the surface settles, the distance between the sensor and the reference strata reduces.
  * Having **3 sensors (Left, Center, Right)** allows detecting **Differential Convergence** (e.g. if the left side is sagging faster than the right, it indicates an asymmetric shear fault).
* **Mathematical Formula**:
  $$\Delta d = d_{\text{current}} - d_{\text{baseline}}$$
  $$\text{Rate of Convergence} = \frac{\Delta d}{\Delta t} \quad (\text{cm/min})$$
  * Thresholds: Nominal = $22.0\text{ cm}$, Warning = $\le 18.0\text{ cm}$, Critical Sag = $\le 16.0\text{ cm}$.

---

### 2️⃣ 3-Point Ground Profile Schematic (SVG Cross-Section)
* **What it is**: An interactive graphical cross-section showing the physical deformation curve across S1, S2, and S3.
* **Why it is Needed**:
  * Mining engineers and shift in-charges need an immediate visual mental model of roof deformation rather than raw numbers.
  * It visually calculates:
    1. **Roof Convergence Sag**: Maximum downward displacement across all 3 sensors.
    2. **Differential Displacement ($|S_1 - S_3|$)**: Shows if the ground is tilting laterally.

---

### 3️⃣ Artificial Horizon & Inclinometer (Pitch `Tilt X` & Roll `Tilt Y`)
* **Sensor Used**: MPU6050 6-DOF Inertial Measurement Unit (IMU).
* **Why it is Needed**:
  * When subsidence begins, the ground never drops perfectly flat; it develops an angular slope (tilt angle $\theta$).
  * Pitch ($\theta_x$) detects front-to-back incline; Roll ($\theta_y$) detects left-to-right lateral tilt.
  * Excessive tilt ($> 15^\circ$ warning, $> 25^\circ$ critical) warns of immediate rover rollover hazard and severe ground shear.
* **Mathematical Formula**:
  $$\text{Pitch } (\theta_x) = \arctan\left(\frac{a_x}{\sqrt{a_y^2 + a_z^2}}\right) \times \frac{180^\circ}{\pi}$$
  $$\text{Roll } (\theta_y) = \arctan\left(\frac{a_y}{\sqrt{a_x^2 + a_z^2}}\right) \times \frac{180^\circ}{\pi}$$

---

### 4️⃣ Vibration RMS Analysis Panel
* **Sensor Used**: 3-Axis Accelerometer ($a_x, a_y, a_z$).
* **Why it is Needed**:
  * Before a rock layer collapses, internal micro-cracking and strata shearing emit **micro-seismic vibration bursts**.
  * Measuring Root Mean Square (RMS) acceleration filters out background noise and isolates dangerous structural dynamic vibrations.
* **Mathematical Formula**:
  $$a_{\text{magnitude}} = \sqrt{a_x^2 + a_y^2 + a_z^2}$$
  $$\text{Vibration RMS} = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (a_i - g)^2}$$
  * Thresholds: Warning $\ge 0.35\text{ g}$, Critical $\ge 0.70\text{ g}$.

---

### 5️⃣ Atmospheric Gas Telemetry (`Raw ADC Count: 0 - 1023`)
* **Sensor Used**: MQ-series Analog Gas Sensor (connected to Analog ADC pin).
* **Why it is Needed**:
  * Strata fractures open pathways for dangerous gases trapped in coal seams (Methane $\text{CH}_4$, Carbon Monoxide $\text{CO}$) to seep into roadways.
  * Sudden spikes in gas concentration frequently precede roof falls due to strata de-gassing.
* **Why Labeled "Raw Sensor Value"**:
  * Standard analog gas sensors without certified laboratory calibration cannot accurately claim true parts-per-million (PPM). Displaying raw ADC values (0–1023) maintains **scientific honesty and DGMS compliance**.

---

### 6️⃣ Environmental Telemetry (Temperature & Humidity)
* **Sensor Used**: DHT11 Temperature & Humidity Sensor.
* **Why it is Needed**:
  * Underground mines have high geothermal gradients and ventilation requirements.
  * High humidity combined with temperature drops indicates underground water accumulation or ventilation failure.

---

### 7️⃣ Multi-Sensor AI/Rule-Based Risk Assessment Engine (`riskEngine.ts`)
* **What it does**: Computes a single unified Risk Index ($0 - 100$) and categorizes risk into **NORMAL**, **WARNING**, or **CRITICAL**.
* **Composite Weight Distribution**:
  $$\text{Risk Score} = W_{\text{disp}} + W_{\text{rate}} + W_{\text{tilt}} + W_{\text{vib}} + W_{\text{gas}} + W_{\text{env}}$$
  | Hazard Factor | Max Weight Contribution | Critical Condition |
  | :--- | :--- | :--- |
  | **Ground Displacement** | **35 Points** | Displacement $\ge 4.0\text{ cm}$ from baseline |
  | **Rate of Convergence** | **10 Points** | Rate $\ge 1.5\text{ cm/min}$ |
  | **Rover Tilt (X/Y)** | **25 Points** | Tilt angle $\ge 25^\circ$ |
  | **Vibration RMS** | **20 Points** | RMS $\ge 0.70\text{ g}$ |
  | **Raw Gas Level** | **25 Points** | Raw ADC $\ge 700$ |
  | **Environment (Temp/Hum)** | **15 Points** | Temp $\ge 45^\circ\text{C}$ or Humidity $\ge 90\%$ |

---

### 8️⃣ Historical Telemetry & CSV Export Console (`HistoricalDataTab.tsx`)
* **Features**:
  * 6 synchronized time-series charts (Distance, Tilt, Vibration, Gas, Temp, Humidity).
  * Filter by Time Range (`1h`, `6h`, `24h`, `All`), Rover ID, or Stationary Point (`MP-01`, `MP-02`).
  * One-click **Export to CSV** for offline machine learning model training and compliance reporting.

---

## 🔀 4. Complete System Architecture & Data Flow (Layman Diagram)

```mermaid
flowchart TD
    subgraph Underground [1. Under Underground Mine Panel / Surface]
        Sensors["Sensors: Ultrasonic (S1/S2/S3) + MPU6050 + Gas + DHT11"]
        Arduino["Arduino Uno (Sensor Acquisition Node)"]
        Sensors --> Arduino
        Arduino -->|UART Serial JSON| ESP32["ESP32 Gateway (WiFi / LoRa Mesh Node)"]
    end

    subgraph Cloud [2. AWS EC2 Cloud Backend (Dockerized)]
        ESP32 -->|HTTP POST /api/sensor-data| APIServer["Node.js / Express API Container (Port 5000)"]
        APIServer -->|SQL Insert| PostgresDB[("PostgreSQL Database (Port 5432)<br/>Table: sensor_telemetry")]
        PostgresDB -->|SQL Query Latest/History| APIServer
    end

    subgraph ControlRoom [3. Mine Safety Control Room & Surface Operators]
        APIServer -->|HTTP GET /api/latest, history, alerts| WebDashboard["React SCADA Dashboard (App.tsx)"]
        WebDashboard --> RiskEngine["AI/Rule-Based Risk Engine (0-100 Score)"]
        RiskEngine --> Visuals["Live 3-Point Profile, Artificial Horizon, Vibration & Alert Dispatch"]
    end
```

---

## 🇮🇳 5. Why this is a Game Changer for Indian Coal Mining (SIH Impact)

1. **Ultra Low-Cost & Accessible**:
   - Built with off-the-shelf microcontrollers (ESP32 / Arduino Uno), making it 10x to 50x cheaper than imported industrial extensometer setups.
2. **Resilient Dual-Mode Operation**:
   - Includes **DEMO Mode** (built-in simulator with 5 failure scenarios) and **LIVE Mode** (AWS EC2 + PostgreSQL REST connection).
3. **DGMS Regulatory Ready**:
   - Incorporates strict prototype disclaimers, raw sensor labeling, and historical audit logs complying with Directorate General of Mines Safety standards.
4. **Scalable Mesh Architecture**:
   - Can easily scale from a single rover to a surface mesh of dozens of stationary anchor nodes across large coalfields.
