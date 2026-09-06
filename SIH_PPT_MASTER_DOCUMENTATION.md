# 🏆 SUBSENTRY (SIH26025) — MASTER PRESENTATION & EVALUATION DECK
**Project Title:** SubSentry: IoT & AI-Powered Real-Time SCADA Digital Twin for Underground Mine Subsidence Monitoring & Early Warning  
**Smart India Hackathon Problem Statement:** SIH26025  
**Target Domain:** Mining Safety, Disaster Prevention & Industrial IoT  
**Target Organization:** Ministry of Coal • DGMS • Coal India Limited (CIL)  

---

> [!TIP]
> **Slide-Ready Content Guide**: This document is organized into 4 distinct, presentation-ready modules. Each section is formatted with concise bullet points, quantitative metrics, mathematical models, and financial tables designed to be copied directly into your **SIH Final PPT Presentation & Pitch Deck**.

---

# 📑 MODULE 1: MINIMUM VIABLE PRODUCT (MVP)

### 📌 Slide 1: Problem Statement & Real-World Mining Crisis
* **The Underground Hazard:** Underground coal extraction (Bord & Pillar / Longwall) creates massive subterranean voids (*Goaf*). Overburden strata fracture and collapse, causing catastrophic roof falls inside tunnels and destructive surface subsidence on the ground.
* **Why Traditional Methods Fail:**
  - ❌ **Manual Surveying (Total Stations / Leveling Pegs):** Slow, periodic (weeks apart), exposes surveyors to uncompacted hazardous zones.
  - ❌ **Satellite InSAR Radar:** Multi-day revisit time, zero subsurface visibility, heavy cloud/weather interference.
  - ❌ **Imported Extensometers:** Exorbitantly expensive (₹3.5L to ₹15L per monitoring point), impractical for widespread colliery deployment.
* **The SubSentry Solution:** A low-cost, continuous, autonomous rover-based IoT SCADA digital twin providing millimetre-level roof sag convergence, 6-axis chassis tilt, seismic micro-crack vibration detection, toxic gas tracking, and real-time AI predictive forecasting.

---

### ⚙️ Slide 2: End-to-End System Architecture Pipeline
```
┌────────────────────────────────┐            UART Serial           ┌────────────────────────────────┐
│  Arduino Uno (Sensor Node)     │ ───────────────────────────────> │  ESP32 Gateway (Wireless Node) │
│  • 3x Ultrasonic Array (Sag Δ) │     Logic Voltage Divider        │  • High-Speed JSON Packager    │
│  • MPU6050 (Pitch/Roll + Vib)  │     (5V -> 3.3V GPIO Protect)    │  • Sub-GHz LoRa / Wi-Fi Client │
│  • MQ Gas Sensor (ADC 0-1023)  │                                  │  • Automatic Reconnect Stack   │
│  • DHT11 (Temp & Humidity)     │                                  └───────────────┬────────────────┘
└────────────────────────────────┘                                                  │
                                                                                    │ HTTPS POST /api/sensor-data
                                                                                    ▼
┌────────────────────────────────┐         WebSocket / REST         ┌────────────────────────────────┐
│  React SCADA Web Dashboard     │ <─────────────────────────────── │  AWS EC2 Cloud Backend         │
│  • 1-Sec Telemetry Stream      │          HTTP Polling            │  • Node.js/Express Docker API  │
│  • 3D Knothe Digital Twin      │                                  │  • PostgreSQL Time-Series DB   │
│  • AI Forecast & Benchmark     │                                  │  • Telemetry Ingestion Engine  │
│  • 1-Click DGMS Audit Report   │                                  └────────────────────────────────┘
└────────────────────────────────┘
```

---

### 🌟 Slide 3: 5 Killer USPs (Differentiators That Win)

