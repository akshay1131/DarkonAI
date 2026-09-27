from flask import Blueprint, jsonify, request
from utils.sector_simulator import sector_engine
from utils.multi_sector_data import multi_sector_store, MITRE_KNOWLEDGE_BASE
from routes.auth import admin_required

sectors_bp = Blueprint('sectors', __name__)

@sectors_bp.route('/overview', methods=['GET'])
@admin_required
def get_sectors_overview():
    """
    Returns high-level status, risk badges, and active alert for all 4 sectors,
    driven dynamically by the unified multi-sector store.
    """
    analytics = multi_sector_store.get_unified_analytics()
    sector_sums = analytics["sector_summaries"]

    # Map icons and titles
    meta_map = {
        "Power Grid": {"key": "powergrid", "icon": "Zap", "title": "⚡ Kerala Power Grid / SCADA"},
        "Agriculture": {"key": "agriculture", "icon": "Wheat", "title": "🌾 Smart Agriculture & IoT"},
        "Hospital": {"key": "hospital", "icon": "Building2", "title": "🏥 Hospital & Medical Infrastructure"},
        "Education": {"key": "education", "icon": "GraduationCap", "title": "🏫 Educational Institution"}
    }

    sectors_list = []
    for s_name, s_data in sector_sums.items():
        meta = meta_map.get(s_name, {"key": s_name.lower().replace(" ", ""), "icon": "ShieldAlert", "title": s_name})
        sectors_list.append({
            "sector_name": s_name,
            "sector_key": meta["key"],
            "icon": meta["icon"],
            "title": meta["title"],
            "status": s_data["status"],
            "badge": s_data["badge"],
            "color": s_data["color"],
            "total_assets": s_data["asset_count"],
            "critical_count": s_data["severity_distribution"]["Critical"],
            "high_count": s_data["severity_distribution"]["High"],
            "avg_risk_score": s_data["risk_score"],
            "latest_threat": s_data["latest_threat"],
            "active_incident": sector_engine.active_incidents.get(meta["key"])
        })

    return jsonify({
        "sectors": sectors_list,
        "overall_risk_score": analytics["overall_risk_score"],
        "total_assets": analytics["total_assets"],
        "total_incidents": analytics["total_incidents"],
        "active_banner_alert": sector_engine.active_banner_alert,
        "timestamp": analytics["incidents"][0]["timestamp"] if analytics["incidents"] else None
    }), 200

@sectors_bp.route('/analytics', methods=['GET'])
@admin_required
def get_multi_sector_analytics():
    """
    Returns single-source-of-truth analytics:
    - 5x5 Cyber Risk Heat Map data points
    - Dynamic attack category distribution percentages (summing to ~100%)
    - Dynamic sector-wise attack distribution percentages
    - Dynamic severity distribution percentages
    - Top detected MITRE attacks and counts
    - Sector summary cards
    """
    return jsonify(multi_sector_store.get_unified_analytics()), 200

@sectors_bp.route('/assets', methods=['GET'])
@admin_required
def get_unified_assets():
    """
    Returns unified multi-sector assets (328+ assets) across:
    Power Grid, Agriculture, Hospital, Education
    with filtering by sector, district, status, and search query.
    """
    sector = request.args.get('sector')
    district = request.args.get('district')
    status = request.args.get('status')
    search = request.args.get('search')

    result = multi_sector_store.filter_assets(
        sector=sector,
        district=district,
        status=status,
        search=search
    )
    return jsonify(result), 200

@sectors_bp.route('/mitre-knowledge', methods=['GET'])
@admin_required
def get_mitre_knowledge():
    """
    Returns the comprehensive MITRE ATT&CK knowledge base
    for beginner-friendly explanations.
    """
    technique_id = request.args.get('id')
    if technique_id:
        tech = MITRE_KNOWLEDGE_BASE.get(technique_id.upper())
        if tech:
            return jsonify(tech), 200
        return jsonify({"error": f"Technique '{technique_id}' not found"}), 404
        
    return jsonify(MITRE_KNOWLEDGE_BASE), 200

@sectors_bp.route('/heatmap', methods=['GET'])
@admin_required
def get_sectors_heatmap():
    """Returns zone and asset cybersecurity health matrix for Agriculture, Hospital, and Education."""
    return jsonify(sector_engine.get_heatmap_data()), 200

@sectors_bp.route('/alerts', methods=['GET'])
@admin_required
def get_sectors_alerts():
    """Returns real-time security alerts and active banner alert."""
    return jsonify(sector_engine.get_alerts()), 200

@sectors_bp.route('/alerts/dismiss', methods=['POST'])
@admin_required
def dismiss_alert():
    """Dismisses or acknowledges the currently displayed banner alert."""
    return jsonify(sector_engine.dismiss_banner_alert()), 200

@sectors_bp.route('/<sector_id>', methods=['GET'])
@admin_required
def get_sector_detail(sector_id):
    """Returns assets, live telemetry, and active incident for an individual sector."""
    res = sector_engine.get_sector_data(sector_id)
    if isinstance(res, tuple):
        return jsonify(res[0]), res[1]
    return jsonify(res), 200

@sectors_bp.route('/test-event', methods=['POST'])
@admin_required
def trigger_test_event():
    data = request.get_json() or {}
    sector = data.get('sector', 'Hospital')
    severity = data.get('severity', 'CRITICAL').upper()
    event_result = sector_engine.trigger_test_event(sector, severity)
    return jsonify({
        "status": "success",
        "message": f"Test {severity} event triggered for {sector}",
        "event": event_result
    }), 200

# Direct aliases
@sectors_bp.route('/agriculture', methods=['GET'])
@admin_required
def get_agriculture_alias():
    return jsonify(sector_engine.get_sector_data('agriculture')), 200

@sectors_bp.route('/hospital', methods=['GET'])
@admin_required
def get_hospital_alias():
    return jsonify(sector_engine.get_sector_data('hospital')), 200

@sectors_bp.route('/education', methods=['GET'])
@admin_required
def get_education_alias():
    return jsonify(sector_engine.get_sector_data('education')), 200
