import time
import random
import threading
from datetime import datetime
from utils.email_notifier import EmailNotifier

# -------------------------------------------------------------------
# Sector Asset Inventories
# -------------------------------------------------------------------

AGRICULTURE_ZONES = [
    {
        "zone_name": "Sensor Zone A",
        "description": "Field soil moisture, humidity, and micro-climate telemetry nodes",
        "assets": [
            {"id": "AG-SOIL-01", "name": "Soil Moisture Sensor #01", "type": "IoT Sensor", "ip": "192.168.10.21", "protocol": "LoRaWAN / Modbus", "status": "HEALTHY", "risk_score": 12.0, "metrics": "Moisture: 38% • Temp: 27°C", "cve": "N/A", "threat": "Normal Telemetry"},
            {"id": "AG-TEMP-02", "name": "Ambient Temp & Humidity Node", "type": "IoT Sensor", "ip": "192.168.10.22", "protocol": "MQTT (Port 1883)", "status": "HEALTHY", "risk_score": 15.0, "metrics": "Temp: 29.4°C • Hum: 65%", "cve": "N/A", "threat": "Normal Telemetry"},
            {"id": "AG-SOLAR-03", "name": "Solar Radiometer Sensor", "type": "IoT Sensor", "ip": "192.168.10.23", "protocol": "Modbus RTU", "status": "HEALTHY", "risk_score": 8.0, "metrics": "Radiation: 820 W/m²", "cve": "N/A", "threat": "Normal Telemetry"}
        ]
    },
    {
        "zone_name": "Irrigation Zone",
        "description": "Automated drip valves, water pumps, and PLC controllers",
        "assets": [
            {"id": "AG-IRR-01", "name": "Irrigation Controller #01", "type": "PLC Controller", "ip": "192.168.10.40", "protocol": "Modbus TCP (Port 502)", "status": "HEALTHY", "risk_score": 18.0, "metrics": "Flow: 140 L/min • Valve: OPEN", "cve": "CVE-2022-3166", "threat": "Operating Normally"},
            {"id": "AG-IRR-04", "name": "Irrigation Controller #04", "type": "PLC Controller", "ip": "192.168.10.44", "protocol": "Modbus TCP (Port 502)", "status": "HEALTHY", "risk_score": 14.0, "metrics": "Flow: 125 L/min • Pressure: 3.2 bar", "cve": "CVE-2023-4412", "threat": "Operating Normally"},
            {"id": "AG-PUMP-01", "name": "High-Pressure Water Pump #01", "type": "Actuator", "ip": "192.168.10.51", "protocol": "DNP3 / Modbus", "status": "HEALTHY", "risk_score": 20.0, "metrics": "Motor: 1450 RPM • Current: 12A", "cve": "N/A", "threat": "Operating Normally"}
        ]
    },
    {
        "zone_name": "Farm Gateway",
        "description": "Industrial LoRaWAN edge concentrators and perimeter routers",
        "assets": [
            {"id": "AG-GW-01", "name": "Farm Edge Gateway Node", "type": "Gateway", "ip": "192.168.10.1", "protocol": "HTTPS / SSH", "status": "HEALTHY", "risk_score": 22.0, "metrics": "Packets/s: 340 • Uptime: 99.8%", "cve": "N/A", "threat": "Firewall Enforced"},
            {"id": "AG-LORA-02", "name": "LoRaWAN Concentrator Base", "type": "Gateway", "ip": "192.168.10.5", "protocol": "LoRaWAN Gateway", "status": "HEALTHY", "risk_score": 16.0, "metrics": "Connected Nodes: 48", "cve": "N/A", "threat": "Signal Strong (-78 dBm)"}
        ]
    },
    {
        "zone_name": "IoT Zone",
        "description": "Crop monitoring drones, weather stations, and distributed IoT nodes",
        "assets": [
            {"id": "AG-DRONE-01", "name": "Drone Aerial Survey Relay", "type": "Autonomous IoT", "ip": "192.168.10.75", "protocol": "Wi-Fi 6 / RTSP", "status": "HEALTHY", "risk_score": 15.0, "metrics": "Battery: 88% • Altitude: 45m", "cve": "N/A", "threat": "Video Feed Encrypted"},
            {"id": "AG-WEATH-02", "name": "Micro-Weather Station Node", "type": "Telemetry Node", "ip": "192.168.10.82", "protocol": "MQTT (Port 8883)", "status": "HEALTHY", "risk_score": 10.0, "metrics": "Wind: 12 km/h • Rain: 0mm", "cve": "N/A", "threat": "TLS Active"}
        ]
    },
    {
        "zone_name": "Server Zone",
        "description": "Agricultural MQTT brokers and central farm database server",
        "assets": [
            {"id": "AG-MQTT-01", "name": "Agricultural MQTT Broker", "type": "Message Broker", "ip": "192.168.10.100", "protocol": "MQTT / TLS (Port 8883)", "status": "HEALTHY", "risk_score": 24.0, "metrics": "Active Topics: 112 • Msg/s: 82", "cve": "CVE-2023-3482", "threat": "TLS 1.3 Active"},
            {"id": "AG-SRV-02", "name": "Agro-Climatic Central Server", "type": "Core Server", "ip": "192.168.10.150", "protocol": "HTTPS / PostgreSQL", "status": "HEALTHY", "risk_score": 19.0, "metrics": "CPU: 22% • RAM: 4.8GB", "cve": "N/A", "threat": "Encrypted DB"}
        ]
    }
]