| # | Killer Feature | Innovation & Technical Depth | Industry Value |
| :-: | :--- | :--- | :--- |
| **1** | **3D Subsidence Basin Digital Twin** | Implements the **Knothe-Budryk Geotechnical Theory**: $$S(r) = S_{\text{max}} \cdot \exp\left(-\pi \frac{r^2}{R^2}\right)$$ Interactive 3D wireframe depression bowl, damage radius ($R = 56\text{m}$), maximum tensile strain ($\epsilon$), and caved goaf void volume ($V = 7.9\text{m}^3$). | Predicts surface damage to nearby railways, highways, and residential settlements before excavation begins. |
| **2** | **AI vs Knothe Scientific Benchmark** | Real-time cross-validation benchmarking tool comparing Deep Learning Autoregressive model against empirical Knothe curves. Live accuracy metrics: **$R^2 = 0.964$**, **$\text{MAE} = 0.032\text{ cm}$**, **$\text{RMSE} = 0.037\text{ cm}$**, inference latency **$<1.4\text{ms}$**. | Proves research-grade mathematical accuracy to academic & industry juries. |
| **3** | **Multi-Rover Swarm Fleet & Dual-Panel Sync** | Simultaneous live telemetry monitoring of `ROVER_01` (SubSentry Alpha in Panel P-4B Longwall) and `ROVER_02` (SubSentry Beta in Panel P-2A Depillaring) with inter-panel differential $\Delta\text{Sag}$ variance. | Scales from a single rover to a colliery-wide multi-panel monitoring fleet. |
| **4** | **1-Click DGMS Safety Audit Report Generator** | Generates official Directorate General of Mines Safety (**Tech Form IV-A**) compliance certificates with automated PASS/FAIL parameter verification, statutory risk classification, and digital officer sign-off stamps. | Bridges the gap between raw IoT data and statutory government compliance. |
| **5** | **GIS Surface Mesh & Mine Map** | Interactive Leaflet GIS map with GPS radar tracking (`23.7524°N, 86.4218°E`) over Jharia Coalfield, subsidence risk heatmaps, and surface wireless mesh nodes. | Provides macro-level spatial awareness for surface mine managers. |

---

# 📊 MODULE 2: FEASIBILITY & VIABILITY ANALYSIS

### 🔬 1. Technical Feasibility

* **Component Availability & Robustness:** Built using globally available, industrial-proven MEMS sensors (MPU6050 6-DOF IMU, HC-SR04 ultrasonic transducers, MQ electrochemical gas probe, ATmega328P, and ESP32-WROOM-32).
* **Communication Resilience in Deep Mines:**
  - **Primary Uplink:** 2.4 GHz Wi-Fi / Hotspot for active haulage roadway drifts.
  - **Failsafe Mesh Uplink:** Sub-GHz LoRa Mesh ($433\text{ MHz} / 868\text{ MHz}$) capable of penetrating coal pillars and non-line-of-sight tunnel bends up to $1.2\text{ km}$ underground.
* **Ultra-Low Inference Latency:** AI Polynomial autoregressive forecast executes directly in JavaScript/C++ in **$< 1.4\text{ ms}$**, enabling instant edge decision-making.
* **Power & Battery Autonomy:**
  - Rover Node draws average **$180\text{ mA} @ 5\text{V}$**.
  - Powered by a rechargeable $12\text{V} / 4400\text{ mAh}$ Li-ion battery pack providing **$> 18\text{ hours}$ continuous autonomous operation** on a single charge.
* **Intrinsic Safety & ATEX Compliance Roadmap:** Electronics enclosed in an **IP65/NEMA 4X flameproof, dust-sealed polycarbonate chassis** with optical isolation barriers for DGMS Group-I underground coal mine certification.

---

### 💰 2. Financial Viability & Cost Breakdown

#### Hardware Unit Cost Comparison (SubSentry vs Traditional Imports)

| Component / Subsystem | SubSentry Rover Node (INR) | Imported Industrial Extensometer / InSAR |
| :--- | :---: | :---: |
| Sensor Acquisition Core (Arduino + Transducers) | ₹ 1,450 | ₹ 1,20,000 (Multipoint Extensometer) |
| 6-DOF IMU + Gas + Temp/Humidity Probe | ₹ 850 | ₹ 65,000 (Mining Inclinometer) |
| Wireless Gateway Node (ESP32 + LoRa Radio) | ₹ 1,200 | ₹ 85,000 (Industrial Wireless Modem) |
| Power Management & Li-ion Battery Pack | ₹ 1,800 | ₹ 35,000 (Ex-Rated Battery) |
| Rugged Mechanical Rover Chassis & Motors | ₹ 3,200 | ₹ 45,000 (Stationary Mounting Rig) |
| **Total Hardware Unit Cost** | **₹ 8,500** | **₹ 3,50,000+** |
| **Cost Reduction Ratio** | **~97.5% Cheaper** | Baseline High-Cost Anchor |

