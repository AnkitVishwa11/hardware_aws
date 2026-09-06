import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

os.makedirs('ppt/diagrams', exist_ok=True)
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']

# -------------------------------------------------------------
# DIAGRAM 1: SYSTEM ARCHITECTURE & TELEMETRY PIPELINE
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(12, 6.5), dpi=300)
fig.patch.set_facecolor('#0f172a')
ax.set_facecolor('#0f172a')

# Boxes
boxes = [
    {"title": "1. SUB-SURFACE / ROVER NODE", "sub": "MPU6050 (I2C) + HC-SR04\nMQ-4 Methane + DHT11\nArduino Uno Core (16MHz)", "x": 0.05, "y": 0.55, "w": 0.22, "h": 0.35, "color": "#1e293b", "border": "#38bdf8"},
    {"title": "2. ISOLATED GATEWAY", "sub": "Voltage Divider (5V->3.3V)\nHardware UART Serial (9600)\nESP32 Dual-Core (FreeRTOS)\nWiFi 802.11 b/g/n + LoRa ready", "x": 0.30, "y": 0.55, "w": 0.22, "h": 0.35, "color": "#1e293b", "border": "#10b981"},
    {"title": "3. CLOUD INGESTION & DB", "sub": "AWS EC2 Ubuntu Microservice\nFastAPI REST / HTTP POST\nTimescaleDB / InfluxDB\nMQTT Mosquitto Broker", "x": 0.55, "y": 0.55, "w": 0.22, "h": 0.35, "color": "#1e293b", "border": "#f59e0b"},
    {"title": "4. SCADA DIGITAL TWIN & AI", "sub": "React 19 + Three.js 3D Voids\nKnothe-Budryk Profile Model\nRandomForest / XGB AI Engine\n1-Click DGMS Form IV-A PDF", "x": 0.80, "y": 0.55, "w": 0.22, "h": 0.35, "color": "#1e293b", "border": "#ec4899"},
]

for b in boxes:
    rect = patches.FancyBboxPatch((b["x"]-b["w"]/2, b["y"]-b["h"]/2), b["w"], b["h"],
                                  boxstyle="round,pad=0.02,rounding_size=0.03",
                                  facecolor=b["color"], edgecolor=b["border"], linewidth=2)
    ax.add_patch(rect)
    ax.text(b["x"], b["y"] + 0.1, b["title"], color=b["border"], fontsize=9, fontweight='bold', ha='center', va='center')
    ax.text(b["x"], b["y"] - 0.04, b["sub"], color="#cbd5e1", fontsize=8, ha='center', va='center', linespacing=1.4)

# Arrows
arrows = [(0.16, 0.55, 0.19, 0.55), (0.41, 0.55, 0.44, 0.55), (0.66, 0.55, 0.69, 0.55)]
for x1, y1, x2, y2 in arrows:
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(facecolor='#38bdf8', edgecolor='#38bdf8', arrowstyle="-|>", lw=2, mutation_scale=15))

# Bottom banner for statutory compliance
bottom_box = patches.FancyBboxPatch((0.05, 0.08), 0.90, 0.25,
                                    boxstyle="round,pad=0.02,rounding_size=0.03",
                                    facecolor="#1e1b4b", edgecolor="#818cf8", linewidth=1.5)
ax.add_patch(bottom_box)
ax.text(0.5, 0.26, "STATUTORY & OPERATIONAL COMPLIANCE PIPELINE (SIH26025 / DGMS)", color="#a5b4fc", fontsize=10, fontweight='bold', ha='center')
ax.text(0.5, 0.16, "Real-time Telemetry (<500ms Latency)  •  Fail-Safe Offline SD Caching  •  DGMS Circular No. 02/2019 Adherent\nAutomated Flash Evacuation Siren Trigger  •  Audit-Proof CIL Subsidence Archives", 
        color="#e2e8f0", fontsize=8.5, ha='center', va='center', linespacing=1.3)

