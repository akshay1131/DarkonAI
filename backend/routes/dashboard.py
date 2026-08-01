from flask import Blueprint, jsonify
from models import db, Scan
from routes.auth import admin_required

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@admin_required
def get_dashboard_stats():
    scans = Scan.query.all()
    total_scans = len(scans)
    
    if total_scans == 0:
        return jsonify({
            'total_scans': 0,
            'total_vulnerabilities': 0,
            'critical_assets': 0,
            'avg_security_score': 85.0,
            'risk_distribution': {'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0},
            'recent_scans': [],
            'top_vulnerable_services': [],
            'security_trends': []
        }), 200

    total_vulns = sum(s.vulnerabilities_count for s in scans)
    avg_score = round(sum(s.risk_score for s in scans) / total_scans, 1)
    
    dist = {'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0}
    for s in scans:
        dist[s.risk_level] = dist.get(s.risk_level, 0) + 1

    recent = [s.to_dict() for s in Scan.query.order_by(Scan.created_at.desc()).limit(5).all()]

    return jsonify({
        'total_scans': total_scans,
        'total_vulnerabilities': total_vulns,
        'critical_assets': dist.get('Critical', 0) + dist.get('High', 0),
        'avg_security_score': avg_score,
        'risk_distribution': dist,
        'recent_scans': recent,
        'top_vulnerable_services': [
            {'name': 'OpenSSH', 'count': 4, 'severity': 'CRITICAL'},
            {'name': 'Apache HTTP', 'count': 3, 'severity': 'HIGH'},
            {'name': 'Modbus SCADA', 'count': 2, 'severity': 'CRITICAL'},
            {'name': 'MySQL Server', 'count': 2, 'severity': 'MEDIUM'}
        ]
    }), 200
