import random
import time
from flask import Blueprint, jsonify, request
from utils.kerala_grid_data import generate_250_kerala_grid_assets, KERALA_DISTRICTS
from utils.telemetry_simulator import KeralaPowerGridTelemetrySimulator
from utils.attack_simulator import CyberAttackSimulator
from routes.auth import admin_required

powergrid_bp = Blueprint('powergrid', __name__)

# Initialize 250+ Kerala Smart Power Grid Assets in memory
KERALA_ASSETS = generate_250_kerala_grid_assets()
telemetry_sim = KeralaPowerGridTelemetrySimulator()
attack_sim = CyberAttackSimulator()

@powergrid_bp.route('/status', methods=['GET'])
@powergrid_bp.route('/', methods=['GET'])
@admin_required
def get_powergrid_full_status():
    # Dynamically select an active target district for continuous cyber attack simulation
    # Rotates or randomly picks an active district every few seconds
    active_critical_district_code = random.choice(["TVM", "EKM", "IDK", "KKD", "TCR", "PKD", "KNR", "ALP"])
    
    # Update assets dynamically based on active attack vector
    for asset in KERALA_ASSETS:
        if asset["district_code"] == active_critical_district_code:
            asset["status"] = "CRITICAL"
            asset["risk_score"] = round(random.uniform(85.0, 98.0), 1)
            asset["health_score"] = round(100.0 - asset["risk_score"], 1)
        elif random.random() < 0.15:
            asset["status"] = "WARNING"
            asset["risk_score"] = round(random.uniform(45.0, 68.0), 1)
            asset["health_score"] = round(100.0 - asset["risk_score"], 1)
        else:
            asset["status"] = "HEALTHY"
            asset["risk_score"] = round(random.uniform(4.0, 18.0), 1)
            asset["health_score"] = round(100.0 - asset["risk_score"], 1)

    telemetry = telemetry_sim.get_live_grid_telemetry(KERALA_ASSETS)
    
    # Generate district aggregated summary with dynamic statuses
    district_summary = []
    for dist in KERALA_DISTRICTS:
        dist_assets = [a for a in KERALA_ASSETS if a["district"] == dist["name"]]
        crit_count = len([a for a in dist_assets if a["status"] == "CRITICAL"])
        warn_count = len([a for a in dist_assets if a["status"] == "WARNING"])
        
        if dist["code"] == active_critical_district_code or crit_count > 0:
            status = "CRITICAL"
        elif warn_count > 0:
            status = "WARNING"
        else:
            status = "HEALTHY"

        district_summary.append({
            "district": dist["name"],
            "code": dist["code"],
            "latitude": dist["lat"],
            "longitude": dist["lng"],
            "rcc": dist["rcc"],
            "total_assets": len(dist_assets),
            "threats_count": crit_count + warn_count,
            "status": status
        })

    # Generate current active cyber incident
    active_incident = attack_sim.generate_random_attack([a for a in KERALA_ASSETS if a["district_code"] == active_critical_district_code] or KERALA_ASSETS)

    return jsonify({
        "telemetry": telemetry,
        "district_summary": district_summary,
        "active_critical_district": active_critical_district_code,
        "active_incident": active_incident,
        "substations": KERALA_ASSETS[:10],
        "total_assets_count": len(KERALA_ASSETS)
    }), 200

@powergrid_bp.route('/assets', methods=['GET'])
@admin_required
def get_all_assets():
    district_filter = request.args.get('district')
    status_filter = request.args.get('status')
    
    filtered = KERALA_ASSETS
    if district_filter:
        filtered = [a for a in filtered if a["district"].lower() == district_filter.lower()]
    if status_filter:
        filtered = [a for a in filtered if a["status"].lower() == status_filter.lower()]

    return jsonify({
        "total_count": len(filtered),
        "assets": filtered
    }), 200

@powergrid_bp.route('/assets/<asset_id>', methods=['GET'])
@admin_required
def get_asset_by_id(asset_id):
    asset = next((a for a in KERALA_ASSETS if a["id"] == asset_id), None)
    if asset:
        return jsonify(asset), 200
    return jsonify({"error": "Asset not found"}), 404
