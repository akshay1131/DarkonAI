class RiskScoringEngine:
    """
    Calculates dynamic cybersecurity posture risk score (0 - 100)
    and classifies detected vulnerabilities into threat categories.
    """
    CRITICAL_PORTS = {
        21: ("FTP", 12),
        22: ("SSH", 8),
        23: ("Telnet", 20),
        80: ("HTTP", 5),
        443: ("HTTPS", 3),
        445: ("SMB", 18),
        3306: ("MySQL", 14),
        3389: ("RDP", 18),
        502: ("Modbus SCADA", 25),
        104: ("IEC Grid", 25),
        20000: ("DNP3", 22)
    }

    def calculate_risk(self, ports, vulnerabilities):
        score = 0.0
        
        # 1. Base Score from Open Ports & Criticality
        open_ports_count = len([p for p in ports if p.get('state') == 'open'])
        score += min(open_ports_count * 4.0, 30.0)

        for port_info in ports:
            port_num = port_info.get('port')
            if port_num in self.CRITICAL_PORTS and port_info.get('state') == 'open':
                _, port_weight = self.CRITICAL_PORTS[port_num]
                score += port_weight

        # 2. Vulnerabilities Impact (CVSS Weighted)
        total_cvss = 0.0
        for vuln in vulnerabilities:
            cvss = vuln.get('cvss_score', 5.0)
            severity = vuln.get('severity', 'MEDIUM')
            
            if severity == 'CRITICAL':
                total_cvss += cvss * 3.5
            elif severity == 'HIGH':
                total_cvss += cvss * 2.5
            elif severity == 'MEDIUM':
                total_cvss += cvss * 1.5
            else:
                total_cvss += cvss * 1.0

        score += min(total_cvss, 45.0)

        # Normalize score between 0 and 100
        final_score = round(min(max(score, 5.0), 98.5), 1)

        # Classify Risk Category
        if final_score >= 80.0:
            risk_level = 'Critical'
        elif final_score >= 60.0:
            risk_level = 'High'
        elif final_score >= 35.0:
            risk_level = 'Medium'
        else:
            risk_level = 'Low'

        attack_categories = self.classify_attack_surface(ports, vulnerabilities)

        return {
            'risk_score': final_score,
            'risk_level': risk_level,
            'attack_categories': attack_categories
        }

    def classify_attack_surface(self, ports, vulnerabilities):
        categories = set()
        
        port_nums = [p.get('port') for p in ports if p.get('state') == 'open']
        vuln_descs = " ".join([v.get('description', '').lower() for v in vulnerabilities])

        # Classification logic
        if any(p in port_nums for p in [80, 443, 8080]):
            categories.add("Network Exposure")
            if "path traversal" in vuln_descs or "sql" in vuln_descs or "http" in vuln_descs:
                categories.add("Web Vulnerability")

        if any(p in port_nums for p in [21, 23]):
            categories.add("Weak Authentication")

        if "remote code execution" in vuln_descs or "rce" in vuln_descs or "arbitrary library" in vuln_descs:
            categories.add("Remote Code Execution")

        if any(p in port_nums for p in [3306, 5432, 27017, 1433]):
            categories.add("Database Exposure")

        if any(p in port_nums for p in [445, 3389]):
            categories.add("Information Disclosure")

        if any(p in port_nums for p in [502, 104, 20000]) or "modbus" in vuln_descs or "scada" in vuln_descs:
            categories.add("Critical Infrastructure Threat")

        if not categories:
            categories.add("Misconfiguration")

        return list(categories)