ax.set_xlim(0, 1.05)
ax.set_ylim(0, 1.0)
ax.axis('off')
plt.title("SubSentry™ End-to-End System & Telemetry Architecture", color="#ffffff", fontsize=14, fontweight='bold', pad=15)
plt.tight_layout()
plt.savefig('ppt/diagrams/01_system_architecture_pipeline.png', dpi=300, facecolor=fig.get_facecolor(), bbox_inches='tight')
plt.close()

# -------------------------------------------------------------
# DIAGRAM 2: GEOTECHNICAL SUBSIDENCE & KNOTHE-BUDRYK MODEL
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(12, 6.5), dpi=300)
fig.patch.set_facecolor('#0f172a')
ax.set_facecolor('#0f172a')

x = np.linspace(-60, 60, 400)
H = 150.0  # Depth in meters
R = 75.0   # Radius of major influence R = H / tan(beta)
Smax = 2.4 # Maximum subsidence in meters
# Knothe subsidence profile S(x) = Smax * (1/sqrt(2pi)) * integral
from scipy.special import erf
S_x = (Smax / 2.0) * (1 - erf((np.sqrt(np.pi) * x) / R))

# Plot subsidence profile
ax.plot(x, -S_x, color='#ef4444', linewidth=3, label='Surface Subsidence Profile S(x) [Knothe Model]')
ax.axhline(0, color='#64748b', linestyle='--', linewidth=1.5, label='Original Ground Surface Level (Datum)')

# Fill subsidence trough
ax.fill_between(x, -S_x, 0, color='#ef4444', alpha=0.15)

# Underground Goaf / Seam Extraction Zone
goaf_rect = patches.Rectangle((-50, -4.5), 50, 0.8, facecolor='#334155', edgecolor='#f59e0b', linewidth=2, hatch='//')
ax.add_patch(goaf_rect)
ax.text(-25, -4.1, "Extracted Seam / Goaf Void\n(Thickness m = 3.2m, Depth H = 150m)", color='#fde68a', fontsize=8.5, ha='center', va='center', fontweight='bold')

# Unmined Coal Pillar
pillar_rect = patches.Rectangle((0, -4.5), 50, 0.8, facecolor='#1e293b', edgecolor='#10b981', linewidth=2)
ax.add_patch(pillar_rect)
ax.text(25, -4.1, "Solid Coal Rib / Barrier Pillar\n(DGMS Safety Zone)", color='#6ee7b7', fontsize=8.5, ha='center', va='center', fontweight='bold')

# Caving / Influence Angle Line
ax.plot([0, 25], [-4.5, 0], color='#f59e0b', linestyle=':', linewidth=2)
ax.text(12, -2.2, "Limit Angle $\\gamma = 65^\\circ$", color='#fbbf24', fontsize=9, fontweight='bold')

# Inflexion Point Marker
ax.plot([0], [-Smax/2], marker='o', markersize=8, color='#38bdf8')
ax.annotate('Inflexion Point (x=0)\n$S = S_{max}/2 = 1.20m$\nMax Tilt ($T_{max}$)', xy=(0, -Smax/2), xytext=(-35, -1.8),
            arrowprops=dict(facecolor='#38bdf8', edgecolor='#38bdf8', arrowstyle="->", lw=1.5),
            color='#bae6fd', fontsize=8.5, fontweight='bold', bbox=dict(boxstyle="round,pad=0.3", fc="#0369a1", ec="#38bdf8", lw=1))

# Sensor Placements
sensor_xs = [-40, -20, 0, 15, 30]
for sx in sensor_xs:
    sy = -(Smax / 2.0) * (1 - erf((np.sqrt(np.pi) * sx) / R))
    ax.plot(sx, sy, marker='^', markersize=10, color='#10b981')
    ax.text(sx, sy + 0.35, f"SubSentry Node\n(x={sx}m)", color='#6ee7b7', fontsize=7, ha='center', va='bottom')