HOSPITAL_ZONES = [
    {
        "zone_name": "ICU Care Zone",
        "description": "Critical life-support, bedside vital sign monitors, and infusion pumps",
        "assets": [
            {"id": "HOSP-ICU-01", "name": "ICU Vital Signs Patient Monitor #01", "type": "Medical Device", "ip": "172.16.50.12", "protocol": "HL7 / MLLP (Port 2575)", "status": "HEALTHY", "risk_score": 16.0, "metrics": "HR: 74 bpm • SpO2: 99%", "cve": "N/A", "threat": "Patient Monitored"},
            {"id": "HOSP-INF-02", "name": "Smart Infusion Pump Controller #03", "type": "Medical Device", "ip": "172.16.50.25", "protocol": "Wireless HL7 / Proprietary", "status": "HEALTHY", "risk_score": 22.0, "metrics": "Dose Rate: 12 mL/h • Status: RUN", "cve": "CVE-2021-38399", "threat": "Logic Verified"},
            {"id": "HOSP-VENT-03", "name": "Bedside Ventilator Relay Node", "type": "Life Support", "ip": "172.16.50.33", "protocol": "Serial-to-Ethernet HL7", "status": "HEALTHY", "risk_score": 18.0, "metrics": "Resp Rate: 16 • PEEP: 5 cmH2O", "cve": "N/A", "threat": "Normal Rhythm"}
        ]
    },
    {
        "zone_name": "EHR & Clinical Records",
        "description": "Electronic Health Record application servers and doctor portals",
        "assets": [
            {"id": "HOSP-EHR-01", "name": "EHR Epic/Cerner Application Server", "type": "Clinical App", "ip": "172.16.10.80", "protocol": "HTTPS (Port 443)", "status": "HEALTHY", "risk_score": 25.0, "metrics": "Active Doctors: 64 • Sessions: 120", "cve": "N/A", "threat": "MFA Enforced"},
            {"id": "HOSP-DOC-02", "name": "Physician Clinical Portal Workstation", "type": "Workstation", "ip": "172.16.10.114", "protocol": "RDP / TLS (Port 3389)", "status": "HEALTHY", "risk_score": 20.0, "metrics": "Auth: Kerberos • Uptime: 14h", "cve": "N/A", "threat": "EDR Active"}
        ]
    },
    {
        "zone_name": "Patient Database",
        "description": "Encrypted patient records, PHI vaults, and audit storage",
        "assets": [
            {"id": "HOSP-PDB-01", "name": "Patient Database Vault", "type": "Database", "ip": "172.16.10.95", "protocol": "PostgreSQL (Port 5432)", "status": "HEALTHY", "risk_score": 28.0, "metrics": "Records: 384,000 • Query Latency: 4ms", "cve": "CVE-2023-2454", "threat": "AES-256 Encrypted"}
        ]
    },
    {
        "zone_name": "Pharmacy & Lab",
        "description": "Automated medication dispensing cabinets and pathology lab LIS",
        "assets": [
            {"id": "HOSP-PHARM-01", "name": "Automated Pharmacy Dispensing Unit", "type": "Pharmacy System", "ip": "172.16.20.40", "protocol": "HL7 / TCP (Port 8080)", "status": "HEALTHY", "risk_score": 19.0, "metrics": "Dispense Queue: 18 • Errors: 0", "cve": "N/A", "threat": "Barcode Verified"},
            {"id": "HOSP-LAB-02", "name": "Pathology LIS Analyzer Gateway", "type": "Lab System", "ip": "172.16.20.72", "protocol": "ASTM E1394 / TCP", "status": "HEALTHY", "risk_score": 17.0, "metrics": "Samples Processed: 420", "cve": "N/A", "threat": "Normal Throughput"}
        ]
    },
    {
        "zone_name": "Radiology & PACS",
        "description": "Digital medical imaging repositories and DICOM workstations",
        "assets": [
            {"id": "HOSP-PACS-01", "name": "PACS Radiology Imaging Server", "type": "Imaging Server", "ip": "172.16.30.15", "protocol": "DICOM (Port 104) / HTTPS", "status": "HEALTHY", "risk_score": 26.0, "metrics": "Scans Archived: 1.2M • Free: 8.4TB", "cve": "CVE-2021-44228", "threat": "DICOM Enforced"},
            {"id": "HOSP-CT-02", "name": "CT/MRI Imaging Console Workstation", "type": "Imaging Console", "ip": "172.16.30.28", "protocol": "DICOM / SMB (Port 445)", "status": "HEALTHY", "risk_score": 24.0, "metrics": "Active Series: 4 • Temp: 41°C", "cve": "N/A", "threat": "Isolated VLAN"}
        ]
    },
    {
        "zone_name": "Hospital Network DMZ",
        "description": "Perimeter firewalls, VLAN switches, and guest/staff Wi-Fi",
        "assets": [
            {"id": "HOSP-FW-01", "name": "Hospital Core Perimeter Firewall", "type": "Firewall", "ip": "172.16.0.1", "protocol": "HTTPS / SSH", "status": "HEALTHY", "risk_score": 18.0, "metrics": "Blocked/hr: 1,420 • IPS: ACTIVE", "cve": "N/A", "threat": "Zero Trust Gateway"},
            {"id": "HOSP-WIFI-02", "name": "Hospital Wi-Fi Access Controller", "type": "Wireless AP", "ip": "172.16.0.50", "protocol": "WPA3 Enterprise / RADIUS", "status": "HEALTHY", "risk_score": 21.0, "metrics": "Connected Clients: 620", "cve": "N/A", "threat": "VLAN Segregated"}
        ]
    }
]

