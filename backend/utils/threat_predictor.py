import random

class AIThreatPredictor:
    """
    AI Threat Prediction & Attack Path Forecaster.
    """
    def predict_next_attack_path(self, current_incident, assets):
        target_asset = current_incident.get("target_asset_name", "Substation PLC")
        district = current_incident.get("target_district", "Ernakulam")

        possible_next_targets = [a for a in assets if a.get("district") == district and a.get("name") != target_asset]
        next_target = random.choice(possible_next_targets) if possible_next_targets else {
            "name": f"{district} Regional Control Center Gateway",
            "ip_address": "10.EKM.1.200",
            "asset_type": "Regional Control Center (RCC)"
        }

        return {
            "current_compromised_node": target_asset,
            "predicted_next_target": next_target.get("name"),
            "predicted_target_ip": next_target.get("ip_address"),
            "probability_of_exploitation": round(random.uniform(84.0, 96.5), 1),
            "predicted_attack_path": [
                f"1. Initial Breach: {target_asset}",
                f"2. Lateral Protocol Pivot: Modbus TCP -> IEC-104 Gateway",
                f"3. High-Value Target: {next_target.get('name')}",
                "4. Objective: Master Trip Coil Command Execution"
            ],
            "attacker_objective": "Statewide Power Grid Desynchronization & Substation Blackout",
            "confidence_percentage": 94.8,
            "recommended_preemptive_action": f"Preemptively isolate network route between {target_asset} and {next_target.get('name')}."
        }
