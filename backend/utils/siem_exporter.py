import socket
import json
import logging
from datetime import datetime

class SIEMExporter:
    """
    Enterprise SIEM & Syslog Export Engine.
    Converts Darkon AI vulnerability scan events into:
    - Common Event Format (CEF) for Micro Focus Arcsight, QRadar, Splunk
    - Structured JSON logs for Elastic (ELK) / Datadog
    - Direct UDP/TCP Syslog socket forwarding
    """
    def __init__(self, syslog_host=None, syslog_port=514, protocol='UDP'):
        self.syslog_host = syslog_host
        self.syslog_port = syslog_port
        self.protocol = protocol.upper()

    def format_cef_event(self, scan_data):
        """
        Formats scan result into ArcSight Common Event Format (CEF):
        CEF:Version|Device Vendor|Device Product|Device Version|Signature ID|Name|Severity|Extension
        """
        device_vendor = "DarkonAI"
        device_product = "SOC-Cyber-Engine"
        device_version = "2.0"
        signature_id = "SCAN_AUDIT_COMPLETE"
        name = f"Security Audit for {scan_data.get('target')}"
        
        # Map Severity to 0-10 scale
        risk_score = scan_data.get('risk_score', 0)
        severity = str(int(min(max(risk_score / 10, 1), 10)))

        extensions = [
            f"dst={scan_data.get('target')}",
            f"riskScore={risk_score}",
            f"riskLevel={scan_data.get('risk_level')}",
            f"openPorts={scan_data.get('open_ports_count')}",
            f"cveCount={scan_data.get('vulnerabilities_count')}",
            f"osDetected={scan_data.get('os_detected')}",
            f"cat={','.join(scan_data.get('attack_categories', []))}"
        ]

        cef_string = f"CEF:0|{device_vendor}|{device_product}|{device_version}|{signature_id}|{name}|{severity}|{' '.join(extensions)}"
        return cef_string

    def format_json_event(self, scan_data):
        """Formats scan result into SIEM JSON Schema"""
        return {
            "@timestamp": datetime.utcnow().isoformat() + "Z",
            "event": {
                "kind": "alert",
                "category": ["network", "vulnerability"],
                "type": ["info", "indicator"],
                "outcome": "success"
            },
            "observer": {
                "vendor": "Darkon AI",
                "product": "Cybersecurity SOC Platform",
                "version": "2.0"
            },
            "destination": {
                "ip_or_host": scan_data.get('target'),
                "os_name": scan_data.get('os_detected')
            },
            "darkon": {
                "scan_id": scan_data.get('id'),
                "risk_score": scan_data.get('risk_score'),
                "risk_level": scan_data.get('risk_level'),
                "open_ports_count": scan_data.get('open_ports_count'),
                "vulnerabilities_count": scan_data.get('vulnerabilities_count'),
                "attack_categories": scan_data.get('attack_categories', []),
                "matched_cves": [v.get('cve_id') for v in scan_data.get('vulnerabilities', [])]
            }
        }

    def send_syslog_message(self, message):
        """Sends CEF or JSON syslog message over UDP or TCP socket"""
        if not self.syslog_host:
            return False, "No Syslog host configured."

        try:
            sock_type = socket.SOCK_DGRAM if self.protocol == 'UDP' else socket.SOCK_STREAM
            with socket.socket(socket.AF_INET, sock_type) as s:
                s.settimeout(3.0)
                if self.protocol == 'TCP':
                    s.connect((self.syslog_host, self.syslog_port))
                    s.sendall((message + "\n").encode('utf-8'))
                else:
                    s.sendto(message.encode('utf-8'), (self.syslog_host, self.syslog_port))
            return True, "Syslog message dispatched successfully."
        except Exception as e:
            return False, f"Syslog forwarding failed: {str(e)}"
