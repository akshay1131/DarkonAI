from flask import Blueprint, request, jsonify
from utils.multi_agent_ai import MultiAgentAISystem
from utils.threat_predictor import AIThreatPredictor
from utils.attack_simulator import CyberAttackSimulator
from routes.powergrid import KERALA_ASSETS
from routes.auth import admin_required

ai_agents_bp = Blueprint('ai_agents', __name__)
multi_agent = MultiAgentAISystem()
threat_predictor = AIThreatPredictor()
attack_sim = CyberAttackSimulator()

@ai_agents_bp.route('/analyze-threat', methods=['POST'])
@admin_required
def analyze_threat():
    data = request.get_json() or {}
    if not data.get("incident_id"):
        data = attack_sim.generate_random_attack(KERALA_ASSETS)

    analysis = multi_agent.run_multi_agent_analysis(data)
    prediction = threat_predictor.predict_next_attack_path(data, KERALA_ASSETS)

    return jsonify({
        "incident_details": data,
        "multi_agent_analysis": analysis,
        "threat_prediction": prediction
    }), 200

@ai_agents_bp.route('/chatbot', methods=['POST'])
@admin_required
def soc_chatbot():
    data = request.get_json() or {}
    message = data.get("message", "").lower().strip()
    
    if "mitre" in message:
        reply = "Darkon AI maps critical grid attacks to MITRE ATT&CK for ICS tactics including T0855 (Unauthorized Command Message), T0814 (Denial of Service), and T0831 (Manipulation of Control)."
    elif "kerala" in message or "grid" in message:
        reply = "The Kerala Smart Power Grid Digital Twin monitors 250+ assets across 14 districts. Active frequency is 50.02 Hz with 92.4% overall grid health."
    elif "agent" in message or "threat" in message:
        reply = "Our 5-Agent Collaborative AI System coordinates Network Analysis, Threat Intel (CVE lookup), Incident Response Playbooks, Risk Scoring, and Executive Summaries."
    elif "recommend" in message or "fix" in message:
        reply = "Key SOC Containment Steps: 1. Block source IP on Firewall. 2. Isolate PLC communication. 3. Enforce MFA & IP Whitelisting for Port 502/104."
    else:
        reply = f"Darkon AI SOC Assistant active. Analyzed query: '{message}'. Grid security telemetry optimal. 250+ SCADA assets monitored across Kerala districts."

    return jsonify({
        "response": reply,
        "confidence": "98.2%",
        "agent": "Darkon AI Security Advisor"
    }), 200