ax.set_xlim(-65, 65)
ax.set_ylim(-5.2, 1.2)
ax.set_xlabel("Distance from Extraction Boundary [x in meters]", color='#e2e8f0', fontsize=10, fontweight='bold')
ax.set_ylabel("Vertical Displacement [meters]", color='#e2e8f0', fontsize=10, fontweight='bold')
ax.tick_params(colors='#94a3b8')
ax.grid(True, linestyle=':', color='#334155', alpha=0.7)
ax.legend(loc='lower right', facecolor='#1e293b', edgecolor='#475569', labelcolor='#ffffff', fontsize=8.5)

plt.title("Geotechnical Knothe-Budryk Subsidence Profile & Sensor Grid Overlay", color="#ffffff", fontsize=13, fontweight='bold', pad=12)
plt.tight_layout()
plt.savefig('ppt/diagrams/02_geotechnical_subsidence_knothe_model.png', dpi=300, facecolor=fig.get_facecolor(), bbox_inches='tight')
plt.close()

# -------------------------------------------------------------
# DIAGRAM 3: COST & FEASIBILITY ANALYSIS COMPARISON
# -------------------------------------------------------------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 6), dpi=300)
fig.patch.set_facecolor('#0f172a')

# Subplot 1: Capex per Unit Cost (INR)
ax1.set_facecolor('#0f172a')
systems = ['Imported Extensometer\n(RST / Geokon)', 'Manual Survey Crew\n(Total Station/Prisms)', 'SubSentry™ IoT\n(Arduino/ESP32 Grid)']
costs = [350000, 120000, 8500]
colors = ['#ef4444', '#f59e0b', '#10b981']

bars = ax1.bar(systems, costs, color=colors, width=0.55, edgecolor='#ffffff', linewidth=1)
for bar in bars:
    yval = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2.0, yval + 10000, f"₹{yval:,.0f}", ha='center', va='bottom', color='#ffffff', fontweight='bold', fontsize=9.5)

ax1.set_ylabel("Capital Cost per Monitoring Point (INR ₹)", color='#e2e8f0', fontsize=10, fontweight='bold')
ax1.set_title("Capital Expenditure (CapEx) Comparison", color='#38bdf8', fontsize=11, fontweight='bold')
ax1.tick_params(colors='#94a3b8')
ax1.grid(axis='y', linestyle=':', color='#334155', alpha=0.7)
ax1.set_ylim(0, 420000)

# Subplot 2: 5-Year Mine-Wide TCO (100 Monitoring Points across 2 Panels)
ax2.set_facecolor('#0f172a')
categories = ['Equipment Purchase', 'Installation & Wiring', 'Annual Calibration & Maint', 'Labor & Survey Crew (5 Yrs)']
imported_tco = [350.0, 45.0, 60.0, 75.0]  # in Lakhs INR
subsentry_tco = [8.5, 3.5, 4.0, 6.0]     # in Lakhs INR

x_idx = np.arange(len(categories))
width = 0.35

ax2.bar(x_idx - width/2, imported_tco, width, label='Imported Systems (Total: ₹5.30 Cr)', color='#ef4444', edgecolor='#ffffff', linewidth=0.8)
ax2.bar(x_idx + width/2, subsentry_tco, width, label='SubSentry™ Grid (Total: ₹0.22 Cr)', color='#10b981', edgecolor='#ffffff', linewidth=0.8)

ax2.set_ylabel("5-Year Expenditure (Lakhs ₹ INR)", color='#e2e8f0', fontsize=10, fontweight='bold')
ax2.set_title("5-Year Total Cost of Ownership (100 Node Deployment)", color='#38bdf8', fontsize=11, fontweight='bold')
ax2.set_xticks(x_idx)
ax2.set_xticklabels(categories, rotation=15, ha='right', color='#94a3b8', fontsize=8.5)
ax2.tick_params(colors='#94a3b8')
ax2.legend(facecolor='#1e293b', edgecolor='#475569', labelcolor='#ffffff', fontsize=8.5)
ax2.grid(axis='y', linestyle=':', color='#334155', alpha=0.7)