EDUCATION_ZONES = [
    {
        "zone_name": "Administration",
        "description": "University administrative, student finance, and registrar systems",
        "assets": [
            {"id": "EDU-ADM-01", "name": "University Administration & Finance Server", "type": "Admin Server", "ip": "10.20.1.15", "protocol": "HTTPS / Oracle DB", "status": "HEALTHY", "risk_score": 21.0, "metrics": "Pending Transactions: 45", "cve": "N/A", "threat": "Access Controlled"},
            {"id": "EDU-REG-02", "name": "Academic Registrar Records Vault", "type": "Records Vault", "ip": "10.20.1.28", "protocol": "HTTPS / SQL (Port 1433)", "status": "HEALTHY", "risk_score": 25.0, "metrics": "Active Transcripts: 18,400", "cve": "CVE-2023-38035", "threat": "Integrity Locked"}
        ]
    },
    {
        "zone_name": "Computer Lab Subnet",
        "description": "Engineering computer laboratories and high-performance computing",
        "assets": [
            {"id": "EDU-LAB-01", "name": "Computer Lab Systems Subnet (10.20.10.0/24)", "type": "Lab Terminals", "ip": "10.20.10.50", "protocol": "SSH / RDP / SMB", "status": "HEALTHY", "risk_score": 28.0, "metrics": "Active Terminals: 85 / 100", "cve": "CVE-2022-26134", "threat": "DeepFreeze Active"},
            {"id": "EDU-HPC-02", "name": "AI & HPC Research Compute Cluster", "type": "Compute Cluster", "ip": "10.20.10.90", "protocol": "Slurm / SSH (Port 22)", "status": "HEALTHY", "risk_score": 22.0, "metrics": "GPU Utilization: 78% • 8x H100", "cve": "N/A", "threat": "Key-based Auth"}
        ]
    },
    {
        "zone_name": "LMS E-Learning",
        "description": "Moodle / Canvas courseware, video streaming, and online exam servers",
        "assets": [
            {"id": "EDU-LMS-01", "name": "LMS Production Exam Server", "type": "Learning Management", "ip": "10.20.2.10", "protocol": "HTTPS (Port 443)", "status": "HEALTHY", "risk_score": 24.0, "metrics": "Concurrent Students: 3,200", "cve": "CVE-2023-28121", "threat": "DDoS Shield Active"},
            {"id": "EDU-STREAM-02", "name": "Virtual Classroom Media Gateway", "type": "Media Server", "ip": "10.20.2.35", "protocol": "WebRTC / HTTPS", "status": "HEALTHY", "risk_score": 15.0, "metrics": "Live Streams: 28 • Bandwidth: 1.2 Gbps", "cve": "N/A", "threat": "CDN Cached"}
        ]
    },
    {
        "zone_name": "Student Portal",
        "description": "Public-facing course registration, fee payment, and campus app gateway",
        "assets": [
            {"id": "EDU-PORT-01", "name": "Central Student Portal", "type": "Web Portal", "ip": "10.20.3.5", "protocol": "HTTPS (Port 443)", "status": "HEALTHY", "risk_score": 22.0, "metrics": "Daily Hits: 65,000 • Latency: 45ms", "cve": "N/A", "threat": "WAF Enforced"},
            {"id": "EDU-DB-02", "name": "Campus Student Database", "type": "Database", "ip": "10.20.3.50", "protocol": "PostgreSQL (Port 5432)", "status": "HEALTHY", "risk_score": 26.0, "metrics": "Student Records: 24,500", "cve": "CVE-2023-5869", "threat": "Read-Replica Active"}
        ]
    },
    {
        "zone_name": "Library Archive",
        "description": "Digital research papers, institutional repository, and RFID catalog",
        "assets": [
            {"id": "EDU-LIB-01", "name": "Digital Library Repository Server", "type": "Archive", "ip": "10.20.4.12", "protocol": "HTTPS / Solr", "status": "HEALTHY", "risk_score": 14.0, "metrics": "Indexed Theses: 140,000", "cve": "N/A", "threat": "Read-Only"}
        ]
    },
    {
        "zone_name": "Campus Network",
        "description": "University border gateway, RADIUS auth, and campus Wi-Fi infrastructure",
        "assets": [
            {"id": "EDU-RAD-01", "name": "Central Authentication / RADIUS Server", "type": "Auth Server", "ip": "10.20.0.10", "protocol": "RADIUS / LDAP (Port 389/636)", "status": "HEALTHY", "risk_score": 20.0, "metrics": "Auth Requests/min: 840", "cve": "CVE-2022-37966", "threat": "TLS LDAP Active"},
            {"id": "EDU-WIFI-02", "name": "Campus-Wide Wi-Fi Controller (WLC-01)", "type": "Wireless Controller", "ip": "10.20.0.25", "protocol": "CAPWAP / HTTPS", "status": "HEALTHY", "risk_score": 18.0, "metrics": "Active APs: 240 • Users: 8,400", "cve": "N/A", "threat": "802.1X Active"},
            {"id": "EDU-GW-03", "name": "University Border Gateway Router", "type": "Perimeter Router", "ip": "10.20.0.1", "protocol": "BGP / OSPF / SSH", "status": "HEALTHY", "risk_score": 19.0, "metrics": "Throughput: 8.8 Gbps • Drops: 0.01%", "cve": "N/A", "threat": "ACL Ingress Enforced"}
        ]
    }
]

# -------------------------------------------------------------------
# Sector Attack Scenarios
# -------------------------------------------------------------------

