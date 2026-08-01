import random

KERALA_DISTRICTS = [
    {"name": "Thiruvananthapuram", "code": "TVM", "lat": 8.5241, "lng": 76.9366, "rcc": "Southern RCC", "substations": ["Kaniyapuram 220kV", "Kazhakkoottam 110kV", "Vydyuthi Bhavanam SLDC", "Neyyattinkara 66kV"]},
    {"name": "Kollam", "code": "KLM", "lat": 8.8932, "lng": 76.6141, "rcc": "Southern RCC", "substations": ["Kundara 220kV", "Kottarakkara 110kV", "Karunagappally 66kV"]},
    {"name": "Pathanamthitta", "code": "PTA", "lat": 9.2648, "lng": 76.7870, "rcc": "Southern RCC", "substations": ["Sabarigiri Hydro Control", "Moozhiyar 220kV", "Pathanamthitta 110kV"]},
    {"name": "Alappuzha", "code": "ALP", "lat": 9.4981, "lng": 76.3388, "rcc": "Southern RCC", "substations": ["Kalarcode 220kV", "Cherthala 110kV", "Kayamkulam Combined Cycle 220kV"]},
    {"name": "Kottayam", "code": "KTM", "lat": 9.5916, "lng": 76.5222, "rcc": "Central RCC", "substations": ["Pallom 220kV", "Ettumanoor 110kV", "Vaikom 66kV"]},
    {"name": "Idukki", "code": "IDK", "lat": 9.8500, "lng": 76.9667, "rcc": "Central RCC", "substations": ["Idukki Hydro Generation SLDC", "Moolamattom 400kV", "Lower Periyar 220kV", "Neriamangalam 110kV"]},
    {"name": "Ernakulam", "code": "EKM", "lat": 9.9816, "lng": 76.2999, "rcc": "Central RCC", "substations": ["Kalamassery SLDC / 220kV", "Brahmapuram 220kV", "Cochin Port SCADA 110kV", "Kaloor GIS 110kV"]},
    {"name": "Thrissur", "code": "TCR", "lat": 10.5276, "lng": 76.2144, "rcc": "Central RCC", "substations": ["Madakkathara 400kV", "Thrissur Corporate 220kV", "Chalakkudy 110kV"]},
    {"name": "Palakkad", "code": "PKD", "lat": 10.7867, "lng": 76.6548, "rcc": "Northern RCC", "substations": ["Kanjikode Industrial 220kV", "Palakkad Town 110kV", "Walayar Solar Park 66kV"]},
    {"name": "Malappuram", "code": "MLP", "lat": 11.0720, "lng": 76.0740, "rcc": "Northern RCC", "substations": ["Areacode 220kV", "Manjeri 110kV", "Malappuram 110kV"]},
    {"name": "Kozhikode", "code": "KKD", "lat": 11.2588, "lng": 75.7804, "rcc": "Northern RCC", "substations": ["Nallalam 220kV", "Kuttiyadi Hydro 220kV", "Kozhikode East 110kV"]},
    {"name": "Wayanad", "code": "WYD", "lat": 11.6854, "lng": 76.1320, "rcc": "Northern RCC", "substations": ["Kalpetta 110kV", "Mananthavady 66kV", "Banawurasolar 66kV"]},
    {"name": "Kannur", "code": "KNR", "lat": 11.8745, "lng": 75.3704, "rcc": "Northern RCC", "substations": ["Kanhirode 220kV", "Taliparamba 110kV", "Payyanur 110kV"]},
    {"name": "Kasaragod", "code": "KSG", "lat": 12.5102, "lng": 74.9852, "rcc": "Northern RCC", "substations": ["Mylatti 220kV", "Kasaragod 110kV", "Paivalike Ultra Mega Solar 220kV"]}
]

ASSET_TYPES = [
    {"type": "State Load Dispatch Centre (SLDC)", "prefix": "SLDC", "criticality": "CRITICAL", "protocols": ["IEC 60870-5-104", "ICCP/TASE.2", "HTTPS"]},
    {"type": "Regional Control Center (RCC)", "prefix": "RCC", "criticality": "HIGH", "protocols": ["IEC 60870-5-104", "Modbus TCP", "DNP3"]},
    {"type": "Transmission Substation Controller", "prefix": "SUB", "criticality": "CRITICAL", "protocols": ["IEC 61850", "IEC 60870-5-104", "Modbus TCP"]},
    {"type": "Programmable Logic Controller (PLC)", "prefix": "PLC", "criticality": "HIGH", "protocols": ["Modbus TCP", "EtherNet/IP", "S7comm"]},
    {"type": "Remote Terminal Unit (RTU)", "prefix": "RTU", "criticality": "HIGH", "protocols": ["DNP3", "IEC 60870-5-104", "Modbus Serial"]},
    {"type": "Intelligent Electronic Device (IED)", "prefix": "IED", "criticality": "MEDIUM", "protocols": ["IEC 61850 GOOSE", "Modbus TCP"]},
    {"type": "Smart Grid Energy Meter", "prefix": "MTR", "criticality": "LOW", "protocols": ["DLMS/COSEM", "MQTT"]},
    {"type": "Industrial Security Firewall", "prefix": "FW", "criticality": "CRITICAL", "protocols": ["HTTPS", "SSH", "SNMPv3"]},
    {"type": "SCADA Core Historian Server", "prefix": "SRV", "criticality": "HIGH", "protocols": ["OPC-UA", "HTTPS", "SQL"]},
    {"type": "Engineering Workstation (EWS)", "prefix": "EWS", "criticality": "HIGH", "protocols": ["RDP", "SSH", "OPC-UA"]}
]

