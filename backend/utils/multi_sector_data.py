import random
import copy
from datetime import datetime
from utils.kerala_grid_data import generate_250_kerala_grid_assets

# ===================================================================
# 1. MITRE ATT&CK Comprehensive Knowledge Base
# ===================================================================

MITRE_KNOWLEDGE_BASE = {
    "T0859": {
        "id": "T0859",
        "name": "Valid Accounts",
        "tactics": ["Persistence", "Lateral Movement", "Initial Access"],
        "definition": "Adversaries obtain and abuse the credentials of existing legitimate accounts to gain access, bypass access controls, and move laterally across industrial and enterprise systems.",
        "common_example": "An attacker obtains valid administrative credentials for a SCADA engineering station or hospital clinical database and logs in through legitimate remote services without generating initial brute-force alerts.",
        "detection_flow": [
            "Suspicious authenticated access from anomalous IP or off-hours",
            "Credential anomaly (concurrent logins or sudden privilege elevation)",
            "Unauthorized access to sensitive OT/IT controller resources"
        ],
        "affected_sectors": ["Power Grid", "Agriculture", "Hospital", "Education"],
        "why_risky": "Legitimate credentials bypass perimeter firewalls and basic authentication gates, making malicious actions blend in with everyday authorized operational telemetry.",
        "recommended_action": "Enforce hardware-backed Multi-Factor Authentication (MFA), restrict remote management access via bastion jump hosts with session recording, and implement behavioral anomaly detection for all privileged accounts."
    },
    "T0846": {
        "id": "T0846",
        "name": "Remote System Discovery",
        "tactics": ["Discovery"],
        "definition": "Adversaries attempt to identify other systems and controllers on a network to map out the industrial environment, subnets, and critical infrastructure targets.",
        "common_example": "An attacker scans the local subnet using ICMP sweeps, ARP requests, or ping sweeps to discover connected RTUs, PLCs, and campus database servers.",
        "detection_flow": [
            "Sequential IP/port probing on internal subnets",
            "High rate of ARP or ICMP requests from a single endpoint",
            "Asset discovery tool signatures detected by network sensors"
        ],
        "affected_sectors": ["Power Grid", "Agriculture", "Hospital", "Education"],
        "why_risky": "Discovery is the crucial reconnaissance step preceding targeted sabotage or ransomware deployment across interconnected control zones.",
        "recommended_action": "Enforce strict micro-segmentation with zero-trust internal firewalls, disable unnecessary ICMP/broadcast protocols, and monitor for unauthorized ARP/port scanning."
    },
    "T0886": {
        "id": "T0886",
        "name": "Remote Services",
        "tactics": ["Lateral Movement"],
        "definition": "Adversaries leverage legitimate remote communication protocols and services (such as SSH, RDP, VNC, SMB) to log in and control remote systems across the environment.",
        "common_example": "After compromising a perimeter jump host, the adversary uses RDP or SSH with stolen credentials to jump into the hospital PACS archive or substation HMI.",
        "detection_flow": [
            "Unusual internal RDP/SSH sessions between non-administrative subnets",
            "Interactive login during off-shift hours",
            "Execution of lateral administrative utilities"
        ],
        "affected_sectors": ["Power Grid", "Hospital", "Education"],
        "why_risky": "Using native administrative channels avoids deploying custom malware, enabling adversaries to quietly traverse network tiers.",
        "recommended_action": "Disable RDP and SSH on systems where not required; restrict remote administrative access to dedicated management jump-boxes with MFA."
    },
    "T0822": {
        "id": "T0822",
        "name": "External Remote Services",
        "tactics": ["Initial Access", "Persistence"],
        "definition": "Adversaries leverage externally accessible remote services (such as VPNs, Citrix gateways, remote desktops) to establish an initial foothold into the private network.",
        "common_example": "An adversary connects to an unpatched enterprise SSL-VPN gateway or exposed agriculture IoT portal using compromised user credentials.",
        "detection_flow": [
            "Logins from unusual geographical locations or blacklisted IP addresses",
            "Failed login spikes followed by successful session initiation",
            "Split-tunneling or unauthorized port-forwarding over VPN"
        ],
        "affected_sectors": ["Power Grid", "Agriculture", "Hospital", "Education"],
        "why_risky": "Directly links the public internet into internal industrial or healthcare operational networks.",
        "recommended_action": "Mandate phishing-resistant MFA on all external gateways, maintain strict patch cycles on edge firewalls/VPN concentrators, and block logins from untrusted geographic regions."
    },
    "T0813": {
        "id": "T0813",
        "name": "Denial of Control",
        "tactics": ["Impair Process Control"],
        "definition": "Adversaries impair the operator's ability to monitor, command, or safely shut down physical industrial processes, leaving equipment operating blindly or out of control.",
        "common_example": "Flooding a substation RTU communication channel or agriculture pump controller so human operators cannot transmit trip or open breaker commands during an emergency.",
        "detection_flow": [
            "Sudden loss of SCADA telemetry / communication timeout alerts",
            "Protocol buffer saturation or malformed frame bursts",
            "Unresponsive actuator/valve control loops"
        ],
        "affected_sectors": ["Power Grid", "Agriculture"],
        "why_risky": "Loss of control during dynamic physical events can result in severe equipment destruction, regional blackouts, or critical environmental contamination.",
        "recommended_action": "Implement redundant physical out-of-band kill switches, enforce rate-limiting on OT telemetry links, and isolate control loops via unidirectional data diodes."
    },
    "T0809": {
        "id": "T0809",
        "name": "Data Destruction",
        "tactics": ["Impact"],
        "definition": "Adversaries destroy or permanently wipe critical system data, configuration files, PLC ladder logic, or database records to disrupt operations and prevent forensic analysis.",
        "common_example": "An adversary executes an automated wiper script on campus student database servers or hospital EHR backup volumes, wiping system partitions and database tables.",
        "detection_flow": [
            "Mass file deletion or zero-filling commands executed via elevated shell",
            "Unusual disk I/O spikes associated with low-level storage drivers",
            "Corrupted database transaction logs and sudden service crashes"
        ],
        "affected_sectors": ["Hospital", "Education", "Power Grid"],
        "why_risky": "Irreversible loss of institutional records, patient medical histories, or SCADA configuration logic can paralyze operations indefinitely.",
        "recommended_action": "Maintain immutable, air-gapped offsite backups; enforce strict least-privilege permissions on raw storage devices; and deploy filesystem write-protection policies."
    },
    "T0858": {
        "id": "T0858",
        "name": "Change Operating Mode",
        "tactics": ["Execution", "Impair Process Control"],
        "definition": "Adversaries manipulate the physical or software operating mode of a controller (e.g., switching a PLC from RUN to STOP or PROGRAM mode), halting automated safety interlocks.",
        "common_example": "Sending a proprietary Modbus/S7comm command to switch a 220kV substation PLC from 'Remote Run' to 'Halt/Stop', causing safety protection relays to disable.",
        "detection_flow": [
            "Anomalous PLC state transition command logged on control network",
            "Controller mode switch telemetry mismatch with SCADA master",
            "Engineering workstation unauthorized command sequence"
        ],
        "affected_sectors": ["Power Grid", "Agriculture"],
        "why_risky": "Stopping a controller halts real-time monitoring and trip protection, exposing physical electrical or hydraulic machinery to catastrophic overpressure or overload.",
        "recommended_action": "Use physical key switches on PLCs locked in RUN mode to prevent software-initiated mode changes; verify message integrity with authenticated industrial protocols."
    },
    "T0855": {
        "id": "T0855",
        "name": "Unauthorized Command Message",
        "tactics": ["Impair Process Control"],
        "definition": "Adversaries inject unauthorized, malformed, or out-of-sequence industrial protocol messages to actuate field equipment without operator consent.",
        "common_example": "Injecting unauthorized Modbus/TCP coil-force function codes (0x05) to force open circuit breakers or override automated farm irrigation valves.",
        "detection_flow": [
            "Industrial protocol DPI alert: Modbus write function code from unauthorized IP",
            "Telemetry anomaly: sudden actuator state change without corresponding operator event",
            "Sequence number mismatch in IEC 60870-5-104 APDU packets"
        ],
        "affected_sectors": ["Power Grid", "Agriculture"],
        "why_risky": "Directly manipulates physical machinery in the real world, capable of causing electrical faults, localized power outages, or agricultural flooding.",
        "recommended_action": "Enforce strict IP/MAC whitelisting for protocol masters, deploy deep packet inspection (DPI) firewalls with Modbus/IEC-104 read-only enforcement, and isolate safety loops."
    },
    "T1190": {
        "id": "T1190",
        "name": "Exploit Public-Facing Application",
        "tactics": ["Initial Access"],
        "definition": "Adversaries exploit software vulnerabilities (like SQL injection, Log4Shell, or unauthenticated RCE) in internet-facing web portals, portals, or APIs.",
        "common_example": "Exploiting a SQL injection vulnerability in the university student registration portal or hospital public appointment scheduler to extract database credentials.",
        "detection_flow": [
            "WAF rule trigger: SQL injection or RCE payload detected in HTTP request",
            "High rate of error 500 status codes from web application",
            "Spawning of interactive shell processes from web server daemon"
        ],
        "affected_sectors": ["Education", "Hospital", "Power Grid"],
        "why_risky": "Provides remote unauthenticated attackers direct access from the public internet into internal database tiers and application servers.",
        "recommended_action": "Apply immediate security patches, deploy a Web Application Firewall (WAF) with OWASP Core Ruleset, and mandate parameterized database queries."
    },
    "T1110": {
        "id": "T1110",
        "name": "Brute Force",
        "tactics": ["Credential Access"],
        "definition": "Adversaries systematically submit numerous passwords or passphrases with the hope of guessing correctly, targeting LDAP, SSH, MQTT, or RADIUS servers.",
        "common_example": "A password spraying campaign against the campus Active Directory/RADIUS server attempting common passwords across thousands of student and faculty accounts.",
        "detection_flow": [
            "Spike in failed authentication attempts across multiple usernames",
            "Rapid sequential login events from a single external IP address",
            "Account lockout threshold triggers across domain controller logs"
        ],
        "affected_sectors": ["Education", "Hospital", "Agriculture"],
        "why_risky": "Weak or reused user credentials can be discovered rapidly, providing adversaries with entry-level valid accounts.",
        "recommended_action": "Enforce account lockout policies after 5 failed attempts, implement CAPTCHA on login forms, and require strong unique passwords with MFA."
    },
    "T1021": {
        "id": "T1021",
        "name": "Remote Services",
        "tactics": ["Lateral Movement"],
        "definition": "Adversaries use valid credentials to log into remote services such as SSH, RDP, or SMB to expand control across the network.",
        "common_example": "Adversary uses OpenSSH or SMB (Port 445) to move laterally from an infected student lab workstation to departmental faculty file shares.",
        "detection_flow": [
            "Unusual SMB/SSH traffic traversing internal network boundaries",
            "Pass-the-Hash / Kerberos ticket anomalies",
            "Remote execution utilities (PsExec, WMI) detected by EDR"
        ],
        "affected_sectors": ["Education", "Hospital", "Power Grid"],
        "why_risky": "Enables an attacker who compromised a low-security device to compromise high-value enterprise and clinical servers.",
        "recommended_action": "Segment computer labs and guest networks from core servers; block lateral SMB (Port 445) between workstations using host-based firewalls."
    },
    "T1486": {
        "id": "T1486",
        "name": "Data Encrypted for Impact",
        "tactics": ["Impact"],
        "definition": "Adversaries encrypt data on target systems with cryptographic keys held only by the attacker, extorting victims to restore operational continuity (Ransomware).",
        "common_example": "Ransomware deploying AES/RSA encryption across PACS medical imaging archives and ICU workstation file systems, rendering medical records unreadable.",
        "detection_flow": [
            "High frequency of file renaming and extension changes (.locked, .encrypted)",
            "Outbound beaconing to known ransomware Command & Control (C2) servers",
            "Ransom note text files dropped in multiple system directories"
        ],
        "affected_sectors": ["Hospital", "Education", "Power Grid"],
        "why_risky": "In healthcare, ransomware blocks access to vital medical imagery and life-support telemetry, creating life-threatening emergencies.",
        "recommended_action": "Deploy behavioral EDR with automated process containment, isolate critical storage on immutable backups, and train staff against spear-phishing."
    },
    "T1046": {
        "id": "T1046",
        "name": "Network Service Discovery",
        "tactics": ["Discovery"],
        "definition": "Adversaries perform rapid port and service discovery to identify listening network daemons, operating system fingerprints, and vulnerable versions.",
        "common_example": "An attacker runs SYN port scans across 10.EKM.1.0/24 looking for open Modbus (502), DNP3 (20000), IEC-104 (104), and SSH (22) services.",
        "detection_flow": [
            "SYN packets sent across thousands of ports in short duration",
            "Intrusion detection signatures for Nmap / Masscan reconnaissance",
            "Repetitive TCP RST packet generation by firewalls"
        ],
        "affected_sectors": ["Power Grid", "Hospital", "Agriculture", "Education"],
        "why_risky": "Uncovers unmonitored legacy ports and unpatched services for targeted exploitation.",
        "recommended_action": "Deploy Honeypot deception nodes to detect early scanning; configure firewall drop rules for unexpected service probes."
    },
    "T0831": {
        "id": "T0831",
        "name": "Manipulation of Control",
        "tactics": ["Impair Process Control"],
        "definition": "Adversaries manipulate physical control parameters or logic on industrial controllers to push process states outside of safe operating envelopes.",
        "common_example": "Spoofing analog temperature and voltage limits on a high-voltage transformer controller to induce thermal degradation.",
        "detection_flow": [
            "Sudden setpoint deviation beyond defined operational thresholds",
            "Analog measurement disparity across redundant sensor pairs",
            "Controller logic execution mismatch with SCADA historian"
        ],
        "affected_sectors": ["Power Grid", "Agriculture"],
        "why_risky": "May cause physical equipment failure, fires, or prolonged infrastructure outages.",
        "recommended_action": "Implement redundant physical limit sensors and hard-wired interlocks that cannot be overridden by software commands."
    },
    "T1005": {
        "id": "T1005",
        "name": "Data from Local System",
        "tactics": ["Collection"],
        "definition": "Adversaries search local system sources (files, databases, memory) to find sensitive data such as patient records, intellectual property, or cryptographic keys.",
        "common_example": "Executing unauthorized SQL queries against a hospital Patient Database Vault to harvest Protected Health Information (PHI).",
        "detection_flow": [
            "Anomalous bulk SELECT queries executing against confidential tables",
            "Local file reads targeting configuration and password vaults",
            "Database process spawning unexpected outbound network connections"
        ],
        "affected_sectors": ["Hospital", "Education"],
        "why_risky": "Leads to severe data breaches, HIPAA/GDPR regulatory penalties, and patient privacy violations.",
        "recommended_action": "Enforce Transparent Data Encryption (TDE), column-level access controls, and strict database query rate-limiting."
    },
    "T1498": {
        "id": "T1498",
        "name": "Network Denial of Service",
        "tactics": ["Impact"],
        "definition": "Adversaries flood network bandwidth or service connection queues to degrade or completely deny system availability to legitimate users.",
        "common_example": "Volumetric SYN-flood attack targeting the campus LMS exam portal during scheduled final examinations, causing 100% web worker saturation.",
        "detection_flow": [
            "Inbound traffic spike exceeding bandwidth baselines by 500%+",
            "SYN-flood or UDP amplification packets detected at border router",
            "Application response latency exceeding 30,000ms"
        ],
        "affected_sectors": ["Education", "Hospital", "Power Grid"],
        "why_risky": "Disrupts critical operational workflows, exam administrations, or clinical communication channels.",
        "recommended_action": "Engage upstream DDoS mitigation scrub centers, enforce SYN cookies, and rate-limit HTTP ingress traffic."
    },
    "T1059": {
        "id": "T1059",
        "name": "Command and Scripting Interpreter",
        "tactics": ["Execution"],
        "definition": "Adversaries abuse command interpreters such as Bash, PowerShell, or JavaScript engines to execute arbitrary code or scripts.",
        "common_example": "Injecting stored XSS JavaScript into a student feedback portal or executing malicious Python shell scripts via exposed web administration forms.",
        "detection_flow": [
            "Unsanitized input containing script tags or shell metacharacters",
            "Web daemon spawning /bin/sh or cmd.exe child processes",
            "Execution of obfuscated base64 PowerShell commands"
        ],
        "affected_sectors": ["Education", "Hospital"],
        "why_risky": "Allows rapid code execution, session hijacking, and privilege escalation on host operating systems.",
        "recommended_action": "Strictly sanitize all user inputs, deploy robust Content Security Policy (CSP) headers, and restrict script execution policies."
    },
    "T1200": {
        "id": "T1200",
        "name": "Hardware Additions / Rogue AP",
        "tactics": ["Initial Access"],
        "definition": "Adversaries introduce unauthorized hardware (such as rogue Wi-Fi access points, network taps, or cellular modems) into an environment to bypass security controls.",
        "common_example": "Planting a rogue Wi-Fi access point in a hospital visitor lounge broadcasting the corporate SSID to intercept doctor and tablet traffic.",
        "detection_flow": [
            "Wireless Intrusion Prevention (WIPS) alert: duplicate SSID with untrusted BSSID",
            "Deauthentication packet storms targeting wireless medical tablets",
            "New unknown MAC address detected on perimeter access switches"
        ],
        "affected_sectors": ["Hospital", "Education", "Power Grid"],
        "why_risky": "Directly bypasses 802.1X physical port security and enables Man-in-the-Middle (MitM) credential theft.",
        "recommended_action": "Deploy continuous WIPS monitoring, enable 802.1X port authentication on all physical wall jacks, and conduct regular physical sweeps."
    },
    "T0814": {
        "id": "T0814",
        "name": "Denial of Service (ICS)",
        "tactics": ["Impair Process Control"],
        "definition": "Adversaries perform denial of service attacks specifically targeting industrial control equipment, protocols, or telemetry concentrators.",
        "common_example": "Flooding an IEC 60870-5-104 gateway with malformed APDUs, forcing the RTU into an error-recovery loop and blinding the Regional Control Center.",
        "detection_flow": [
            "IEC-104 link layer reset loop alerts in SCADA logs",
            "Loss of periodic cyclic telemetry updates from substation",
            "High rate of invalid function codes or truncated transport frames"
        ],
        "affected_sectors": ["Power Grid", "Agriculture"],
        "why_risky": "Blinds grid operators to active faults, preventing prompt automated shedding or breaker coordination.",
        "recommended_action": "Deploy hardware-accelerated ICS protocol firewalls that drop malformed frames before reaching controller communication buffers."
    }
}

