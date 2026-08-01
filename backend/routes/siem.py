from flask import Blueprint, request, jsonify
from models import Scan
from utils.siem_exporter import SIEMExporter
from utils.nvd_api_v2 import NVDAPIV2Client
from routes.auth import admin_required

siem_bp = Blueprint('siem', __name__)
nvd_client = NVDAPIV2Client()

@siem_bp.route('/export/<int:scan_id>', methods=['GET'])
@admin_required
def export_scan_siem(scan_id):
    fmt = request.args.get('format', 'cef').lower()
    scan = Scan.query.get_or_404(scan_id)
    scan_data = scan.to_dict()

    exporter = SIEMExporter()

    if fmt == 'json':
        log_content = exporter.format_json_event(scan_data)
        return jsonify(log_content), 200
    else:
        log_content = exporter.format_cef_event(scan_data)
        return jsonify({
            'format': 'CEF',
            'cef_string': log_content,
            'scan_id': scan_id
        }), 200

@siem_bp.route('/forward', methods=['POST'])
@admin_required
def forward_to_syslog():
    data = request.get_json() or {}
    scan_id = data.get('scan_id')
    syslog_host = data.get('syslog_host')
    syslog_port = data.get('syslog_port', 514)
    protocol = data.get('protocol', 'UDP')
    fmt = data.get('format', 'cef')

    if not scan_id or not syslog_host:
        return jsonify({'error': 'scan_id and syslog_host are required'}), 400

    scan = Scan.query.get_or_404(scan_id)
    scan_data = scan.to_dict()

    exporter = SIEMExporter(syslog_host=syslog_host, syslog_port=int(syslog_port), protocol=protocol)
    
    if fmt == 'json':
        payload = str(exporter.format_json_event(scan_data))
    else:
        payload = exporter.format_cef_event(scan_data)

    success, msg = exporter.send_syslog_message(payload)
    if success:
        return jsonify({'message': msg, 'status': 'sent'}), 200
    else:
        return jsonify({'error': msg, 'status': 'failed'}), 500

@siem_bp.route('/nvd/lookup/<cve_id>', methods=['GET'])
@admin_required
def nvd_live_lookup(cve_id):
    cve_data = nvd_client.get_cve_details(cve_id)
    if cve_data:
        return jsonify(cve_data), 200
    return jsonify({'error': f'CVE {cve_id} not found on NVD API v2'}), 404