plt.suptitle("SubSentry™ Economic Feasibility: 95.8% Cost Reduction vs Legacy Solutions", color='#ffffff', fontsize=13, fontweight='bold', y=0.98)
plt.tight_layout()
plt.savefig('ppt/diagrams/03_feasibility_cost_comparison_chart.png', dpi=300, facecolor=fig.get_facecolor(), bbox_inches='tight')
plt.close()

# -------------------------------------------------------------
# DIAGRAM 4: STAKEHOLDER BENEFICIARY FLOW ("KISKA FAYEDA")
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(12, 6.5), dpi=300)
fig.patch.set_facecolor('#0f172a')
ax.set_facecolor('#0f172a')

# Central Node
hub = patches.FancyBboxPatch((0.40, 0.42), 0.20, 0.16, boxstyle="round,pad=0.02,rounding_size=0.04", facecolor="#1e1b4b", edgecolor="#818cf8", linewidth=2.5)
ax.add_patch(hub)
ax.text(0.50, 0.52, "SubSentry™\nPLATFORM", color="#ffffff", fontsize=11, fontweight='bold', ha='center', va='center')
ax.text(0.50, 0.45, "IoT + AI + Knothe Digital Twin", color="#a5b4fc", fontsize=7.5, ha='center', va='center')

stakeholders = [
    {"role": "UNDERGROUND MINERS\n& COAL FACEMEN", "benefit": "• 15-60 min flash evacuation warning\n• Zero unpredicted roof falls\n• Toxic gas asphyxiation prevention\n• Direct life protection & safe work zone", "x": 0.18, "y": 0.78, "col": "#ef4444", "conn": (0.28, 0.70, 0.42, 0.55)},
    {"role": "MINE MANAGERS &\nSAFETY OFFICERS", "benefit": "• Real-time 3D SCADA telemetry\n• 1-Click DGMS Form IV-A reports\n• Automated shift safety handover\n• Continuous geo-stability index", "x": 0.82, "y": 0.78, "col": "#38bdf8", "conn": (0.72, 0.70, 0.58, 0.55)},
    {"role": "COAL INDIA / BCCL / ECL\nCORPORATE EXECUTIVES", "benefit": "• ₹50 Cr+ equipment loss mitigation\n• 95.8% monitoring CapEx reduction\n• Zero regulatory production halts\n• High ESG & CSR sustainability score", "x": 0.18, "y": 0.22, "col": "#10b981", "conn": (0.28, 0.30, 0.42, 0.45)},
    {"role": "DGMS REGULATORS &\nMINING TRIBUNALS", "benefit": "• Tamper-proof immutable logs\n• Circular No. 02/2019 adherence\n• Quantitative subsidence forensics\n• Standardized digital safety auditing", "x": 0.82, "y": 0.22, "col": "#f59e0b", "conn": (0.72, 0.30, 0.58, 0.45)},
]

for s in stakeholders:
    box = patches.FancyBboxPatch((s["x"]-0.16, s["y"]-0.13), 0.32, 0.26, boxstyle="round,pad=0.02,rounding_size=0.03", facecolor="#1e293b", edgecolor=s["col"], linewidth=2)
    ax.add_patch(box)
    ax.text(s["x"], s["y"] + 0.08, s["role"], color=s["col"], fontsize=9, fontweight='bold', ha='center', va='center')
    ax.text(s["x"], s["y"] - 0.03, s["benefit"], color="#cbd5e1", fontsize=7.5, ha='center', va='center', linespacing=1.35)
    
    # Connection line
    x1, y1, x2, y2 = s["conn"]
    ax.plot([x1, x2], [y1, y2], color=s["col"], linestyle='--', linewidth=1.8, alpha=0.8)