# ===================================================================
# 2. Sector Realistic Asset Definitions
# ===================================================================

def generate_agriculture_assets():
    """Generates 26 realistic Smart Agriculture assets across Kerala agricultural hubs."""
    hubs = [
        {"hub": "Palakkad Agro-Cluster", "district": "Palakkad", "prefix": "PLK"},
        {"hub": "Wayanad Tea & Spice Plantation", "district": "Wayanad", "prefix": "WYD"},
        {"hub": "Kuttanad Smart Paddy Fields", "district": "Alappuzha", "prefix": "ALP"},
        {"hub": "Idukki High-Range Cardamom Estate", "district": "Idukki", "prefix": "IDK"}
    ]
    
    asset_types = [
        {"type": "Smart Irrigation Controller", "cat": "PLC Controller", "crit": "HIGH", "protocol": "Modbus TCP (Port 502)", "ports": [502, 80], "vendor": "Hunter / Rain Bird", "model": "ACC2 Decoders", "mitre": ["T0855", "T0831"]},
        {"type": "Precision Soil Moisture Sensor Node", "cat": "IoT Sensor", "crit": "MEDIUM", "protocol": "LoRaWAN / Modbus RTU", "ports": [1883], "vendor": "Sentek", "model": "Drill & Drop TriSCAN", "mitre": ["T0831"]},
        {"type": "Micro-Climate Weather Station", "cat": "Telemetry Node", "crit": "LOW", "protocol": "MQTT / TLS (Port 8883)", "ports": [8883], "vendor": "Davis Instruments", "model": "Vantage Pro2 Plus", "mitre": ["T1046"]},
        {"type": "Farm Edge Gateway Node", "cat": "Gateway", "crit": "CRITICAL", "protocol": "HTTPS / SSH", "ports": [22, 443], "vendor": "Advantech", "model": "WISE-710 Industrial IoT Gateway", "mitre": ["T0822", "T1110"]},
        {"type": "High-Pressure Water Pump Controller", "cat": "Actuator", "crit": "HIGH", "protocol": "DNP3 / Modbus TCP", "ports": [502, 20000], "vendor": "Grundfos", "model": "CU 362 Pump Controller", "mitre": ["T0813", "T0855"]},
        {"type": "Greenhouse Climate Automation Controller", "cat": "PLC Controller", "crit": "HIGH", "protocol": "BACnet/IP / Modbus", "ports": [47808, 502], "vendor": "Priva", "model": "Compass Climate System", "mitre": ["T0858", "T0855"]},
        {"type": "Agricultural Central MQTT Broker", "cat": "Message Broker", "crit": "CRITICAL", "protocol": "MQTT / TLS (Port 8883)", "ports": [8883, 1883], "vendor": "EMQX / HiveMQ", "model": "Enterprise IoT Cluster", "mitre": ["T1110", "T0859"]}
    ]
    
    assets = []
    asset_idx = 1
    for hub in hubs:
        # 6-7 assets per agricultural hub
        count_for_hub = 7 if hub["prefix"] in ["PLK", "ALP"] else 6
        for i in range(count_for_hub):
            atype = asset_types[i % len(asset_types)]
            ip = f"192.168.{20 + hubs.index(hub) * 10}.{10 + i * 5}"
            mac = f"00:1E:06:{random.randint(10,99):02X}:{random.randint(10,99):02X}:{asset_idx:02X}"
            
            # Risk distribution: 1 critical, 2 high, others medium/healthy
            if asset_idx in [4, 18]:
                status = "CRITICAL"
                risk = round(random.uniform(85.0, 93.0), 1)
            elif asset_idx in [1, 9, 15]:
                status = "WARNING"
                risk = round(random.uniform(55.0, 72.0), 1)
            else:
                status = "HEALTHY"
                risk = round(random.uniform(8.0, 22.0), 1)
                
            assets.append({
                "id": f"AG-{hub['prefix']}-{atype['cat'][:3].upper()}-{asset_idx:03d}",
                "name": f"{hub['hub']} {atype['type']}",
                "sector": "Agriculture",
                "asset_type": atype["type"],
                "category": atype["cat"],
                "location": f"{hub['hub']} Field Station",
                "district": hub["district"],
                "ip_address": ip,
                "hostname": f"agri-{hub['prefix'].lower()}-{asset_idx:02d}.local",
                "criticality": atype["crit"],
                "status": status,
                "risk_score": risk,
                "last_seen": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "protocol": atype["protocol"],
                "vendor": atype["vendor"],
                "model": atype["model"],
                "firmware": f"v{random.randint(1,3)}.{random.randint(0,9)}.{random.randint(10,99)}",
                "open_ports": atype["ports"],
                "vulnerabilities": [
                    {"cve": "CVE-2022-3166", "cvss": 8.6, "mitre": "T0831", "desc": "Modbus/TCP Function Code Command Injection"}
                ] if risk > 50 else [],
                "associated_mitre_techniques": atype["mitre"]
            })
            asset_idx += 1
            
    return assets

