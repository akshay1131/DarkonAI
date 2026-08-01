import random
from datetime import datetime

ATTACK_SCENARIOS = [
    {
        "threat_type": "Unauthorized Modbus/TCP Write",
        "category": "Critical Infrastructure Threat",
        "mitre_id": "T0855",
        "tactic": "Impair Process Control",
        "severity": "CRITICAL",
        "protocol": "Modbus/TCP (Port 502)",
        "description": "Unauthenticated function code 0x05 / 0x06 coil write command sent to substation PLC attempting coil force override on transformer breaker logic.",
        "cve": "CVE-2022-3166"
    },
    {
        "threat_type": "IEC 60870-5-104 Telemetry Flood",
        "category": "Denial of Service",
        "mitre_id": "T0814",
        "tactic": "Denial of Service",
        "severity": "HIGH",
        "protocol": "IEC-104 (Port 104)",
        "description": "Malformed IEC 60870-5-104 APDU packet burst targeting Regional Control Center gateway causing telemetry frame drop.",
        "cve": "CVE-2023-28341"
    },
    {
        "threat_type": "Ransomware Binary Beaconing",
        "category": "Remote Code Execution",
        "mitre_id": "T1486",
        "tactic": "Impact",
        "severity": "CRITICAL",
        "protocol": "HTTPS (Port 443)",
        "description": "Outbound encrypted beaconing detected from Engineering Workstation to external C2 IP attempting file system encryption of PLC project files.",
        "cve": "CVE-2021-44228"
    },
    {
        "threat_type": "OPC-UA Authentication Bypass",
        "category": "Weak Authentication",
        "mitre_id": "T0859",
        "tactic": "Initial Access",
        "severity": "HIGH",
        "protocol": "OPC-UA (Port 4840)",
        "description": "Anonymous certificate validation exploit attempting unauthorized read/write access to SCADA Historian tag data.",
        "cve": "CVE-2022-0941"
    },
    {
        "threat_type": "Substation Network Port Scan",
        "category": "Network Exposure",
        "mitre_id": "T1046",
        "tactic": "Discovery",
        "severity": "MEDIUM",
        "protocol": "TCP SYN Scan",
        "description": "Rapid sequential port probing across subnetwork 10.EKM.1.0/24 targeting ports 22, 104, 502, 3389.",
        "cve": "N/A"
    }
]

class CyberAttackSimulator:
    """
    Generates live simulated cyber attack incidents for the Kerala Power Grid Digital Twin.
    """
    def generate_random_attack(self, assets):
        target_asset = random.choice(assets) if assets else {
            "id": "KL-EKM-PLC-004",
            "name": "Kalamassery SLDC Programmable Logic Controller",
            "district": "Ernakulam",
            "ip_address": "10.EKM.1.45"
        }
        
        scenario = random.choice(ATTACK_SCENARIOS)
        source_ip = f"{random.randint(185, 220)}.{random.randint(10, 200)}.{random.randint(1, 254)}.{random.randint(1, 254)}"

        return {
            "incident_id": f"INC-2026-{random.randint(10000, 99999)}",
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "target_asset_id": target_asset["id"],
            "target_asset_name": target_asset["name"],
            "target_district": target_asset["district"],
            "target_ip": target_asset.get("ip_address", "10.10.1.5"),
            "source_ip": source_ip,
            "threat_type": scenario["threat_type"],
            "category": scenario["category"],
            "mitre_id": scenario["mitre_id"],
            "mitre_tactic": scenario["tactic"],
            "severity": scenario["severity"],
            "protocol": scenario["protocol"],
            "description": scenario["description"],
            "cve": scenario["cve"],
            "risk_score": 92.5 if scenario["severity"] == "CRITICAL" else 78.0
        }