VENDORS = [
    {"name": "Siemens", "models": ["S7-1500 PLC", "SIPROTEC 5 IED", "SICAM PAS RTU"]},
    {"name": "ABB", "models": ["AC500 PLC", "Relion 670 IED", "RTU560"]},
    {"name": "Schneider Electric", "models": ["Modicon M580", "Easergy P5 IED", "ScadaPack RTU"]},
    {"name": "Schweitzer Engineering Labs (SEL)", "models": ["SEL-411L Protection Relay", "SEL-3530 Real-Time Automation Controller"]},
    {"name": "Honeywell", "models": ["ControlEdge PLC", "Experion PKS SCADA"]}
]

CVE_DATABASE_MAPPING = [
    {"cve": "CVE-2023-28341", "cvss": 9.1, "mitre": "T0855", "desc": "IEC 60870-5-104 Unauthenticated Substation Command Execution"},
    {"cve": "CVE-2022-3166", "cvss": 8.6, "mitre": "T0831", "desc": "Modbus/TCP Function Code Command Injection"},
    {"cve": "CVE-2021-44228", "cvss": 10.0, "mitre": "T1190", "desc": "Log4Shell RCE in SCADA Web Historian Gateway"},
    {"cve": "CVE-2023-38408", "cvss": 9.8, "mitre": "T1021", "desc": "OpenSSH PKCS#11 Remote Code Execution"},
    {"cve": "CVE-2022-0941", "cvss": 7.5, "mitre": "T0816", "desc": "Siemens S7-1500 PLC Unauthorized Memory Access"}
]

def generate_250_kerala_grid_assets():
    assets = []
    asset_counter = 1

    for dist in KERALA_DISTRICTS:
        # Create 18-20 assets per district (totaling 250+ assets across 14 districts)
        for i in range(18):
            asset_type = ASSET_TYPES[i % len(ASSET_TYPES)]
            vendor_info = VENDORS[i % len(VENDORS)]
            model = random.choice(vendor_info["models"])
            substation_name = dist["substations"][i % len(dist["substations"])]
            
            # Slight random coordinate scatter around district center
            lat = round(dist["lat"] + random.uniform(-0.04, 0.04), 4)
            lng = round(dist["lng"] + random.uniform(-0.04, 0.04), 4)
            
            ip_addr = f"10.{dist['code'] == 'TVM' and 10 or random.randint(11, 99)}.{random.randint(1, 254)}.{random.randint(1, 254)}"
            mac_addr = f"00:50:56:{random.randint(10,99):02X}:{random.randint(10,99):02X}:{random.randint(10,99):02X}"
            
            # Random health/risk status distribution
            health_score = round(random.uniform(70.0, 99.5), 1)
            risk_score = round(100.0 - health_score, 1)
            
            if risk_score > 25.0:
                status = "WARNING"
            elif risk_score > 15.0:
                status = "DEGRADED"
            else:
                status = "HEALTHY"

            cve_sample = random.sample(CVE_DATABASE_MAPPING, k=random.randint(1, 2)) if risk_score > 18.0 else []

            asset = {
                "id": f"KL-{dist['code']}-{asset_type['prefix']}-{asset_counter:03d}",
                "name": f"{dist['name']} {substation_name} {asset_type['type']}",
                "district": dist["name"],
                "district_code": dist["code"],
                "rcc": dist["rcc"],
                "substation": substation_name,
                "asset_type": asset_type["type"],
                "latitude": lat,
                "longitude": lng,
                "vendor": vendor_info["name"],
                "model": model,
                "firmware": f"v{random.randint(2,5)}.{random.randint(0,9)}.{random.randint(100,999)}",
                "ip_address": ip_addr,
                "mac_address": mac_addr,
                "protocol": random.choice(asset_type["protocols"]),
                "running_services": ["modbus-tcp", "iec-104", "ssh", "http-mgmt"][:random.randint(2, 4)],
                "open_ports": random.sample([22, 80, 104, 443, 502, 102, 4840, 20000], k=random.randint(2, 4)),
                "cpu_usage_pct": round(random.uniform(12.0, 68.0), 1),
                "ram_usage_pct": round(random.uniform(25.0, 78.0), 1),
                "temperature_c": round(random.uniform(32.0, 58.0), 1),
                "voltage_kv": round(random.uniform(108.0, 224.0) if "220kV" in substation_name else random.uniform(10.5, 34.0), 1),
                "current_a": round(random.uniform(120.0, 850.0), 1),
                "frequency_hz": round(random.uniform(49.88, 50.12), 2),
                "load_pct": round(random.uniform(45.0, 88.0), 1),
                "status": status,
                "availability_pct": 99.94,
                "criticality": asset_type["criticality"],
                "health_score": health_score,
                "risk_score": risk_score,
                "last_scan": "2026-07-27 18:30 UTC",
                "last_patch": "2026-06-15",
                "patch_status": "UP_TO_DATE" if risk_score < 15.0 else "PENDING_PATCH",
                "vulnerabilities": cve_sample,
                "mitre_attack": [c["mitre"] for c in cve_sample]
            }
            assets.append(asset)
            asset_counter += 1

    return assets