ax.set_xlim(0, 1.0)
ax.set_ylim(0, 1.0)
ax.axis('off')
plt.title("Target Audience & Multi-Tier Stakeholder Beneficiary Matrix", color="#ffffff", fontsize=13, fontweight='bold', pad=15)
plt.tight_layout()
plt.savefig('ppt/diagrams/04_stakeholder_beneficiary_flow.png', dpi=300, facecolor=fig.get_facecolor(), bbox_inches='tight')
plt.close()

# -------------------------------------------------------------
# DIAGRAM 5: DISASTER RISK MITIGATION TIMELINE
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(12, 5.5), dpi=300)
fig.patch.set_facecolor('#0f172a')
ax.set_facecolor('#0f172a')

# Time axis line
ax.plot([0.05, 0.95], [0.5, 0.5], color='#475569', linewidth=4, zorder=1)

events = [
    {"time": "T = 0 min", "title": "Micro-Seismic Creep", "desc": "Sub-mm tilt (>1.5°)\nUltrasonic variance detected\nSafe baseline breached", "x": 0.12, "col": "#38bdf8", "y_off": 0.22},
    {"time": "T + 2 min", "title": "Cloud AI Verification", "desc": "Knothe rate > 0.05 cm/hr\nMulti-sensor cross check\nFalse positive filter cleared", "x": 0.35, "col": "#fbbf24", "y_off": -0.25},
    {"time": "T + 5 min", "title": "Automated Alert Trigger", "desc": "Audio-visual siren fired\nSMS/WhatsApp broadcast\nSCADA auto-flashes RED", "x": 0.60, "col": "#f97316", "y_off": 0.22},
    {"time": "T + 15 to 45 min", "title": "Safe Evacuation & Audit", "desc": "Miners exit danger zone\nHeavy LHD/SDL relocated\nDGMS Form IV-A auto-filed", "x": 0.85, "col": "#10b981", "y_off": -0.25},
]

for ev in events:
    # Circle node on line
    ax.plot(ev["x"], 0.5, marker='o', markersize=14, color=ev["col"], zorder=3, markeredgecolor='#ffffff', markeredgewidth=2)
    ax.text(ev["x"], 0.5 + (0.07 if ev["y_off"]>0 else -0.07), ev["time"], color="#ffffff", fontsize=8.5, fontweight='bold', ha='center', va='bottom' if ev["y_off"]>0 else 'top')
    
    # Event box
    box = patches.FancyBboxPatch((ev["x"]-0.10, 0.5 + ev["y_off"] - 0.10), 0.20, 0.20, boxstyle="round,pad=0.02,rounding_size=0.02", facecolor="#1e293b", edgecolor=ev["col"], linewidth=1.5)
    ax.add_patch(box)
    ax.text(ev["x"], 0.5 + ev["y_off"] + 0.05, ev["title"], color=ev["col"], fontsize=8.5, fontweight='bold', ha='center')
    ax.text(ev["x"], 0.5 + ev["y_off"] - 0.03, ev["desc"], color="#cbd5e1", fontsize=7.2, ha='center', linespacing=1.3)
    
    # Stem line
    ax.plot([ev["x"], ev["x"]], [0.5, 0.5 + ev["y_off"] + (-0.10 if ev["y_off"]>0 else 0.10)], color=ev["col"], linestyle=':', linewidth=1.5)

ax.set_xlim(0, 1.0)
ax.set_ylim(0.1, 0.9)
ax.axis('off')
plt.title("SubSentry™ 45-Minute Disaster Preemption & Life-Safety Lifecycle", color="#ffffff", fontsize=13, fontweight='bold', pad=15)
plt.tight_layout()
plt.savefig('ppt/diagrams/05_disaster_risk_mitigation_lifecycle.png', dpi=300, facecolor=fig.get_facecolor(), bbox_inches='tight')
plt.close()

print("All 5 diagrams successfully generated in ppt/diagrams/")