AGRICULTURE_ATTACKS = [
    {
        "event": "Unauthorized Command Detected",
        "threat_type": "Unauthorized Modbus/TCP Coil Write",
        "target_asset_id": "AG-IRR-04",
        "target_asset_name": "Irrigation Controller #04",
        "severity": "CRITICAL",
        "risk_score": 91.0,
        "mitre_id": "T0855",
        "tactic": "Impair Process Control",
        "description": "Unauthenticated Modbus coil write override targeting Irrigation Controller #04 attempting forced valve actuation beyond pressure limits.",
        "detected_activity": "Coil force command (function code 0x05) initiated from unauthorized external IP 185.220.101.44 over port 502.",
        "recommended_action": "Investigate and isolate the affected irrigation controller. Block source IP on edge firewall and verify Modbus master whitelist."
    },
    {
        "event": "MQTT Authentication Bypass Attempt",
        "threat_type": "Credential Stuffing on IoT Broker",
        "target_asset_id": "AG-MQTT-01",
        "target_asset_name": "Agricultural MQTT Broker",
        "severity": "HIGH",
        "risk_score": 74.0,
        "mitre_id": "T1110",
        "tactic": "Credential Access",
        "description": "High-frequency failed authentication attempts detected against agricultural MQTT broker targeting telemetry topics.",
        "detected_activity": "500+ unauthenticated CONNECT packets per minute detected originating from suspicious subnet 198.51.100.0/24.",
        "recommended_action": "Enforce mTLS client certificates, revoke compromised broker credentials, and rate-limit Port 8883."
    },
    {
        "event": "Compromised Soil Sensor Telemetry Anomaly",
        "threat_type": "Sensor Data Spoofing / Tampering",
        "target_asset_id": "AG-SOIL-01",
        "target_asset_name": "Soil Moisture Sensor #01",
        "severity": "MEDIUM",
        "risk_score": 48.0,
        "mitre_id": "T0831",
        "tactic": "Manipulation of Control",
        "description": "Sudden anomalous telemetry jump detected on Soil Moisture Sensor #01 inconsistent with adjacent sensor nodes.",
        "detected_activity": "Anomalous analog values broadcast indicating 100% moisture saturation despite 0mm rainfall.",
        "recommended_action": "Recalibrate sensor node, verify firmware signature over-the-air, and quarantine LoRaWAN session key."
    },
    {
        "event": "Farm Gateway Unauthorized Access",
        "threat_type": "Brute-Force SSH Attack on Gateway",
        "target_asset_id": "AG-GW-01",
        "target_asset_name": "Farm Edge Gateway Node",
        "severity": "HIGH",
        "risk_score": 68.0,
        "mitre_id": "T1078",
        "tactic": "Initial Access",
        "description": "Rapid sequential SSH credential stuffing targeting root user on Farm Edge Gateway Node.",
        "detected_activity": "Multiple failed SSH handshakes from external WAN IP 94.102.61.18.",
        "recommended_action": "Disable password authentication on gateway SSH, restrict management access to VPN, and enforce fail2ban."
    }
]

HOSPITAL_ATTACKS = [
    {
        "event": "Patient Database Unauthorized Access",
        "threat_type": "Unauthorized PHI Data Extraction",
        "target_asset_id": "HOSP-PDB-01",
        "target_asset_name": "Patient Database Vault",
        "severity": "CRITICAL",
        "risk_score": 94.0,
        "mitre_id": "T1005",
        "tactic": "Collection / Exfiltration",
        "description": "Multiple unauthorized bulk SQL queries detected targeting patient health record tables containing confidential PHI.",
        "detected_activity": "Mass SELECT statement execution originating from compromised internal workstation bypassing application tiers.",
        "recommended_action": "Investigate the affected system and isolate it immediately. Terminate active database sessions, rotate service keys, and alert HIPAA compliance officer."
    },
    {
        "event": "Ransomware Binary Beaconing",
        "threat_type": "Ransomware Pre-Execution C2 Beacon",
        "target_asset_id": "HOSP-PACS-01",
        "target_asset_name": "PACS Radiology Imaging Server",
        "severity": "CRITICAL",
        "risk_score": 96.0,
        "mitre_id": "T1486",
        "tactic": "Impact",
        "description": "Outbound encrypted command-and-control beaconing detected on PACS imaging workstation attempting file header enumeration.",
        "detected_activity": "Periodic HTTPS handshakes to known malicious C2 IP 45.142.214.12 and high-frequency DICOM file renames.",
        "recommended_action": "Immediately disconnect PACS server from core hospital switch. Initiate emergency backup snapshot verification and deploy EDR containment."
    },
    {
        "event": "ICU Infusion Pump Command Tampering",
        "threat_type": "Medical Device Protocol Override",
        "target_asset_id": "HOSP-INF-02",
        "target_asset_name": "Smart Infusion Pump Controller #03",
        "severity": "CRITICAL",
        "risk_score": 89.0,
        "mitre_id": "T0855",
        "tactic": "Impair Process Control",
        "description": "Unauthorized command packets intercepted attempting to alter dosage infusion limits on ICU Smart Infusion Pump.",
        "detected_activity": "Malformed proprietary payload detected over wireless medical telemetry VLAN targeting infusion pump rate registers.",
        "recommended_action": "Switch affected infusion unit to manual clinical bypass immediately. Lock down wireless medical VLAN and inspect AP logs."
    },
    {
        "event": "EHR Portal Brute-Force Login Spikes",
        "threat_type": "Credential Stuffing Attack",
        "target_asset_id": "HOSP-EHR-01",
        "target_asset_name": "EHR Epic/Cerner Application Server",
        "severity": "HIGH",
        "risk_score": 64.0,
        "mitre_id": "T1110",
        "tactic": "Credential Access",
        "description": "Distributed dictionary attack against physician login portal attempting account takeover.",
        "detected_activity": "Over 80 failed logins per minute across 12 doctor usernames from rotating proxy addresses.",
        "recommended_action": "Enforce adaptive biometric MFA, temporarily lock targeted doctor accounts, and challenge IP range with CAPTCHA."
    },
    {
        "event": "Hospital Wi-Fi Rogue Access Point",
        "threat_type": "Evil Twin / Rogue AP Detection",
        "target_asset_id": "HOSP-WIFI-02",
        "target_asset_name": "Hospital Wi-Fi Access Controller",
        "severity": "MEDIUM",
        "risk_score": 45.0,
        "mitre_id": "T1200",
        "tactic": "Initial Access",
        "description": "Rogue SSID broadcasting identical Hospital_Staff network with unauthorized BSSID in visitor reception lounge.",
        "detected_activity": "Deauthentication frames injected targeting connected clinical tablets.",
        "recommended_action": "Enable Wireless Intrusion Prevention (WIPS) containment, send security team to locate rogue device, and warn staff."
    }
]

