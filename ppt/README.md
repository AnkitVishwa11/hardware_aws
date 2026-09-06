# 🏔️ SubSentry™ — SIH Presentation & Pitch Deck Hub

This folder (`ppt/`) contains all presentation assets, high-resolution geotechnical & architecture diagrams, slide-by-slide markdown scripts, printable presentation HTML, and the compiled official pitch deck PDF for **Smart India Hackathon (SIH26025)**.

---

## 📁 FOLDER CONTENTS & ASSET INDEX

| File / Folder | Description & Purpose |
| :--- | :--- |
| **[`SUBSENTRY_SIH_PITCH_DECK.pdf`](file:///c:/Users/LOQ/Desktop/hardware_aws/ppt/SUBSENTRY_SIH_PITCH_DECK.pdf)** | **Official Compiled Pitch Deck (2.9 MB PDF)** ready to present to SIH jury and DGMS evaluators. |
| **[`SUBSENTRY_SIH_PITCH_DECK.html`](file:///c:/Users/LOQ/Desktop/hardware_aws/ppt/SUBSENTRY_SIH_PITCH_DECK.html)** | Interactive, responsive presentation deck with dark-slate engineering theme and print styles. |
| **[`SIH_SLIDE_BY_SLIDE_CONTENT.md`](file:///c:/Users/LOQ/Desktop/hardware_aws/ppt/SIH_SLIDE_BY_SLIDE_CONTENT.md)** | Detailed slide-by-slide text, formulas, speech talking points, and DGMS compliance notes. |
| **[`diagrams/`](file:///c:/Users/LOQ/Desktop/hardware_aws/ppt/diagrams)** | **5 High-Resolution (300 DPI) Engineering Diagrams** generated for PPT slides. |
| **[`generate_diagrams.py`](file:///c:/Users/LOQ/Desktop/hardware_aws/ppt/generate_diagrams.py)** | Python script used to render and customize all diagrams. |
| **[`compile_deck_pdf.py`](file:///c:/Users/LOQ/Desktop/hardware_aws/ppt/compile_deck_pdf.py)** | Automated PDF compiler tool. |

---

## 🖼️ GENERATED HIGH-RESOLUTION DIAGRAMS (`ppt/diagrams/`)

### 1. System Architecture & Telemetry Pipeline
* **File:** [`01_system_architecture_pipeline.png`](file:///c:/Users/LOQ/Desktop/hardware_aws/ppt/diagrams/01_system_architecture_pipeline.png)
* **What it shows:** 4-stage data pipeline:
  1. Underground Edge Sensor Node (Arduino Uno + MPU6050 + HC-SR04 + MQ-4).
  2. Isolated Surface Gateway (5V-to-3.3V Voltage Divider + Dual-Core ESP32).
  3. Cloud Ingestion & Database (AWS EC2 + InfluxDB/TimescaleDB + Mosquitto).
  4. SCADA Digital Twin & AI (React 19 + Knothe Model + 1-Click DGMS Form IV-A).

### 2. Geotechnical Knothe-Budryk Subsidence Model
* **File:** [`02_geotechnical_subsidence_knothe_model.png`](file:///c:/Users/LOQ/Desktop/hardware_aws/ppt/diagrams/02_geotechnical_subsidence_knothe_model.png)
* **What it shows:** Complete geotechnical subsurface caving physics:
  - Extracted goaf void ($m = 3.2\text{m}$, depth $H = 150\text{m}$).
  - Limit caving angle ($\gamma = 65^\circ$).
  - Surface depression trough curve $S(x)$ with inflection point ($x=0, S = S_{max}/2$).
  - Overlaid SubSentry sensor node positions across the displacement profile.

### 3. Economic Feasibility & 5-Year Colliery TCO
* **File:** [`03_feasibility_cost_comparison_chart.png`](file:///c:/Users/LOQ/Desktop/hardware_aws/ppt/diagrams/03_feasibility_cost_comparison_chart.png)
* **What it shows:**
  - **CapEx comparison:** SubSentry (₹8,500) vs Manual Prisms (₹1,20,000) vs Imported Extensometer (₹3,50,000).
  - **5-Year TCO for 100 Monitoring Points:** ₹0.22 Crores (SubSentry) vs ₹5.30 Crores (Imported) — **95.8% Cost Savings**.

### 4. Stakeholder Beneficiary Matrix ("Kiska Fayeda")
* **File:** [`04_stakeholder_beneficiary_flow.png`](file:///c:/Users/LOQ/Desktop/hardware_aws/ppt/diagrams/04_stakeholder_beneficiary_flow.png)
* **What it shows:** Complete multi-tier breakdown of who benefits:
  1. **Underground Miners:** 15–60 min life-saving evacuation warning & gas protection.
  2. **Mine Managers & Overmen:** 1-Click DGMS statutory Form IV-A reports & zero false alarms.
  3. **Coal India Ltd. (BCCL/ECL/SECL):** Prevents ₹50 Cr+ machinery loss & regulatory mine halts.
  4. **DGMS Regulators:** Audit-proof cloud archives & compliance with Circular 02/2019.

### 5. Disaster Risk Preemption Lifecycle
* **File:** [`05_disaster_risk_mitigation_lifecycle.png`](file:///c:/Users/LOQ/Desktop/hardware_aws/ppt/diagrams/05_disaster_risk_mitigation_lifecycle.png)
* **What it shows:** 45-Minute timeline from micro-seismic creep ($T=0$) to AI verification ($T+2$), automated siren strobe ($T+5$), safe miner evacuation ($T+15\text{--}45$), and statutory incident filing ($T+60$).

---

## 🎤 JURY PRESENTATION TALKING POINTS (HINDI & ENGLISH)

### 1. Opening & Problem Hook
> *"Respected Jury members, India operates 318 underground coal mines, where uncontrolled bord-and-pillar depillaring causes sudden roof falls and surface sinkholes in areas like Jharia and Raniganj. Currently, imported extensometers cost over ₹3.5 Lakhs per point, and manual surveys happen only once a week. SubSentry solves this with an indigenous ₹8,500 IoT sensor grid and Knothe-Budryk mathematical digital twin."*

### 2. Geotechnical Rigor (Not Generic AI)
> *"SubSentry is NOT a simple sensor toy or generic AI wrapper. It implements the exact Knothe-Budryk Gaussian subsidence model: $$S(x) = \frac{S_{max}}{2}\left[1 - \text{erf}\left(\frac{\sqrt{\pi}x}{R}\right)\right]$$ cross-validated with an AI ensemble achieving an $R^2$ of 0.964, fully compliant with DGMS Circular No. 02/2019."*

### 3. Kiska Fayeda? (Stakeholder Impact)
> *"Kiska fayeda hoga? 
> 1. Facemen aur Miners ki jaan bachegi with 15–60 min early warning.
> 2. Mine Managers ka 12 ghante ka paper report 1-click DGMS Form IV-A me auto-generate hoga.
> 3. Coal India ke ₹10-50 Cr ke Continuous Miners aur LHD burial hone se bachenge.
> 4. Jharia/Raniganj ke gaon aur railway tracks sinkhole me girne se bachenge."*
