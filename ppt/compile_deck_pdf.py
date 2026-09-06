import os
import subprocess
import sys

def find_browser():
    candidates = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return None

def build_pdf():
    browser = find_browser()
    html_path = os.path.abspath("ppt/SUBSENTRY_SIH_PITCH_DECK.html")
    pdf_path = os.path.abspath("ppt/SUBSENTRY_SIH_PITCH_DECK.pdf")
    
    print(f"Using browser: {browser}")
    print(f"Input HTML: {html_path}")
    print(f"Output PDF: {pdf_path}")
    
    if browser:
        cmd = [
            browser,
            "--headless",
            "--disable-gpu",
            "--no-margins",
            "--run-all-compositor-stages-before-draw",
            f"--print-to-pdf={pdf_path}",
            html_path
        ]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 1000:
                print(f"SUCCESS: Generated PDF via browser ({os.path.getsize(pdf_path)} bytes)")
                return True
        except Exception as e:
            print(f"Browser PDF failed: {e}")
            
    # Fallback to ReportLab if needed
    try:
        from reportlab.lib.pagesizes import letter, landscape
        from reportlab.pdfgen import canvas
        from reportlab.lib.utils import ImageReader
        
        c = canvas.Canvas(pdf_path, pagesize=landscape(letter))
        width, height = landscape(letter)
        
        # Draw slides
        diagrams = [
            ("01_system_architecture_pipeline.png", "SubSentry Architecture & Telemetry Pipeline"),
            ("02_geotechnical_subsidence_knothe_model.png", "Geotechnical Knothe-Budryk Subsidence Profile"),
            ("03_feasibility_cost_comparison_chart.png", "Economic Feasibility & 5-Year Colliery TCO Comparison"),
            ("04_stakeholder_beneficiary_flow.png", "Stakeholder Beneficiary Matrix ('Kiska Fayeda')"),
            ("05_disaster_risk_mitigation_lifecycle.png", "45-Minute Early Warning & Life-Safety Lifecycle")
        ]
        
        for diag, title in diagrams:
            diag_path = os.path.join("ppt/diagrams", diag)
            c.setFillColorRGB(0.04, 0.07, 0.13) # #0b1120
            c.rect(0, 0, width, height, fill=1, stroke=0)
            
            # Title
            c.setFillColorRGB(0.02, 0.71, 0.83) # cyan
            c.setFont("Helvetica-Bold", 18)
            c.drawString(40, height - 40, f"SubSentry™ — {title}")
            
            # Subtitle
            c.setFillColorRGB(0.58, 0.64, 0.72)
            c.setFont("Helvetica", 10)
            c.drawString(40, height - 58, "Smart India Hackathon (SIH26025) • Ministry of Coal / DGMS India Compliant")
            
            if os.path.exists(diag_path):
                img = ImageReader(diag_path)
                # scale image to fit
                c.drawImage(img, 40, 50, width=width-80, height=height-130, preserveAspectRatio=True, anchor='c')
                
            c.showPage()
            
        c.save()
        print(f"SUCCESS: Generated fallback PDF via ReportLab ({os.path.getsize(pdf_path)} bytes)")
        return True
    except Exception as e:
        print(f"ReportLab fallback failed: {e}")
        return False

if __name__ == "__main__":
    build_pdf()