EDUCATION_ATTACKS = [
    {
        "event": "Unauthorized Student Database Access",
        "threat_type": "Database Grade Manipulation Exploit",
        "target_asset_id": "EDU-DB-02",
        "target_asset_name": "Campus Student Database",
        "severity": "CRITICAL",
        "risk_score": 88.0,
        "mitre_id": "T1190",
        "tactic": "Initial Access",
        "description": "SQL injection vulnerability exploited in course registration portal attempting unauthorized write modifications to student grade records.",
        "detected_activity": "UNION SELECT and UPDATE statements executed targeting registrar tables from student lab subnet.",
        "recommended_action": "Immediately revoke web application database write permissions. Revert unauthorized grade changes via audit logs and patch parameterized query."
    },
    {
        "event": "DDoS Flooding on LMS Exam Server",
        "threat_type": "Distributed Denial of Service",
        "target_asset_id": "EDU-LMS-01",
        "target_asset_name": "LMS Production Exam Server",
        "severity": "CRITICAL",
        "risk_score": 84.0,
        "mitre_id": "T1498",
        "tactic": "Impact",
        "description": "Massive volumetric SYN-flood targeting LMS exam portal during scheduled university midterm examinations.",
        "detected_activity": "Inbound traffic surge exceeding 6.5 Gbps with 400,000 HTTP requests/sec overloading web workers.",
        "recommended_action": "Activate upstream Cloudflare / BGP scrub center. Divert student traffic through rate-limiting reverse proxy."
    },
    {
        "event": "Campus RADIUS Brute-Force Login",
        "threat_type": "Credential Stuffing on Central LDAP",
        "target_asset_id": "EDU-RAD-01",
        "target_asset_name": "Central Authentication / RADIUS Server",
        "severity": "HIGH",
        "risk_score": 71.0,
        "mitre_id": "T1110",
        "tactic": "Credential Access",
        "description": "Automated brute-force password spraying targeting administrative active directory accounts.",
        "detected_activity": "Repeated Kerberos pre-authentication errors detected from student lab terminal IP 10.20.10.65.",
        "recommended_action": "Lock targeted accounts, isolate source lab terminal, and enforce university-wide Duo Security MFA."
    },
    {
        "event": "Malware Outbreak in Computer Lab",
        "threat_type": "Lateral SMB Worm Propagation",
        "target_asset_id": "EDU-LAB-01",
        "target_asset_name": "Computer Lab Systems Subnet",
        "severity": "HIGH",
        "risk_score": 78.0,
        "mitre_id": "T1021",
        "tactic": "Lateral Movement",
        "description": "Automated worm attempting lateral movement across engineering lab computers via SMB vulnerability (Port 445).",
        "detected_activity": "Port 445 connection flood across 10.20.10.0/24 subnet initiated from infected student USB flash drive.",
        "recommended_action": "Isolate the computer lab VLAN at core switch. Trigger centralized EDR disk scan and re-image affected machines."
    },
    {
        "event": "Student Portal Cross-Site Scripting",
        "threat_type": "Stored XSS in Course Feedback",
        "target_asset_id": "EDU-PORT-01",
        "target_asset_name": "Central Student Portal",
        "severity": "MEDIUM",
        "risk_score": 52.0,
        "mitre_id": "T1059",
        "tactic": "Execution",
        "description": "Malicious JavaScript payload injected into student course review comment field attempting session token theft.",
        "detected_activity": "Unsanitized script tag detected in POST payload targeting /api/feedback endpoint.",
        "recommended_action": "Sanitize input field, deploy Content Security Policy (CSP) headers, and invalidate compromised session tokens."
    }
]

# -------------------------------------------------------------------
# Sector Monitoring Engine (Autonomous Background Simulation)
# -------------------------------------------------------------------