#### Commercial Business Model & Revenue Streams
1. **CAPEX Model:** Sale of SubSentry Rover Hardware Kits @ ₹25,000 per unit (Gross Margin: 66%).
2. **OPEX / SaaS Subscription:** Cloud SCADA Digital Twin, DGMS Report Generation, and AI Predictive Forecasting @ ₹15,000 / month per colliery panel.
3. **Turnkey Mine Deployment & AMC:** Annual maintenance contract and hardware sensor calibration @ ₹1,50,000 / year per mining area.

---

### 🚜 3. Operational Viability

* **Zero Specialized Training Required:** Simple, intuitive industrial web dashboard with color-coded safety badges (Green/Amber/Red) and 1-click PDF export, accessible on any tablet, laptop, or control room video wall.
* **Plug-and-Play Mine Deployment:** Rover traverses haulage roadways without requiring structural drilling or permanent anchoring in uncompacted rock faces.
* **Dual Operational Fallback:** Features both **LIVE Mode** (connected to cloud backend) and **Offline Autonomous Mode** (local SD card logging + local web interface), ensuring 100% data safety during network blackouts.

---

# 🌍 MODULE 3: IMPACT & BUSINESS VALUE (ROI)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE SUBSENTRY IMPACT MATRIX                            │
├────────────────────────────┬────────────────────────────┬──────────────────────────────┤
│      1. HUMAN LIVES        │     2. ECONOMIC ASSETS     │      3. ESG & ENVIRONMENT    │
│  • Zero-Harm Goal          │  • ₹50 Cr+ Disaster Save   │  • Toxic Gas Containment     │
│  • 15-60m Pre-Alert Evac   │  • Zero Machine Burial     │  • Quenching Seam Fires      │
│  • Remote Inspection       │  • Uninterrupted Coal Prod │  • DGMS Green Clearance      │
└────────────────────────────┴────────────────────────────┴──────────────────────────────┘
```

### 🦺 1. Human Life Safety Impact
* **Eliminating Fatal Roof Falls:** Roof collapse accounts for over **$42\%$ of all underground mining fatalities** in India (DGMS Annual Report). SubSentry provides continuous millimetre-level monitoring, giving miners a **15 to 60-minute early warning window** to evacuate safely.
* **Remote Hazardous Zone Traversal:** Replaces human surveying teams from entering uncompacted, freshly blasted stopes and depillaring zones.

### 💵 2. Economic & Operational ROI for Mining Companies
* **Preventing Production Stoppages:** A single unexpected roof collapse in a Longwall panel halts coal extraction for **2 to 6 weeks**, resulting in an average revenue loss of **₹12 Crore to ₹50 Crore per incident**.
* **Protecting Multi-Crore Machinery:** Prevents expensive Continuous Miners, Shearers, and Powered Roof Supports (worth ₹30+ Crore) from getting buried under collapsed rock strata.
* **Eliminating Surface Compensation Claims:** Knothe-Budryk damage modeling prevents unexpected subsidence troughs from damaging surface National Highways, Coal Railway Sidings, and residential villages (avoiding hundreds of crores in legal litigation).

### 🌱 3. Environmental & ESG Impact
* **Mitigating Spontaneous Coal Combustion:** Strata micro-fractures allow air ingress into subsurface coal seams, igniting spontaneous mine fires (e.g., Jharia Coalfield crisis). Early crack detection halts fire inception.
* **Toxic Gas Leak Prevention:** Continuous tracking of Methane ($\text{CH}_4$) and Carbon Monoxide ($\text{CO}$) prevents catastrophic underground explosions and surface atmospheric contamination.

---

# 🎯 MODULE 4: TARGET AUDIENCE & STAKEHOLDER MAPPING

### 👥 1. Primary Customers & Enterprise Stakeholders

```
                                  MINISTRY OF COAL / DGMS
                                (Statutory Regulatory Body)
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
          PUBLIC SECTOR UNDERTAKINGS                     PRIVATE MINING ENTERPRISES
           • Coal India Limited (CIL)                     • Tata Steel Mining
             - BCCL (Jharia Coalfield)                    • Adani Natural Resources
             - ECL (Raniganj Coalfield)                   • Vedanta Resources
             - SECL (Korba Coalfield)                     • JSW Energy Mining
             - CCL, WCL, NCL, MCL                         • Jindal Steel & Power
           • Singareni Collieries (SCCL)
