import os
from flask import Blueprint, request, jsonify, send_file, send_from_directory
from werkzeug.utils import secure_filename
from utils.attack_simulator import CyberAttackSimulator
from utils.email_notifier import EmailNotifier
from utils.pdf_generator import generate_scan_pdf
from routes.powergrid import KERALA_ASSETS
from routes.auth import admin_required

incident_bp = Blueprint('incident', __name__)
attack_sim = CyberAttackSimulator()
email_notifier = EmailNotifier()

@incident_bp.route('/generate-report', methods=['POST'])
@admin_required
def generate_incident_report():
    data = request.get_json() or {}
    recipient = data.get("recipient_email")
    
    incident = data.get("incident") or attack_sim.generate_random_attack(KERALA_ASSETS)

    # Format scan data compatible with PDF generator
    pdf_data = {
        "target": f"{incident['target_asset_name']} ({incident['target_ip']})",
        "scan_type": f"SCADA Cyber Incident - {incident['threat_type']}",
        "os_detected": "Embedded Linux RTOS / Substation PLC",
        "risk_score": incident.get("risk_score", 92.5),
        "risk_level": incident.get("severity", "CRITICAL"),
        "open_ports_count": 4,
        "vulnerabilities_count": 2,
        "attack_categories": [incident.get("category", "Critical Infrastructure Threat")],
        "ports": [
            {"port": 502, "protocol": "TCP", "state": "open", "service": "modbus", "version": "Modbus SCADA Gateway"},
            {"port": 104, "protocol": "TCP", "state": "open", "service": "iec-104", "version": "IEC 60870-5-104 Telemetry"}
        ],
        "vulnerabilities": [
            {
                "cve_id": incident.get("cve", "CVE-2023-28341"),
                "cvss_score": 9.1,
                "severity": incident.get("severity", "CRITICAL"),
                "description": incident.get("description", "Unauthenticated SCADA command execution attempt."),
                "detected_service": "Modbus / IEC-104 Gateway"
            }
        ],
        "ai_summary": {
            "executive_summary": f"Darkon AI detected {incident.get('threat_type')} targeting {incident.get('target_asset_name')} in district {incident.get('target_district')}.",
            "recommended_fixes": [
                f"Block source IP {incident.get('source_ip')} on Industrial Security Firewall.",
                "Isolate PLC communication interface on target substation.",
                "Enforce IP Whitelisting for Port 502 / Port 104."
            ]
        }
    }

    reports_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    pdf_filename = f"Incident_Report_{incident.get('incident_id', 'INC-9941')}.pdf"
    pdf_path = os.path.join(reports_dir, pdf_filename)
    
    generate_scan_pdf(pdf_data, pdf_path)

    email_msg = 'Not requested'
    if recipient:
        _, email_msg = email_notifier.send_incident_alert_email(
            recipient_email=recipient,
            incident_data=incident,
            pdf_path=pdf_path
        )

    return jsonify({
        "message": "Incident report generated successfully",
        "incident": incident,
        "email_status": email_msg,
        "pdf_report": pdf_filename
    }), 200


@incident_bp.route('/reports/<path:filename>', methods=['GET'])
@admin_required
def download_incident_report(filename):
    """Download a generated incident PDF without exposing the reports directory."""
    safe_filename = secure_filename(filename)
    if not safe_filename or safe_filename != filename or not safe_filename.endswith('.pdf'):
        return jsonify({'error': 'Invalid report filename'}), 400

    reports_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'reports')
    report_path = os.path.join(reports_dir, safe_filename)
    if not os.path.isfile(report_path):
        return jsonify({'error': 'Report not found. Generate it before downloading.'}), 404

    return send_from_directory(reports_dir, safe_filename, as_attachment=True)
