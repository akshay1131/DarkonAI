import json
import os
from flask import Blueprint, request, jsonify, send_file
from models import db, Scan, AuditLog
from utils.scanner import NetworkScanner
from utils.vuln_engine import VulnerabilityEngine
from utils.risk_engine import RiskScoringEngine
from utils.ai_engine import AIEngine
from utils.pdf_generator import generate_scan_pdf
from routes.auth import admin_required

scan_bp = Blueprint('scan', __name__)
scanner = NetworkScanner()
vuln_engine = VulnerabilityEngine()
risk_engine = RiskScoringEngine()
ai_engine = AIEngine()

@scan_bp.route('/execute', methods=['POST'])
@admin_required
def execute_scan():
    data = request.get_json() or {}
    target = data.get('target', '').strip()
    scan_type = data.get('scan_type', 'Full Vulnerability Scan')
    
    if not target:
        return jsonify({'error': 'Target hostname, IP or domain is required'}), 400

    # 1. Network Scan
    scan_raw = scanner.scan_target(target, scan_mode=scan_type.lower())
    ports = scan_raw.get('ports', [])
    
    # 2. Vulnerability Matching
    vulnerabilities = vuln_engine.match_vulnerabilities(ports)
    
    # 3. Dynamic Risk Scoring & Attack Classification
    risk_info = risk_engine.calculate_risk(ports, vulnerabilities)
    risk_score = risk_info['risk_score']
    risk_level = risk_info['risk_level']
    attack_categories = risk_info['attack_categories']

    # 4. AI Insight Generation
    ai_summary = ai_engine.generate_security_insights(
        target, risk_score, risk_level, ports, vulnerabilities, attack_categories
    )

    # 5. Persist to DB
    scan_record = Scan(
        target=target,
        scan_type=scan_type,
        status='Completed',
        risk_score=risk_score,
        risk_level=risk_level,
        open_ports_count=len(ports),
        vulnerabilities_count=len(vulnerabilities),
        os_detected=scan_raw.get('os_detected', 'Linux'),
        scan_duration=scan_raw.get('scan_duration', 1.5),
        ports_json=json.dumps(ports),
        vulnerabilities_json=json.dumps(vulnerabilities),
        ai_summary_json=json.dumps(ai_summary),
        attack_categories_json=json.dumps(attack_categories)
    )
    
    db.session.add(scan_record)
    db.session.add(AuditLog(action="NETWORK_SCAN", details=f"Initiated scan for target {target}"))
    db.session.commit()

    return jsonify(scan_record.to_dict()), 201

@scan_bp.route('/history', methods=['GET'])
@admin_required
def get_scan_history():
    scans = Scan.query.order_by(Scan.created_at.desc()).all()
    return jsonify([s.to_dict() for s in scans]), 200

@scan_bp.route('/<int:scan_id>', methods=['GET'])
@admin_required
def get_scan_detail(scan_id):
    scan = Scan.query.get_or_404(scan_id)
    return jsonify(scan.to_dict()), 200

@scan_bp.route('/<int:scan_id>/pdf', methods=['GET'])
@admin_required
def download_pdf(scan_id):
    scan = Scan.query.get_or_404(scan_id)
    scan_data = scan.to_dict()
    
    reports_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    pdf_filename = f"Darkon_Report_Scan_{scan.id}_{scan.target.replace('.', '_')}.pdf"
    pdf_path = os.path.join(reports_dir, pdf_filename)
    
    generate_scan_pdf(scan_data, pdf_path)
    return send_file(pdf_path, as_attachment=True, download_name=pdf_filename)