def generate_hospital_assets():
    """Generates 25 realistic Hospital / Healthcare IT assets across major Kerala medical facilities."""
    hospitals = [
        {"name": "Ernakulam Super Specialty Medical Centre", "district": "Ernakulam", "prefix": "EKM"},
        {"name": "Trivandrum Regional Cancer Care Centre", "district": "Thiruvananthapuram", "prefix": "TVM"},
        {"name": "Kozhikode Government Medical College IT", "district": "Kozhikode", "prefix": "KKD"},
        {"name": "Thrissur Institute of Medical Sciences", "district": "Thrissur", "prefix": "TCR"}
    ]
    
    asset_types = [
        {"type": "Patient Database Server (PHI Vault)", "cat": "Database", "crit": "CRITICAL", "protocol": "PostgreSQL (Port 5432)", "ports": [5432, 443], "vendor": "PostgreSQL / Epic", "model": "Relational PHI Cluster", "mitre": ["T1005", "T0859"]},
        {"type": "Hospital Information System (HIS) Server", "cat": "Clinical App", "crit": "CRITICAL", "protocol": "HTTPS (Port 443)", "ports": [443, 8443], "vendor": "Cerner / Oracle Health", "model": "Millennium HIS Gateway", "mitre": ["T1190", "T0859"]},
        {"type": "ICU Vital Signs Patient Monitor Relay", "cat": "Medical IoT", "crit": "CRITICAL", "protocol": "HL7 / MLLP (Port 2575)", "ports": [2575, 8080], "vendor": "Philips Healthcare", "model": "IntelliVue MX800", "mitre": ["T0855", "T0831"]},
        {"type": "Smart Wireless Infusion Pump Controller", "cat": "Medical IoT", "crit": "HIGH", "protocol": "Wireless HL7 / Proprietary", "ports": [8443], "vendor": "B. Braun / BD", "model": "Alaris Infusion Guard", "mitre": ["T0855", "T1486"]},
        {"type": "PACS Radiology Imaging Archive", "cat": "Imaging Server", "crit": "CRITICAL", "protocol": "DICOM (Port 104) / HTTPS", "ports": [104, 443], "vendor": "GE Healthcare", "model": "Centricity PACS Universal", "mitre": ["T1486", "T0886"]},
        {"type": "Clinical Pathology LIS Gateway", "cat": "Lab System", "crit": "HIGH", "protocol": "ASTM E1394 / TCP", "ports": [5000, 80], "vendor": "Siemens Healthineers", "model": "Atellica Data Manager", "mitre": ["T0846"]},
        {"type": "Automated Pharmacy Dispensing Unit", "cat": "Pharmacy System", "crit": "HIGH", "protocol": "HL7 / TCP (Port 8080)", "ports": [8080], "vendor": "Omnicell / BD Pyxis", "model": "MedStation ES Dispenser", "mitre": ["T0855", "T1110"]},
        {"type": "Hospital Core Perimeter Firewall", "cat": "Network Gateway", "crit": "CRITICAL", "protocol": "HTTPS / SSH", "ports": [22, 443], "vendor": "Palo Alto Networks", "model": "PA-3400 Series Zero Trust", "mitre": ["T0822", "T0846"]},
        {"type": "Physician Clinical Workstation", "cat": "Workstation", "crit": "MEDIUM", "protocol": "RDP / TLS (Port 3389)", "ports": [3389], "vendor": "Dell Healthcare", "model": "OptiPlex Medical Workstation", "mitre": ["T0886", "T1021"]}
    ]
    
    assets = []
    asset_idx = 1
    for hosp in hospitals:
        # 6-7 assets per facility
        count_for_hosp = 7 if hosp["prefix"] in ["EKM"] else 6
        for i in range(count_for_hosp):
            atype = asset_types[i % len(asset_types)]
            ip = f"172.16.{10 + hospitals.index(hosp) * 10}.{15 + i * 4}"
            mac = f"00:50:56:{random.randint(10,99):02X}:{random.randint(10,99):02X}:{asset_idx:02X}"
            
            if asset_idx in [1, 13]: # Patient DB / PACS
                status = "CRITICAL"
                risk = round(random.uniform(88.0, 96.0), 1)
            elif asset_idx in [4, 8, 20]:
                status = "WARNING"
                risk = round(random.uniform(58.0, 74.0), 1)
            else:
                status = "HEALTHY"
                risk = round(random.uniform(10.0, 24.0), 1)
                
            assets.append({
                "id": f"HOSP-{hosp['prefix']}-{atype['cat'][:3].upper()}-{asset_idx:03d}",
                "name": f"{hosp['name']} {atype['type']}",
                "sector": "Hospital",
                "asset_type": atype["type"],
                "category": atype["cat"],
                "location": f"{hosp['name']} Main Campus",
                "district": hosp["district"],
                "ip_address": ip,
                "hostname": f"hosp-{hosp['prefix'].lower()}-{asset_idx:02d}.healthnet.kerala",
                "criticality": atype["crit"],
                "status": status,
                "risk_score": risk,
                "last_seen": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "protocol": atype["protocol"],
                "vendor": atype["vendor"],
                "model": atype["model"],
                "firmware": f"v{random.randint(4,6)}.{random.randint(0,9)}.{random.randint(100,999)}",
                "open_ports": atype["ports"],
                "vulnerabilities": [
                    {"cve": "CVE-2023-2454", "cvss": 9.4, "mitre": "T1005", "desc": "PostgreSQL Remote Unauthenticated PHI Exfiltration"}
                ] if risk > 50 else [],
                "associated_mitre_techniques": atype["mitre"]
            })
            asset_idx += 1
            
    return assets