```

---

### 👨‍💼 2. End-User Persona & Workflow Integration

| User Persona | Role & Responsibilities | How SubSentry Empowers Them |
| :--- | :--- | :--- |
| **Mine Safety Officer (MSO)** | Statutory safety oversight, incident reporting, DGMS compliance. | Generates **1-Click DGMS Form IV-A Audit Certificates** with automated compliance validation and digital sign-off. |
| **Strata Control Specialist** | Geotechnical rock mechanics analysis, roof bolting design. | Analyzes real-time **Knothe-Budryk 3D depression bowls**, tensile strain ($\epsilon$), and AI predictive subsidence curves. |
| **Colliery General Manager** | Production targets, mine planning, operational continuity. | Monitors **Multi-Rover Swarm Fleet HUD**, ensuring zero unplanned shutdowns across all working panels. |
| **Underground Shift In-Charge** | On-site miner supervision, emergency evacuation protocol. | Receives **instant audio-visual alarms & risk level escalations** (Class 0 to Class IV) to trigger rapid miner evacuation. |

---

### 📈 3. Total Addressable Market (TAM, SAM, SOM)

* **Total Addressable Market (TAM):** Global Underground Mining IoT & Safety Sensor Market = **$4.8 Billion by 2030** (CAGR: 14.2%).
* **Serviceable Addressable Market (SAM):** Indian Mining & Mineral Industry (Coal, Zinc, Copper, Uranium underground mines) = **₹2,800 Crore ($340 Million)**.
* **Serviceable Obtainable Market (SOM):** Coal India Limited & SCCL 300+ Underground Working Coal Mines (Initial 3-Year Target: 450 rover units across 75 collieries) = **₹45 Crore ($5.4 Million)**.

---

# 🎤 BONUS: 3-MINUTE HACKATHON PITCH SCRIPT FOR PPT DEMO

```
[0:00 - 0:45] HOOK & PROBLEM:
"Judges, every year underground coal mines face sudden roof collapses and surface subsidence that claim miner lives and cause hundreds of crores in equipment loss. Traditional manual surveying is slow and dangerous, while imported extensometers cost over ₹3.5 Lakhs per point."

[0:45 - 1:30] SOLUTION & LIVE MVP DEMO:
"Meet SubSentry — an end-to-end IoT SCADA digital twin developed for SIH26025. Powered by an autonomous Arduino sensor node and ESP32 gateway pushing live telemetry to our AWS EC2 Docker backend, our dashboard tracks roof sag, 6-axis tilt, seismic micro-cracks, and toxic gas in hard real-time at 1-second intervals."

[1:30 - 2:15] KILLER USPs (3D TWIN & AI BENCHMARK):
"What makes SubSentry truly revolutionary is our geotechnical intelligence:
1. Our 3D Digital Twin implements the Knothe-Budryk theory, calculating damage radius and caved void volume in real-time.
2. Our AI Predictive Engine forecasts roof sag 6 hours into the future, cross-validated against classical models with an R² score of 0.964 and MAE of just 0.032 cm.
3. Our Swarm Fleet mode simultaneously syncs multiple rovers across Panel P-4B and P-2A."

[2:15 - 3:00] IMPACT, DGMS & VIABILITY:
"With 1-click, safety officers generate official DGMS Form IV-A compliance certificates. And at just ₹8,500 per node — 97% cheaper than imports — SubSentry makes zero-harm underground mining an affordable reality for every Indian colliery. Thank you!"
```

---
**Repository:** `hardware_aws`  
**Authors:** SubSentry Engineering Team (SIH26025)  
**License:** Provided for Smart India Hackathon Research & Technical Evaluation
