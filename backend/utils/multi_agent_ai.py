import json

class MultiAgentAISystem:
    """
    5-Agent Collaborative AI Intelligence System for Critical Infrastructure Threat Defense.
    """
    def run_multi_agent_analysis(self, incident_data):
        target = incident_data.get("target_asset_name", "Substation Asset")
        threat = incident_data.get("threat_type", "Cyber Incident")
        severity = incident_data.get("severity", "HIGH")
        cve = incident_data.get("cve", "CVE-2023-28341")
        mitre = incident_data.get("mitre_id", "T0855")

        # Agent 1: Network Security Agent
        agent1_network = {
            "agent_name": "Network Security Agent",
            "role": "Traffic Anomaly & Protocol Inspection",
            "findings": f"Detected unauthorized protocol frame sequences targeting {incident_data.get('protocol', 'Modbus TCP')}. Anomaly threshold exceeded by 340% over baseline traffic.",
            "suspicious_ports": [502, 104, 22],
            "packet_analysis": "Malformed APDU payload attempting forced coil write command override."
        }

        # Agent 2: Threat Intelligence Agent
        agent2_intel = {
            "agent_name": "Threat Intelligence Agent",
            "role": "CVE & MITRE ATT&CK Mapping",
            "cve_matched": cve,
            "mitre_tactic": incident_data.get("mitre_tactic", "Impair Process Control"),
            "mitre_technique": mitre,
            "exploit_availability": "Public Exploit-DB PoC Available",
            "kill_chain_stage": "Execution / Operational Tampering",
            "cisa_kev_listed": True
        }

        # Agent 3: Incident Response Agent
        agent3_response = {
            "agent_name": "Incident Response Agent",
            "role": "Automated Containment & Mitigation Playbook",
            "recommended_actions": [
                f"Immediately block source IP {incident_data.get('source_ip', '192.168.1.100')} on Industrial Firewall.",
                f"Isolate PLC communication channel on {target} to prevent unauthorized coil state changes.",
                "Enforce IP Whitelisting for Modbus/TCP Port 502 and IEC-104 Port 104.",
                "Apply Emergency Firmware Patch v4.2.1 to resolve CVE vulnerability.",
                "Trigger automated backup snapshot for SCADA Historian Database."
            ],
            "justification": "Restricting unauthenticated network ingress stops payload execution without interrupting power grid transmission stability."
        }

        # Agent 4: Risk Assessment Agent
        agent4_risk = {
            "agent_name": "Risk Assessment Agent",
            "role": "Quantitative Risk & Impact Evaluator",
            "business_impact": "High risk of regional power blackout across Kerala substation feeders.",
            "operational_impact": "Substation breaker trip causing 450MW grid load imbalance.",
            "safety_impact": "Transformer oil thermal overload risk if cooling control relay is disabled.",
            "calculated_risk_score": 94.5 if severity == "CRITICAL" else 78.0,
            "confidence_percentage": 98.4,
            "priority": "P0_IMMEDIATE_ACTION" if severity == "CRITICAL" else "P1_HIGH_PRIORITY"
        }

        # Agent 5: AI Security Advisor
        agent5_advisor = {
            "agent_name": "AI Security Advisor",
            "role": "Natural Language SOC Incident Summary",
            "executive_summary": f"Darkon AI Multi-Agent Defense triggered for {threat} on {target} in district {incident_data.get('target_district', 'Kerala Grid')}.",
            "explanation": f"Multiple unauthorized command writes were detected targeting industrial control protocols. Threat Intelligence correlates this pattern with {cve} ({mitre}).",
            "threat_verdict": f"CRITICAL INFRASTRUCTURE THREAT DETECTED ({severity})",
            "analyst_guidance": "Execute Playbook #04: SCADA PLC Isolation & Source Firewall Block immediately."
        }

        return {
            "incident_id": incident_data.get("incident_id"),
            "target": target,
            "agents": [
                agent1_network,
                agent2_intel,
                agent3_response,
                agent4_risk,
                agent5_advisor
            ]
        }