def generate_education_assets():
    """Generates 25 realistic Education / Academic IT assets across Kerala universities and technical institutes."""
    universities = [
        {"name": "CUSAT Cochin University of Science & Technology", "district": "Ernakulam", "prefix": "CST"},
        {"name": "NIT Calicut National Institute of Technology", "district": "Kozhikode", "prefix": "NIT"},
        {"name": "Kerala University Central Campus", "district": "Thiruvananthapuram", "prefix": "KU"},
        {"name": "APJ Abdul Kalam Technological University IT", "district": "Thiruvananthapuram", "prefix": "KTU"}
    ]
    
    asset_types = [
        {"type": "Central Student Database Server", "cat": "Database", "crit": "CRITICAL", "protocol": "PostgreSQL (Port 5432)", "ports": [5432, 443], "vendor": "PostgreSQL / EnterpriseDB", "model": "Primary Registrar DB", "mitre": ["T1190", "T0859"]},
        {"type": "LMS Exam & Courseware Server (Moodle/Canvas)", "cat": "Core Server", "crit": "CRITICAL", "protocol": "HTTPS (Port 443)", "ports": [443, 80], "vendor": "Moodle / Canvas LMS", "model": "Scalable Academic Cloud", "mitre": ["T1498", "T1059"]},
        {"type": "Academic Registrar Records Vault", "cat": "Records Vault", "crit": "HIGH", "protocol": "HTTPS / MS-SQL (Port 1433)", "ports": [1433, 443], "vendor": "Microsoft SQL Server", "model": "Transcript Ledger Vault", "mitre": ["T0809", "T0859"]},
        {"type": "Engineering Computer Lab Systems Subnet", "cat": "Lab Subnet", "crit": "HIGH", "protocol": "SSH / RDP / SMB (Port 445)", "ports": [22, 3389, 445], "vendor": "Ubuntu / Linux Lab Cluster", "model": "Student CAD/AI Workstations", "mitre": ["T1021", "T0846"]},
        {"type": "AI & HPC Research Compute Cluster", "cat": "Compute Cluster", "crit": "HIGH", "protocol": "Slurm / SSH (Port 22)", "ports": [22, 6817], "vendor": "NVIDIA / Dell EMC", "model": "PowerEdge 8x H100 GPU Pod", "mitre": ["T0886", "T1110"]},
        {"type": "Campus-Wide Wi-Fi Access Controller", "cat": "Wireless AP", "crit": "HIGH", "protocol": "CAPWAP / HTTPS (Port 443)", "ports": [443, 5246], "vendor": "Cisco Catalyst", "model": "9800-CL Wireless Controller", "mitre": ["T1200", "T1046"]},
        {"type": "Central Authentication / RADIUS Server", "cat": "Auth Server", "crit": "CRITICAL", "protocol": "RADIUS / LDAP (Port 389/636)", "ports": [1812, 389, 636], "vendor": "FreeRADIUS / OpenLDAP", "model": "University Single Sign-On", "mitre": ["T1110", "T0859"]},
        {"type": "University Border Gateway Router", "cat": "Perimeter Router", "crit": "CRITICAL", "protocol": "BGP / OSPF / SSH", "ports": [22, 179], "vendor": "Juniper Networks", "model": "MX204 Universal Edge", "mitre": ["T0822", "T1498"]},
        {"type": "Digital Library Repository Server", "cat": "Archive", "crit": "LOW", "protocol": "HTTPS / Apache Solr", "ports": [443, 8983], "vendor": "DSpace / Apache Solr", "model": "Institutional Theses Repository", "mitre": ["T1059"]}
    ]
    
    assets = []
    asset_idx = 1
    for uni in universities:
        # 6-7 assets per university
        count_for_uni = 7 if uni["prefix"] in ["CST"] else 6
        for i in range(count_for_uni):
            atype = asset_types[i % len(asset_types)]
            ip = f"10.20.{10 + universities.index(uni) * 10}.{10 + i * 5}"
            mac = f"00:15:5D:{random.randint(10,99):02X}:{random.randint(10,99):02X}:{asset_idx:02X}"
            
            if asset_idx in [1, 2]: # Student DB / LMS
                status = "CRITICAL"
                risk = round(random.uniform(86.0, 94.0), 1)
            elif asset_idx in [4, 7, 16]:
                status = "WARNING"
                risk = round(random.uniform(56.0, 75.0), 1)
            else:
                status = "HEALTHY"
                risk = round(random.uniform(8.0, 20.0), 1)
                
            assets.append({
                "id": f"EDU-{uni['prefix']}-{atype['cat'][:3].upper()}-{asset_idx:03d}",
                "name": f"{uni['name']} {atype['type']}",
                "sector": "Education",
                "asset_type": atype["type"],
                "category": atype["cat"],
                "location": f"{uni['name']} Campus",
                "district": uni["district"],
                "ip_address": ip,
                "hostname": f"edu-{uni['prefix'].lower()}-{asset_idx:02d}.campus.kerala.ac.in",
                "criticality": atype["crit"],
                "status": status,
                "risk_score": risk,
                "last_seen": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "protocol": atype["protocol"],
                "vendor": atype["vendor"],
                "model": atype["model"],
                "firmware": f"v{random.randint(2,5)}.{random.randint(1,9)}.{random.randint(10,99)}",
                "open_ports": atype["ports"],
                "vulnerabilities": [
                    {"cve": "CVE-2023-28121", "cvss": 9.8, "mitre": "T1190", "desc": "Unauthenticated Authentication Bypass and SQL Injection"}
                ] if risk > 50 else [],
                "associated_mitre_techniques": atype["mitre"]
            })
            asset_idx += 1
            
    return assets

