import os
from datetime import datetime
from flask import Blueprint, request, jsonify, send_file, send_from_directory
from werkzeug.utils import secure_filename
from utils.attack_simulator import CyberAttackSimulator
from utils.email_notifier import EmailNotifier
from utils.pdf_generator import generate_scan_pdf, generate_multi_sector_pdf_report
from utils.multi_sector_data import multi_sector_store
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
    
    analytics_data = multi_sector_store.get_unified_analytics()

    reports_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    timestamp_slug = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    pdf_filename = f"Darkon_MultiSector_Cybersecurity_Assessment_{timestamp_slug}.pdf"
    pdf_path = os.path.join(reports_dir, pdf_filename)
    
    generate_multi_sector_pdf_report(analytics_data, pdf_path)

    primary_incident = analytics_data["incidents"][0] if analytics_data["incidents"] else {}
    email_msg = 'Not requested'
    if recipient:
        _, email_msg = email_notifier.send_incident_alert_email(
            recipient_email=recipient,
            incident_data=primary_incident,
            pdf_path=pdf_path
        )

    return jsonify({
        "message": "Incident report generated successfully",
        "incident": primary_incident,
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
