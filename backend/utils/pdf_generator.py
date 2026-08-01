import os
from fpdf import FPDF
from datetime import datetime

class SecurityPDFReport(FPDF):
    @staticmethod
    def _safe_text(value):
        """Core Helvetica supports Latin-1 only; replace unsupported glyphs safely."""
        return str(value if value is not None else '').encode('latin-1', 'replace').decode('latin-1')

    def cell(self, *args, **kwargs):
        args = list(args)
        if len(args) >= 3:
            args[2] = self._safe_text(args[2])
        elif 'text' in kwargs:
            kwargs['text'] = self._safe_text(kwargs['text'])
        return super().cell(*args, **kwargs)

    def multi_cell(self, *args, **kwargs):
        args = list(args)
        if len(args) >= 3:
            args[2] = self._safe_text(args[2])
        elif 'text' in kwargs:
            kwargs['text'] = self._safe_text(kwargs['text'])
        return super().multi_cell(*args, **kwargs)

    def header(self):
        # Dark Cyber Header
        self.set_fill_color(10, 13, 20)
        self.rect(0, 0, 210, 25, 'F')
        
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(0, 240, 255) # Cyan
        self.cell(0, 10, 'DARKON AI | CYBERSECURITY AUDIT REPORT', 0, 1, 'L')
        self.set_font('Helvetica', '', 9)
        self.set_text_color(150, 160, 180)
        self.cell(0, 0, f'Generated: {datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")} | Classification: CONFIDENTIAL', 0, 1, 'L')
        self.ln(12)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(120, 130, 150)
        self.cell(0, 10, f'Darkon Security Operations Center - Page {self.page_no()}', 0, 0, 'C')

def generate_scan_pdf(scan_data, output_path):
    pdf = SecurityPDFReport()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Title & Target Box
    pdf.set_fill_color(18, 24, 38)
    pdf.rect(10, 30, 190, 32, 'F')
    
    pdf.set_xy(15, 34)
    pdf.set_font('Helvetica', 'B', 16)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 8, f"Target: {scan_data.get('target')}", 0, 1)

    pdf.set_x(15)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(180, 190, 210)
    pdf.cell(90, 6, f"Scan Type: {scan_data.get('scan_type')}", 0, 0)
    pdf.cell(90, 6, f"OS Detected: {scan_data.get('os_detected')}", 0, 1)
    
    pdf.set_x(15)
    pdf.cell(90, 6, f"Open Ports: {scan_data.get('open_ports_count')}", 0, 0)
    pdf.cell(90, 6, f"Vulnerabilities: {scan_data.get('vulnerabilities_count')}", 0, 1)

    # Risk Meter Section
    pdf.ln(12)
    risk_score = scan_data.get('risk_score', 0.0)
    risk_level = scan_data.get('risk_level', 'Low').upper()
    
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(0, 240, 255)
    pdf.cell(0, 8, "DYNAMIC RISK ASSESSMENT", 0, 1)
    
    pdf.set_font('Helvetica', 'B', 22)
    if risk_level in ['CRITICAL', 'HIGH']:
        pdf.set_text_color(239, 68, 68) # Red
    elif risk_level == 'MEDIUM':
        pdf.set_text_color(245, 158, 11) # Orange
    else:
        pdf.set_text_color(16, 185, 129) # Green
        
    pdf.cell(0, 10, f"RISK INDEX: {risk_score} / 100 ({risk_level})", 0, 1)
    pdf.ln(4)

    # Attack Categories Badges
    categories = scan_data.get('attack_categories', [])
    if categories:
        pdf.set_font('Helvetica', 'B', 10)
        pdf.set_text_color(200, 210, 230)
        pdf.cell(0, 6, f"Attack Classifications: {', '.join(categories)}", 0, 1)
        pdf.ln(6)

    # Open Ports Table
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(0, 240, 255)
    pdf.cell(0, 8, "DISCOVERED NETWORK SERVICES", 0, 1)

    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_fill_color(30, 40, 60)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(25, 7, "PORT", 1, 0, 'C', True)
    pdf.cell(25, 7, "PROTOCOL", 1, 0, 'C', True)
    pdf.cell(30, 7, "STATE", 1, 0, 'C', True)
    pdf.cell(40, 7, "SERVICE", 1, 0, 'C', True)
    pdf.cell(70, 7, "VERSION", 1, 1, 'C', True)

    pdf.set_font('Helvetica', '', 9)
    pdf.set_text_color(200, 210, 220)
    for p in scan_data.get('ports', []):
        pdf.cell(25, 6, str(p.get('port')), 1, 0, 'C')
        pdf.cell(25, 6, str(p.get('protocol')), 1, 0, 'C')
        pdf.cell(30, 6, str(p.get('state')), 1, 0, 'C')
        pdf.cell(40, 6, str(p.get('service')), 1, 0, 'L')
        pdf.cell(70, 6, str(p.get('version'))[:38], 1, 1, 'L')

    pdf.ln(8)

    # Vulnerabilities Section
    pdf.set_font('Helvetica', 'B', 12)
    pdf.set_text_color(0, 240, 255)
    pdf.cell(0, 8, "DETECTED CVE VULNERABILITIES", 0, 1)

    for v in scan_data.get('vulnerabilities', []):
        pdf.set_font('Helvetica', 'B', 10)
        pdf.set_text_color(239, 68, 68)
        pdf.cell(0, 6, f"- {v.get('cve_id')} | CVSS: {v.get('cvss_score')} | Severity: {v.get('severity')}", 0, 1)
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(180, 190, 200)
        pdf.multi_cell(0, 5, f"Description: {v.get('description')}")
        pdf.ln(2)

    # AI Intelligence Section
    ai = scan_data.get('ai_summary', {})
    if ai:
        pdf.ln(6)
        pdf.set_font('Helvetica', 'B', 12)
        pdf.set_text_color(0, 240, 255)
        pdf.cell(0, 8, "DARKON AI THREAT INTELLIGENCE & REMEDIATION", 0, 1)

        pdf.set_font('Helvetica', 'B', 10)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(0, 6, "Executive Summary:", 0, 1)
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(180, 190, 200)
        pdf.multi_cell(0, 5, str(ai.get('executive_summary', '')))

        pdf.ln(3)
        pdf.set_font('Helvetica', 'B', 10)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(0, 6, "Actionable Fixes & Recommendations:", 0, 1)
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(180, 190, 200)
        fixes = ai.get('recommended_fixes', [])
        if isinstance(fixes, list):
            for fix in fixes:
                pdf.cell(0, 5, f"- {fix}", 0, 1)
        else:
            pdf.multi_cell(0, 5, str(fixes))

    pdf.output(output_path)
    return output_path