# ===================================================================
# 3. Master Multi-Sector Asset Registry (Single Source of Truth)
# ===================================================================

class MultiSectorDataManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MultiSectorDataManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
            
        print("[MultiSectorDataManager] Initializing Unified Multi-Sector Asset Store...")
        
        # 1. 252 Kerala Power Grid Assets (100% PRESERVED)
        raw_powergrid = generate_250_kerala_grid_assets()
        self.powergrid_assets = []
        for a in raw_powergrid:
            p_asset = dict(a)
            p_asset["sector"] = "Power Grid"
            p_asset["asset_name"] = a["name"]
            p_asset["location"] = f"{a['substation']}, {a['district']}"
            p_asset["hostname"] = f"grid-{a['district_code'].lower()}-{a['id'].split('-')[-1]}.kseb.ot"
            p_asset["associated_mitre_techniques"] = a.get("mitre_attack", ["T0855"])
            self.powergrid_assets.append(p_asset)

        # 2. 26 Smart Agriculture Assets
        self.agriculture_assets = generate_agriculture_assets()
        for a in self.agriculture_assets:
            a["asset_name"] = a["name"]

        # 3. 25 Hospital IT Assets
        self.hospital_assets = generate_hospital_assets()
        for a in self.hospital_assets:
            a["asset_name"] = a["name"]

        # 4. 25 Education IT Assets
        self.education_assets = generate_education_assets()
        for a in self.education_assets:
            a["asset_name"] = a["name"]

        # Combined Assets List
        self.all_assets = (
            self.powergrid_assets +
            self.agriculture_assets +
            self.hospital_assets +
            self.education_assets
        )
        
        print(f"[MultiSectorDataManager] Initialized {len(self.all_assets)} Total Assets across 4 Sectors:")
        print(f"  - Power Grid:  {len(self.powergrid_assets)} assets")
        print(f"  - Agriculture: {len(self.agriculture_assets)} assets")
        print(f"  - Hospital:    {len(self.hospital_assets)} assets")
        print(f"  - Education:   {len(self.education_assets)} assets")

        # Predefined Multi-Sector Realistic Security Incidents
        self.security_incidents = self._generate_canonical_incidents()
        self._initialized = True

    def _generate_canonical_incidents(self):
        """Generates realistic canonical security incidents across all 4 sectors."""
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        
        incidents = [
            # 1. Education: Unauthorized Student Database Access (T0859)
            {
                "id": "INC-EDU-01",
                "incident_name": "Unauthorized Student Database Access",
                "sector": "Education",
                "asset_id": "EDU-CST-DAT-001",
                "affected_asset": "CUSAT Central Student Database Server",
                "district": "Ernakulam",
                "category": "Credential Abuse",
                "mitre_id": "T0859",
                "mitre_technique": "T0859 – Valid Accounts",
                "likelihood": 4, # Likely (4/5)
                "impact": 5,     # Severe (5/5)
                "risk_score": 88.0,
                "severity": "CRITICAL",
                "timestamp": now_str,
                "description": "An attacker compromised faculty credentials via a credential-stuffing attack and accessed the central PostgreSQL registrar database, attempting bulk extraction and unauthorized grade record alteration.",
                "detection_evidence": "Suspicious authenticated session from external Tor exit node 185.220.101.5 executing bulk UPDATE queries on transcripts table.",
                "potential_impact": "Compromise of 45,000+ student records, unauthorized transcript modifications, and regulatory penalties under state education data laws.",
                "why_risky": "Legitimate credentials bypass traditional firewall blocks and perimeter intrusion prevention, allowing the adversary to operate with legitimate database privileges.",
                "recommended_action": "Immediately revoke compromised faculty session tokens, enforce hardware-backed MFA on all database administrator portals, and restore verified tamper-proof ledger audit records.",
                "status": "ACTIVE"
            },
            # 2. Hospital: Patient Database Unauthorized PHI Access (T1005)
            {
                "id": "INC-HOSP-01",
                "incident_name": "Patient Database Vault Bulk PHI Extraction",
                "sector": "Hospital",
                "asset_id": "HOSP-EKM-DAT-001",
                "affected_asset": "Ernakulam Super Specialty Patient Database Vault",
                "district": "Ernakulam",
                "category": "Unauthorized Access",
                "mitre_id": "T1005",
                "mitre_technique": "T1005 – Data from Local System",
                "likelihood": 4,
                "impact": 5,
                "risk_score": 94.0,
                "severity": "CRITICAL",
                "timestamp": now_str,
                "description": "High-frequency unindexed SQL SELECT queries detected on EHR clinical tables exfiltrating confidential patient diagnostic histories and national health IDs.",
                "detection_evidence": "Over 2,400 query records per second dispatched to internal pivot IP 172.16.10.114 bypassing web application layer.",
                "potential_impact": "Mass exfiltration of HIPAA/DISHA Protected Health Information, medical identity theft, and severe hospital operational disruption.",
                "why_risky": "Patient health records contain permanent, sensitive medical and personal data that cannot be reset like passwords, posing catastrophic reputational and legal liability.",
                "recommended_action": "Isolate the compromised database application server, terminate active connection pools, rotate database service keys, and alert HIPAA compliance leadership.",
                "status": "ACTIVE"
            },
            # 3. Hospital: PACS Ransomware Pre-Execution Beaconing (T1486)
            {
                "id": "INC-HOSP-02",
                "incident_name": "PACS Radiology Imaging Ransomware Beaconing",
                "sector": "Hospital",
                "asset_id": "HOSP-EKM-IMA-005",
                "affected_asset": "Ernakulam PACS Radiology Imaging Archive",
                "district": "Ernakulam",
                "category": "Malware Detection",
                "mitre_id": "T1486",
                "mitre_technique": "T1486 – Data Encrypted for Impact",
                "likelihood": 5,
                "impact": 5,
                "risk_score": 96.0,
                "severity": "CRITICAL",
                "timestamp": now_str,
                "description": "Encrypted command-and-control beaconing detected originating from the PACS imaging workstation with automated staging of DICOM file header enumeration.",
                "detection_evidence": "Periodic outbound TLS handshakes to malicious C2 IP 45.142.214.12 combined with high-frequency .tmp file creations in /dicom/archive/.",
                "potential_impact": "Total lockdown of digital MRI and CT scan files across hospital emergency operating rooms, delaying life-critical surgeries.",
                "why_risky": "Ransomware encryption in clinical environments directly threatens human life by rendering medical diagnostic imaging and patient charts instantly inaccessible.",
                "recommended_action": "Disconnect PACS server switch ports instantly. Verify immutable snapshot integrity, trigger centralized EDR containment, and initiate clean recovery procedures.",
                "status": "ACTIVE"
            },
            # 4. Power Grid: Substation Modbus/TCP Unauthorized Command (T0855)
            {
                "id": "INC-PWR-01",
                "incident_name": "Kalamassery 220kV Substation PLC Command Injection",
                "sector": "Power Grid",
                "asset_id": "KL-EKM-PLC-004",
                "affected_asset": "Ernakulam Kalamassery SLDC Programmable Logic Controller",
                "district": "Ernakulam",
                "category": "Unauthorized Access",
                "mitre_id": "T0855",
                "mitre_technique": "T0855 – Unauthorized Command Message",
                "likelihood": 4,
                "impact": 5,
                "risk_score": 92.5,
                "severity": "CRITICAL",
                "timestamp": now_str,
                "description": "Unauthenticated function code 0x05 / 0x06 coil-write override packets detected over Modbus/TCP attempting to trip high-voltage busbar circuit breakers.",
                "detection_evidence": "Industrial DPI alert: Modbus write coil command from unauthorized external IP 185.220.101.44 over port 502 targeting register 0x0021.",
                "potential_impact": "Immediate trip of Kalamassery 220kV feeder lines, causing cascading power outages across Kochi industrial and commercial substations.",
                "why_risky": "Direct cyber-to-physical actuation bypasses software safety guards and can cause explosive breaker failure or destabilize the statewide 50Hz grid frequency.",
                "recommended_action": "Engage hardware-isolated substation bypass. Enforce IP whitelisting on Industrial Security Firewalls and lock out remote coil-write capabilities.",
                "status": "ACTIVE"
            },
            # 5. Agriculture: Irrigation Controller Unauthorized Valve Actuation (T0855)
            {
                "id": "INC-AG-01",
                "incident_name": "Smart Irrigation Controller Valve Override",
                "sector": "Agriculture",
                "asset_id": "AG-PLK-PLC-001",
                "affected_asset": "Palakkad Agro-Cluster Smart Irrigation Controller",
                "district": "Palakkad",
                "category": "Unauthorized Access",
                "mitre_id": "T0855",
                "mitre_technique": "T0855 – Unauthorized Command Message",
                "likelihood": 4,
                "impact": 4,
                "risk_score": 91.0,
                "severity": "CRITICAL",
                "timestamp": now_str,
                "description": "Unauthenticated Modbus coil write override targeting the main irrigation valve controller attempting forced high-pressure actuation beyond pipe pressure ratings.",
                "detection_evidence": "Coil force command (function code 0x05) initiated from unauthorized IP 198.51.100.44 over port 502.",
                "potential_impact": "Rupture of commercial drip irrigation manifolds, massive agricultural flooding, and destruction of regional high-yield crops.",
                "why_risky": "IoT controllers in smart agriculture often lack enterprise encryption, allowing simple packet injection to manipulate high-power physical actuators.",
                "recommended_action": "Isolate the irrigation PLC on the field gateway firewall, verify Modbus master cryptographic signature, and enforce physical pressure-relief valves.",
                "status": "ACTIVE"
            },
            # 6. Education: Volumetric DDoS Flooding on LMS Exam Portal (T1498)
            {
                "id": "INC-EDU-02",
                "incident_name": "DDoS Flooding on University LMS Exam Portal",
                "sector": "Education",
                "asset_id": "EDU-CST-COR-002",
                "affected_asset": "CUSAT LMS Exam & Courseware Server",
                "district": "Ernakulam",
                "category": "Denial of Service",
                "mitre_id": "T1498",
                "mitre_technique": "T1498 – Network Denial of Service",
                "likelihood": 5,
                "impact": 4,
                "risk_score": 84.0,
                "severity": "CRITICAL",
                "timestamp": now_str,
                "description": "Massive volumetric SYN-flood and HTTP GET flood targeting the online university examination portal during scheduled statewide midterm tests.",
                "detection_evidence": "Inbound bandwidth surge exceeding 6.8 Gbps with 420,000 HTTP requests/sec originating from 1,200+ botnet IP addresses.",
                "potential_impact": "Immediate server outage, disconnection of 3,400+ students taking timed certification examinations, and exam invalidation.",
                "why_risky": "Denies critical educational services at high-visibility operational peaks, creating massive public relations fallout and student academic distress.",
                "recommended_action": "Route campus ingress traffic through upstream BGP Cloudflare scrubbing centers and activate WAF rate-limiting filters on exam URLs.",
                "status": "ACTIVE"
            },
            # 7. Agriculture: Farm Edge Gateway Brute-Force SSH (T1110)
            {
                "id": "INC-AG-02",
                "incident_name": "Farm Edge Gateway SSH Credential Stuffing",
                "sector": "Agriculture",
                "asset_id": "AG-PLK-GAT-004",
                "affected_asset": "Palakkad Agro-Cluster Farm Edge Gateway Node",
                "district": "Palakkad",
                "category": "Credential Abuse",
                "mitre_id": "T1110",
                "mitre_technique": "T1110 – Brute Force",
                "likelihood": 4,
                "impact": 3,
                "risk_score": 68.0,
                "severity": "HIGH",
                "timestamp": now_str,
                "description": "Automated sequential dictionary attacks targeting administrative SSH port 22 on the perimeter agricultural edge concentrator.",
                "detection_evidence": "Over 800 failed root login attempts within 4 minutes originating from rotating proxy range 94.102.61.0/24.",
                "potential_impact": "Compromise of the farm gateway could allow pivoting into all local soil sensors, weather stations, and automated pump controllers.",
                "why_risky": "Edge gateways bridge unsecured field networks with cloud telemetry brokers; a compromised gateway grants total visibility into farm OT assets.",
                "recommended_action": "Disable root SSH password logins, mandate cryptographic SSH keys, change listening port, and enforce Fail2ban IP banning.",
                "status": "ACTIVE"
            },
            # 8. Power Grid: Substation Network Reconnaissance Port Scan (T0846)
            {
                "id": "INC-PWR-02",
                "incident_name": "Substation SCADA Network System Discovery",
                "sector": "Power Grid",
                "asset_id": "KL-EKM-SUB-003",
                "affected_asset": "Ernakulam Brahmapuram 220kV Substation Controller",
                "district": "Ernakulam",
                "category": "Port Scanning",
                "mitre_id": "T0846",
                "mitre_technique": "T0846 – Remote System Discovery",
                "likelihood": 4,
                "impact": 3,
                "risk_score": 62.0,
                "severity": "HIGH",
                "timestamp": now_str,
                "description": "High-speed SYN reconnaissance scan sweeping across industrial subnet probing for open SCADA ports 104, 502, 4840, and 20000.",
                "detection_evidence": "Sequential TCP SYN packets with 0ms interval across IP range 10.EKM.1.1 through 10.EKM.1.254.",
                "potential_impact": "Identifies active RTU/PLC firmware models, opening the door for targeted zero-day exploits.",
                "why_risky": "Reconnaissance is the prerequisite phase for targeted industrial sabotage. Catching attackers here prevents subsequent control compromise.",
                "recommended_action": "Drop non-whitelisted SYN packets at internal switches, isolate the probing source IP, and inspect perimeter VPN logs.",
                "status": "ACTIVE"
            },
            # 9. Education: Computer Lab Lateral Worm Propagation (T1021)
            {
                "id": "INC-EDU-03",
                "incident_name": "Engineering Lab Lateral Worm SMB Propagation",
                "sector": "Education",
                "asset_id": "EDU-CST-LAB-004",
                "affected_asset": "CUSAT Engineering Computer Lab Systems Subnet",
                "district": "Ernakulam",
                "category": "Malware Detection",
                "mitre_id": "T1021",
                "mitre_technique": "T1021 – Remote Services",
                "likelihood": 4,
                "impact": 3,
                "risk_score": 78.0,
                "severity": "HIGH",
                "timestamp": now_str,
                "description": "Automated SMB worm attempting rapid lateral propagation across engineering computer laboratory terminals via Port 445.",
                "detection_evidence": "Port 445 connection flood across 10.20.10.0/24 subnet initiated from infected student workstation IP 10.20.10.45.",
                "potential_impact": "Infection of 100+ laboratory terminals and potential pivoting into faculty and grading file servers.",
                "why_risky": "Open file-sharing protocols in shared computer labs allow malware to traverse an entire campus network within minutes.",
                "recommended_action": "Isolate the computer lab VLAN at core switch, deploy centralized EDR cleanup, and block inter-workstation SMB communications.",
                "status": "ACTIVE"
            },
            # 10. Hospital: Rogue Wi-Fi Access Point Detected (T1200)
            {
                "id": "INC-HOSP-03",
                "incident_name": "Hospital Visitor Area Rogue Access Point",
                "sector": "Hospital",
                "asset_id": "HOSP-EKM-NET-008",
                "affected_asset": "Ernakulam Super Specialty Hospital Wi-Fi Controller",
                "district": "Ernakulam",
                "category": "Unauthorized Access",
                "mitre_id": "T1200",
                "mitre_technique": "T1200 – Hardware Additions / Rogue AP",
                "likelihood": 3,
                "impact": 3,
                "risk_score": 45.0,
                "severity": "MEDIUM",
                "timestamp": now_str,
                "description": "Rogue wireless access point broadcasting identical hospital staff SSID detected in visitor reception area attempting MitM credential capture.",
                "detection_evidence": "WIPS alert: unauthorized BSSID transmitting deauthentication frames targeting clinical tablets.",
                "potential_impact": "Interception of unencrypted clinical communications and staff Wi-Fi login credentials.",
                "why_risky": "Allows physical proximity attackers to bypass perimeter security and intercept local wireless traffic.",
                "recommended_action": "Enable Wireless Intrusion Prevention (WIPS) RF containment, dispatch security personnel to physically seize rogue device.",
                "status": "ACTIVE"
            },
            # 11. Agriculture: Soil Moisture Sensor Telemetry Tampering (T0831)
            {
                "id": "INC-AG-03",
                "incident_name": "Soil Moisture Telemetry Data Tampering",
                "sector": "Agriculture",
                "asset_id": "AG-PLK-IOT-002",
                "affected_asset": "Palakkad Agro-Cluster Precision Soil Moisture Sensor Node",
                "district": "Palakkad",
                "category": "Other",
                "mitre_id": "T0831",
                "mitre_technique": "T0831 – Manipulation of Control",
                "likelihood": 3,
                "impact": 2,
                "risk_score": 48.0,
                "severity": "MEDIUM",
                "timestamp": now_str,
                "description": "Sudden anomalous telemetry spoofing detected on Soil Moisture Sensor Node broadcasting 100% moisture saturation despite zero rainfall.",
                "detection_evidence": "Analog values frozen at max range inconsistent with adjacent soil sensors in the same micro-climate zone.",
                "potential_impact": "Automated irrigation controllers shut off water prematurely, risking severe crop drought damage.",
                "why_risky": "Manipulating sensor data tricks automated algorithms into taking harmful physical actions without triggering traditional software fault alarms.",
                "recommended_action": "Recalibrate sensor node, verify firmware cryptographic signature, and regenerate LoRaWAN session keys.",
                "status": "ACTIVE"
            },
            # 12. Power Grid: Regional Control Center IEC-104 Telemetry Flood (T0814)
            {
                "id": "INC-PWR-03",
                "incident_name": "Southern RCC IEC-104 Telemetry Flood",
                "sector": "Power Grid",
                "asset_id": "KL-TVM-RCC-002",
                "affected_asset": "Thiruvananthapuram Southern RCC Gateway",
                "district": "Thiruvananthapuram",
                "category": "Denial of Service",
                "mitre_id": "T0814",
                "mitre_technique": "T0814 – Denial of Service (ICS)",
                "likelihood": 4,
                "impact": 4,
                "risk_score": 78.0,
                "severity": "HIGH",
                "timestamp": now_str,
                "description": "Malformed IEC 60870-5-104 APDU packet burst targeting Regional Control Center gateway causing telemetry frame drops.",
                "detection_evidence": "IEC-104 APDU frame rate exceeded 5,000 packets/sec with invalid TESTFR act confirmations.",
                "potential_impact": "Blinds grid operators in Southern RCC to active feeder status, preventing timely response to transmission overloads.",
                "why_risky": "Loss of visibility in high-voltage grids can turn a minor localized fault into a statewide blackout.",
                "recommended_action": "Enable stateful IEC-104 firewall filtering, drop unauthorized APDUs, and isolate remote RTU tunnels.",
                "status": "ACTIVE"
            }
        ]
        return incidents

    # ---------------------------------------------------------------
    # Single Source of Truth Analytics & Calculations
    # ---------------------------------------------------------------
    def get_unified_analytics(self):
        """
        Calculates all dashboard, heat map, attack analytics, and report numbers
        from the EXACT SAME underlying dataset.
        """
        total_assets = len(self.all_assets)
        total_incidents = len(self.security_incidents)

        # 1. Sector Summaries
        sector_names = ["Power Grid", "Agriculture", "Hospital", "Education"]
        sector_summary = {}

        for s_name in sector_names:
            s_assets = [a for a in self.all_assets if a["sector"].lower() == s_name.lower()]
            s_incidents = [inc for inc in self.security_incidents if inc["sector"].lower() == s_name.lower()]
            
            crit_inc = [inc for inc in s_incidents if inc["severity"] == "CRITICAL"]
            high_inc = [inc for inc in s_incidents if inc["severity"] == "HIGH"]
            med_inc = [inc for inc in s_incidents if inc["severity"] == "MEDIUM"]
            low_inc = [inc for inc in s_incidents if inc["severity"] == "LOW"]

            # Dynamic Risk Score Calculation
            if s_incidents:
                avg_risk = round(sum(inc["risk_score"] for inc in s_incidents) / len(s_incidents), 1)
            else:
                avg_risk = 14.0

            # Severity / Status Determination
            if crit_inc:
                status = "CRITICAL"
                badge = "CRITICAL"
                color = "red"
            elif high_inc:
                status = "HIGH"
                badge = "HIGH"
                color = "orange"
            elif med_inc:
                status = "WARNING"
                badge = "WARNING"
                color = "yellow"
            else:
                status = "NORMAL"
                badge = "NORMAL"
                color = "emerald"

            latest_threat = s_incidents[0]["incident_name"] if s_incidents else "Continuous Autonomous Monitoring Active"

            sector_summary[s_name] = {
                "sector_name": s_name,
                "asset_count": len(s_assets),
                "incident_count": len(s_incidents),
                "risk_score": avg_risk,
                "status": status,
                "badge": badge,
                "color": color,
                "latest_threat": latest_threat,
                "severity_distribution": {
                    "Critical": len(crit_inc),
                    "High": len(high_inc),
                    "Medium": len(med_inc),
                    "Low": len(low_inc)
                }
            }

        # 2. Overall System Risk Score
        overall_risk_score = round(sum(s["risk_score"] for s in sector_summary.values()) / len(sector_summary), 1)

        # 3. Overall Severity Distribution & Percentages
        all_crit = len([inc for inc in self.security_incidents if inc["severity"] == "CRITICAL"])
        all_high = len([inc for inc in self.security_incidents if inc["severity"] == "HIGH"])
        all_med = len([inc for inc in self.security_incidents if inc["severity"] == "MEDIUM"])
        all_low = len([inc for inc in self.security_incidents if inc["severity"] == "LOW"])

        # Dynamically calculated percentages that sum to 100%
        def calc_percentages(counts_dict):
            total = sum(counts_dict.values())
            if total == 0:
                return {k: 0.0 for k in counts_dict}
            res = {}
            running = 0.0
            keys = list(counts_dict.keys())
            for idx, k in enumerate(keys):
                if idx == len(keys) - 1:
                    res[k] = round(100.0 - running, 1)
                else:
                    val = round((counts_dict[k] / total) * 100.0, 1)
                    res[k] = val
                    running += val
            return res

        severity_counts = {
            "Critical": all_crit,
            "High": all_high,
            "Medium": all_med,
            "Low": all_low
        }
        severity_pct = calc_percentages(severity_counts)

        # 4. Attack Category Distribution & Percentages
        category_counts = {}
        for inc in self.security_incidents:
            cat = inc.get("category", "Other")
            category_counts[cat] = category_counts.get(cat, 0) + 1
        category_pct = calc_percentages(category_counts)

        # 5. Sector-Wise Attack Distribution & Percentages
        sector_attack_counts = {
            s: sector_summary[s]["incident_count"] for s in sector_names
        }
        sector_attack_pct = calc_percentages(sector_attack_counts)

        # 6. Top Detected MITRE Attacks
        mitre_counts = {}
        for inc in self.security_incidents:
            mid = inc.get("mitre_id", "T0859")
            mitre_counts[mid] = mitre_counts.get(mid, 0) + 1
        
        mitre_pct = calc_percentages(mitre_counts)

        top_mitre_attacks = []
        for mid, count in sorted(mitre_counts.items(), key=lambda x: x[1], reverse=True):
            info = MITRE_KNOWLEDGE_BASE.get(mid, {
                "name": "Industrial Cyber Threat",
                "affected_sectors": ["Power Grid", "Hospital"],
                "definition": "Security event"
            })
            top_mitre_attacks.append({
                "mitre_id": mid,
                "technique_name": info["name"],
                "incident_count": count,
                "percentage": mitre_pct.get(mid, 0.0),
                "affected_sectors": info.get("affected_sectors", []),
                "definition": info.get("definition", "")
            })

        # 7. 5x5 Cyber Risk Heat Map Data Points
        # X-axis: Likelihood 1-5, Y-axis: Impact 1-5
        # Standard Risk Zones:
        # 1-4: Low (Monitor)
        # 5-9: Medium (Plan)
        # 10-16: High (Prioritize)
        # 20-25: Critical (Act Now)
        heatmap_points = []
        for inc in self.security_incidents:
            lh = inc["likelihood"]
            imp = inc["impact"]
            score_product = lh * imp
            
            if score_product >= 20:
                zone = "Critical"
                zone_action = "Act Now"
            elif score_product >= 10:
                zone = "High"
                zone_action = "Prioritize"
            elif score_product >= 5:
                zone = "Medium"
                zone_action = "Plan"
            else:
                zone = "Low"
                zone_action = "Monitor"

            heatmap_points.append({
                "incident_id": inc["id"],
                "attack_name": inc["incident_name"],
                "sector": inc["sector"],
                "affected_asset": inc["affected_asset"],
                "asset_id": inc["asset_id"],
                "mitre_id": inc["mitre_id"],
                "mitre_technique": inc["mitre_technique"],
                "likelihood": lh,
                "impact": imp,
                "risk_score": inc["risk_score"],
                "severity": inc["severity"],
                "zone": zone,
                "zone_action": zone_action,
                "description": inc["description"],
                "why_risky": inc["why_risky"],
                "recommended_action": inc["recommended_action"]
            })

        return {
            "total_assets": total_assets,
            "overall_risk_score": overall_risk_score,
            "total_incidents": total_incidents,
            "sector_summaries": sector_summary,
            "severity_distribution": {
                "counts": severity_counts,
                "percentages": severity_pct
            },
            "category_distribution": {
                "counts": category_counts,
                "percentages": category_pct
            },
            "sector_distribution": {
                "counts": sector_attack_counts,
                "percentages": sector_attack_pct
            },
            "top_mitre_attacks": top_mitre_attacks,
            "heatmap_points": heatmap_points,
            "incidents": self.security_incidents
        }

    def filter_assets(self, sector=None, district=None, status=None, search=None):
        """Filters unified assets across all 4 sectors."""
        filtered = self.all_assets

        if sector and sector.lower() != 'all' and sector.lower() != 'all sectors':
            filtered = [a for a in filtered if a.get('sector', '').lower() == sector.lower()]

        if district and district.lower() != 'all' and district.lower() != 'all districts':
            filtered = [a for a in filtered if a.get('district', '').lower() == district.lower()]

        if status and status.lower() != 'all':
            filtered = [a for a in filtered if a.get('status', '').lower() == status.lower()]

        if search:
            q = search.lower()
            filtered = [
                a for a in filtered
                if q in a.get('name', '').lower()
                or q in a.get('id', '').lower()
                or q in a.get('ip_address', '').lower()
                or q in a.get('asset_type', '').lower()
                or q in a.get('protocol', '').lower()
                or any(q in m.lower() for m in a.get('associated_mitre_techniques', []))
            ]

        # Compute summary counts
        counts_by_sector = {
            "All": len(self.all_assets),
            "Power Grid": len(self.powergrid_assets),
            "Agriculture": len(self.agriculture_assets),
            "Hospital": len(self.hospital_assets),
            "Education": len(self.education_assets)
        }

        counts_by_severity = {
            "Critical": len([a for a in self.all_assets if a.get('status') == 'CRITICAL']),
            "High": len([a for a in self.all_assets if a.get('status') == 'WARNING']), # Ot convention: Warning/High
            "Medium": len([a for a in self.all_assets if a.get('status') == 'DEGRADED']),
            "Low": len([a for a in self.all_assets if a.get('status') == 'HEALTHY'])
        }

        return {
            "total_count": len(filtered),
            "counts_by_sector": counts_by_sector,
            "counts_by_severity": counts_by_severity,
            "assets": filtered
        }

# Global singleton instance
multi_sector_store = MultiSectorDataManager()