class SectorMonitoringEngine:
    """
    Continuous background cybersecurity simulation and monitoring engine
    for Agriculture, Hospital, Education (and unified Power Grid status).
    Automatically evaluates risk, triggers instant alerts, updates heatmaps,
    persists events to SQLite, and dispatches automated emails to akshayjoji0@gmail.com.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(SectorMonitoringEngine, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self, app=None):
        if self._initialized:
            return
        self.app = app
        self.email_notifier = EmailNotifier()
        
        # Deep copy base zones for dynamic runtime updates
        import copy
        self.agriculture_zones = copy.deepcopy(AGRICULTURE_ZONES)
        self.hospital_zones = copy.deepcopy(HOSPITAL_ZONES)
        self.education_zones = copy.deepcopy(EDUCATION_ZONES)
        
        # In-memory incident queues
        self.active_incidents = {
            "agriculture": None,
            "hospital": None,
            "education": None
        }
        self.recent_alerts = []
        self.active_banner_alert = None
        
        # Alert deduplication and cooldown: (sector, asset, event) -> timestamp
        self.alert_cooldowns = {}
        self.cooldown_period_seconds = 90
        self.last_email_sent_at = 0
        self.min_email_interval_seconds = 15
        
        # Monitoring thread
        self.running = False
        self.thread = None
        self._initialized = True

    def start_background_monitoring(self, app=None):
        if app:
            self.app = app
        if self.running:
            return
        self.running = True
        self.thread = threading.Thread(target=self._monitoring_loop, daemon=True)
        self.thread.start()
        print("[SectorMonitoringEngine] Multi-Sector Autonomous Monitoring Thread started successfully.")

    def _monitoring_loop(self):
        """
        Runs continuously in the background every 8-12 seconds.
        Dynamically updates telemetry and triggers stochastic cyber security events.
        """
        step = 0
        while self.running:
            try:
                time.sleep(8)
                step += 1
                
                # 1. Fluctuate Normal Telemetry
                self._update_live_telemetry()

                # 2. Every 2-3 cycles (~16-24s), simulate an incident in one of the new sectors
                if step % 2 == 0:
                    sector_choice = random.choice(["hospital", "agriculture", "education"])
                    if sector_choice == "hospital":
                        scenario = random.choice(HOSPITAL_ATTACKS)
                        self.process_security_event("Hospital", scenario)
                    elif sector_choice == "agriculture":
                        scenario = random.choice(AGRICULTURE_ATTACKS)
                        self.process_security_event("Agriculture", scenario)
                    elif sector_choice == "education":
                        scenario = random.choice(EDUCATION_ATTACKS)
                        self.process_security_event("Education", scenario)

            except Exception as e:
                print(f"[SectorMonitoringEngine] Error in monitoring loop: {e}")

    def _update_live_telemetry(self):
        """Fluctuates normal metrics on assets so numbers look alive and realistic."""
        for zone in self.agriculture_zones:
            for asset in zone["assets"]:
                if asset["status"] == "HEALTHY":
                    # Random minor telemetry drift
                    if "Moisture" in asset["metrics"]:
                        val = random.randint(34, 44)
                        asset["metrics"] = f"Moisture: {val}% • Temp: {round(random.uniform(26.5, 29.8), 1)}°C"
                    elif "Flow" in asset["metrics"]:
                        val = random.randint(118, 142)
                        asset["metrics"] = f"Flow: {val} L/min • Pressure: {round(random.uniform(3.0, 3.4), 1)} bar"

        for zone in self.hospital_zones:
            for asset in zone["assets"]:
                if asset["status"] == "HEALTHY":
                    if "HR:" in asset["metrics"]:
                        hr = random.randint(68, 82)
                        spo2 = random.randint(98, 100)
                        asset["metrics"] = f"HR: {hr} bpm • SpO2: {spo2}%"
                    elif "Doctors:" in asset["metrics"]:
                        docs = random.randint(58, 72)
                        asset["metrics"] = f"Active Doctors: {docs} • Sessions: {docs * 2}"

        for zone in self.education_zones:
            for asset in zone["assets"]:
                if asset["status"] == "HEALTHY":
                    if "Concurrent Students:" in asset["metrics"]:
                        st = random.randint(3100, 3450)
                        asset["metrics"] = f"Concurrent Students: {st:,}"
                    elif "Throughput:" in asset["metrics"]:
                        tp = round(random.uniform(8.2, 9.4), 1)
                        asset["metrics"] = f"Throughput: {tp} Gbps • Drops: 0.01%"

    def process_security_event(self, sector_name, scenario, force_email=False):
        """
        Core event handler:
        - Evaluates risk
        - Updates asset & zone status
        - Emits live screen alert
        - Dispatches automated email if HIGH/CRITICAL (with cooldown)
        - Persists to DB
        """
        sector_key = sector_name.lower().replace(" ", "")
        asset_id = scenario.get("target_asset_id")
        asset_name = scenario.get("target_asset_name")
        event_name = scenario.get("event")
        severity = scenario.get("severity", "HIGH").upper()
        risk_score = float(scenario.get("risk_score", 75.0))
        now = datetime.utcnow()
        timestamp_str = now.strftime("%d %B %Y, %I:%M %p")

        incident_id = f"INC-{sector_key.upper()[:3]}-{now.strftime('%y%m%d')}-{random.randint(1000, 9999)}"

        event_payload = {
            "incident_id": incident_id,
            "sector": sector_name,
            "sector_key": sector_key,
            "asset": asset_name,
            "asset_id": asset_id,
            "event": event_name,
            "threat_type": scenario.get("threat_type", event_name),
            "severity": severity,
            "risk_score": risk_score,
            "timestamp": timestamp_str,
            "timestamp_iso": now.isoformat(),
            "mitre_id": scenario.get("mitre_id", "T1000"),
            "mitre_tactic": scenario.get("tactic", "Exploitation"),
            "description": scenario.get("description", "Security event detected."),
            "detected_activity": scenario.get("detected_activity", scenario.get("description", "")),
            "recommended_action": scenario.get("recommended_action", "Investigate and isolate the affected asset."),
            "alert_status": "ACTIVE",
            "email_sent": False
        }


        # 1. Update Asset in Sector Heatmap
        zones_map = {
            "agriculture": self.agriculture_zones,
            "hospital": self.hospital_zones,
            "education": self.education_zones
        }

        target_zones = zones_map.get(sector_key)
        if target_zones:
            # Reset previous criticals slightly or set the specific target asset
            for zone in target_zones:
                for a in zone["assets"]:
                    if a["id"] == asset_id:
                        a["status"] = severity
                        a["risk_score"] = risk_score
                        a["threat"] = event_name
                    elif a["status"] in ["CRITICAL", "HIGH"] and random.random() < 0.35:
                        # Gradual auto-recovery of older incidents
                        a["status"] = "WARNING" if severity == "CRITICAL" else "HEALTHY"
                        a["risk_score"] = 25.0
                        a["threat"] = "Recovered / Monitored"

        # 2. Update In-Memory Active Incident for this sector
        self.active_incidents[sector_key] = event_payload

        # 3. Add to Recent Alerts list (keep latest 30)
        self.recent_alerts.insert(0, event_payload)
        self.recent_alerts = self.recent_alerts[:30]

        # 4. If HIGH or CRITICAL: Set Global Banner Alert
        if severity in ["HIGH", "CRITICAL"]:
            self.active_banner_alert = event_payload

            # 5. Check Cooldown & Dispatch Automated Email
            dedup_key = (sector_name, asset_name, event_name)
            last_alert_time = self.alert_cooldowns.get(dedup_key, 0)
            time_since_last = time.time() - last_alert_time
            time_since_last_email = time.time() - self.last_email_sent_at

            should_email = force_email or (
                time_since_last >= self.cooldown_period_seconds and
                time_since_last_email >= self.min_email_interval_seconds
            )

            if should_email:
                self.alert_cooldowns[dedup_key] = time.time()
                self.last_email_sent_at = time.time()
                success, msg = self.email_notifier.send_sector_alert_email(event_payload)
                event_payload["email_sent"] = success
                print(f"[SectorMonitoringEngine] Automated Email Triggered for [{severity}] {sector_name}: {msg}")
            else:
                event_payload["email_sent"] = True  # suppressed by cooldown
                print(f"[SectorMonitoringEngine] Email cooldown active for {dedup_key}. Screen alert and DB updated.")

        # 6. Persist to Database if Flask App Context available
        self._persist_event_to_db(event_payload)

        return event_payload

    def _persist_event_to_db(self, event_payload):
        """Persists security event into SQLite sector_security_events table."""
        if not self.app:
            return
        try:
            with self.app.app_context():
                from models import db, SectorSecurityEvent
                import json
                record = SectorSecurityEvent(
                    incident_id=event_payload["incident_id"],
                    sector=event_payload["sector"],
                    asset=event_payload["asset"],
                    event=event_payload["event"],
                    severity=event_payload["severity"],
                    risk_score=event_payload["risk_score"],
                    description=event_payload["description"],
                    detected_activity=event_payload["detected_activity"],
                    recommended_action=event_payload["recommended_action"],
                    alert_status=event_payload["alert_status"],
                    email_sent=event_payload.get("email_sent", False),
                    details_json=json.dumps(event_payload)
                )
                db.session.add(record)
                db.session.commit()
        except Exception as e:
            # Non-fatal if DB is temporarily locked or in-memory
            print(f"[SectorMonitoringEngine] Note: DB persistence: {e}")

    def get_sectors_overview(self):
        """Returns unified high-level health and risk status of all 4 sectors."""
        # Calculate summary for each sector
        def calc_sector_health(zones):
            all_assets = [a for z in zones for a in z["assets"]]
            crit = len([a for a in all_assets if a["status"] == "CRITICAL"])
            high = len([a for a in all_assets if a["status"] == "HIGH"])
            warn = len([a for a in all_assets if a["status"] == "WARNING"])
            
            if crit > 0:
                status = "CRITICAL"
                badge = "CRITICAL"
                color = "red"
            elif high > 0:
                status = "HIGH"
                badge = "HIGH RISK"
                color = "orange"
            elif warn > 0:
                status = "WARNING"
                badge = "WARNING"
                color = "yellow"
            else:
                status = "NORMAL"
                badge = "NORMAL"
                color = "emerald"

            max_risk = max([a.get("risk_score", 10.0) for a in all_assets]) if all_assets else 12.0
            avg_risk = round(sum([a.get("risk_score", 10.0) for a in all_assets]) / len(all_assets), 1) if all_assets else 12.0

            return {
                "status": status,
                "badge": badge,
                "color": color,
                "total_assets": len(all_assets),
                "critical_count": crit,
                "high_count": high,
                "warning_count": warn,
                "max_risk_score": max_risk,
                "avg_risk_score": avg_risk
            }

        ag_health = calc_sector_health(self.agriculture_zones)
        hosp_health = calc_sector_health(self.hospital_zones)
        edu_health = calc_sector_health(self.education_zones)

        # For power grid, fetch or default to normal/critical based on live state
        powergrid_status = {
            "sector_name": "Power Grid",
            "sector_key": "powergrid",
            "icon": "Zap",
            "status": "NORMAL",
            "badge": "NORMAL",
            "color": "emerald",
            "total_assets": 252,
            "active_threat": "Substation SCADA Monitoring Active"
        }

        return {
            "sectors": [
                {
                    "sector_name": "Power Grid",
                    "sector_key": "powergrid",
                    "icon": "Zap",
                    "title": "⚡ Kerala Power Grid / SCADA",
                    "status": powergrid_status["status"],
                    "badge": powergrid_status["badge"],
                    "color": powergrid_status["color"],
                    "total_assets": 252,
                    "monitored_subnets": "14 Kerala Districts",
                    "active_incident": None
                },
                {
                    "sector_name": "Smart Agriculture",
                    "sector_key": "agriculture",
                    "icon": "Wheat",
                    "title": "🌾 Smart Agriculture & IoT",
                    "status": ag_health["status"],
                    "badge": ag_health["badge"],
                    "color": ag_health["color"],
                    "total_assets": ag_health["total_assets"],
                    "critical_count": ag_health["critical_count"],
                    "high_count": ag_health["high_count"],
                    "avg_risk_score": ag_health["avg_risk_score"],
                    "active_incident": self.active_incidents.get("agriculture")
                },
                {
                    "sector_name": "Hospital",
                    "sector_key": "hospital",
                    "icon": "Building2",
                    "title": "🏥 Hospital & Medical Infrastructure",
                    "status": hosp_health["status"],
                    "badge": hosp_health["badge"],
                    "color": hosp_health["color"],
                    "total_assets": hosp_health["total_assets"],
                    "critical_count": hosp_health["critical_count"],
                    "high_count": hosp_health["high_count"],
                    "avg_risk_score": hosp_health["avg_risk_score"],
                    "active_incident": self.active_incidents.get("hospital")
                },
                {
                    "sector_name": "Education",
                    "sector_key": "education",
                    "icon": "GraduationCap",
                    "title": "🏫 Educational Institution",
                    "status": edu_health["status"],
                    "badge": edu_health["badge"],
                    "color": edu_health["color"],
                    "total_assets": edu_health["total_assets"],
                    "critical_count": edu_health["critical_count"],
                    "high_count": edu_health["high_count"],
                    "avg_risk_score": edu_health["avg_risk_score"],
                    "active_incident": self.active_incidents.get("education")
                }
            ],
            "active_banner_alert": self.active_banner_alert,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        }

    def get_sector_data(self, sector_key):
        """Returns assets, zones, telemetry, and active incident for a specific sector."""
        sector_key = sector_key.lower().replace(" ", "").replace("-", "")
        if sector_key == "agriculture":
            return {
                "sector": "Smart Agriculture",
                "sector_key": "agriculture",
                "zones": self.agriculture_zones,
                "active_incident": self.active_incidents.get("agriculture") or AGRICULTURE_ATTACKS[0],
                "telemetry_metrics": {
                    "soil_zones_active": 4,
                    "pump_controllers": 4,
                    "iot_gateway_health": "99.8%",
                    "overall_risk_score": 18.2
                }
            }
        elif sector_key == "hospital":
            return {
                "sector": "Hospital",
                "sector_key": "hospital",
                "zones": self.hospital_zones,
                "active_incident": self.active_incidents.get("hospital") or HOSPITAL_ATTACKS[0],
                "telemetry_metrics": {
                    "icu_monitors_online": 12,
                    "ehr_query_throughput": "840 req/min",
                    "radiology_pacs_status": "NORMAL",
                    "overall_risk_score": 22.5
                }
            }
        elif sector_key == "education":
            return {
                "sector": "Education",
                "sector_key": "education",
                "zones": self.education_zones,
                "active_incident": self.active_incidents.get("education") or EDUCATION_ATTACKS[0],
                "telemetry_metrics": {
                    "concurrent_lms_users": 3420,
                    "campus_wifi_clients": 8400,
                    "firewall_drop_rate": "0.01%",
                    "overall_risk_score": 21.0
                }
            }
        else:
            return {"error": f"Sector '{sector_key}' not recognized"}, 404

    def get_heatmap_data(self):
        """Returns risk heatmap for all new sectors."""
        return {
            "agriculture": self.agriculture_zones,
            "hospital": self.hospital_zones,
            "education": self.education_zones
        }

    def get_alerts(self):
        """Returns live active alerts and banner."""
        return {
            "active_banner_alert": self.active_banner_alert,
            "recent_alerts": self.recent_alerts
        }

    def dismiss_banner_alert(self):
        self.active_banner_alert = None
        return {"status": "dismissed"}

    def trigger_test_event(self, sector_name, severity="CRITICAL", event_index=0):
        """Helper to test Normal, Medium, High, and Critical events on demand."""
        sector_key = sector_name.lower().replace(" ", "")
        pool_map = {
            "agriculture": AGRICULTURE_ATTACKS,
            "hospital": HOSPITAL_ATTACKS,
            "education": EDUCATION_ATTACKS
        }
        pool = pool_map.get(sector_key, HOSPITAL_ATTACKS)
        
        # Pick or create scenario with requested severity
        matching = [s for s in pool if s.get("severity") == severity.upper()]
        scenario = matching[0] if matching else pool[0]
        
        # Override severity & risk score to match test case exactly
        scenario_copy = dict(scenario)
        scenario_copy["severity"] = severity.upper()
        if severity.upper() == "CRITICAL":
            scenario_copy["risk_score"] = 94.0
        elif severity.upper() == "HIGH":
            scenario_copy["risk_score"] = 72.0
        elif severity.upper() == "MEDIUM":
            scenario_copy["risk_score"] = 48.0
        else:
            scenario_copy["risk_score"] = 15.0

        return self.process_security_event(sector_name.title(), scenario_copy, force_email=(severity.upper() in ["HIGH", "CRITICAL"]))


# Global engine singleton
sector_engine = SectorMonitoringEngine()
