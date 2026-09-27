import smtplib
import os
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders


class EmailNotifier:
    """
    Configurable SMTP Email Alert System.
    Dispatches automated Incident Reports (with PDF/JSON attachments) to configured SOC Administrator.
    """
    def __init__(self, smtp_server=None, smtp_port=None, smtp_user=None, smtp_pass=None):
        self.smtp_server = smtp_server or os.getenv("EMAIL_HOST") or os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(smtp_port or os.getenv("EMAIL_PORT") or os.getenv("SMTP_PORT", 587))
        self.smtp_user = smtp_user or os.getenv("EMAIL_USERNAME") or os.getenv("SMTP_USER", "")
        self.smtp_pass = smtp_pass or os.getenv("EMAIL_PASSWORD") or os.getenv("SMTP_PASS", "")
        self.alert_recipient = os.getenv("ALERT_EMAIL", "akshayjoji0@gmail.com")


    def send_incident_alert_email(self, recipient_email="akshayjoji0@gmail.com", incident_data=None, pdf_path=None):
        recipient = recipient_email or "akshayjoji0@gmail.com"
        incident = incident_data or {
            "incident_id": "INC-2026-99412",
            "threat_type": "Unauthorized Modbus/TCP Write Attempt",
            "severity": "CRITICAL",
            "target_asset_name": "Kalamassery SLDC Programmable Logic Controller",
            "risk_score": 94.5
        }

        subject = f"[DARKON AI CRITICAL ALERT] Incident {incident.get('incident_id')} - {incident.get('threat_type')}"
        
        body_text = f"""
        ====================================================
        DARKON AI | CRITICAL INFRASTRUCTURE SOC ALERT
        ====================================================
        
        Incident ID: {incident.get('incident_id')}
        Timestamp: {incident.get('timestamp', '2026-07-27 18:30 UTC')}
        Severity: {incident.get('severity')} (Risk Score: {incident.get('risk_score')}/100)
        
        Affected Asset: {incident.get('target_asset_name')}
        District: {incident.get('target_district', 'Kerala Grid')}
        Threat Category: {incident.get('category', 'SCADA Vulnerability')}
        Protocol: {incident.get('protocol', 'Modbus TCP')}
        Source IP: {incident.get('source_ip', '192.168.1.100')}
        
        ----------------------------------------------------
        DARKON AI MULTI-AGENT SUMMARY
        ----------------------------------------------------
        An unauthorized operational command execution attempt was intercepted targeting SCADA control logic. 
        Multi-agent reasoning has isolated the threat and recommended immediate IP block and firewall ACL enforcement.
        
        Recommended Actions:
        1. Block source IP {incident.get('source_ip')} on Industrial Firewall.
        2. Isolate PLC communication interface.
        3. Enforce MFA & IP Whitelisting for Port 502 / Port 104.
        
        Attached: Full Technical PDF Audit Report.
        ====================================================
        Darkon AI Cyber Defense Command Center
        """

        msg = MIMEMultipart()
        msg['From'] = self.smtp_user or "soc-alerts@darkon.ai"
        msg['To'] = recipient
        msg['Subject'] = subject
        msg.attach(MIMEText(body_text, 'plain'))

        # Attach PDF if available
        if pdf_path and os.path.exists(pdf_path):
            try:
                with open(pdf_path, "rb") as attachment:
                    part = MIMEBase("application", "octet-stream")
                    part.set_payload(attachment.read())
                encoders.encode_base64(part)
                part.add_header("Content-Disposition", f"attachment; filename={os.path.basename(pdf_path)}")
                msg.attach(part)
            except Exception as e:
                print(f"[EmailNotifier] Attachment error: {e}")

        # Try SMTP dispatch if credentials configured, otherwise preview log
        if self.smtp_user and self.smtp_pass:
            try:
                server = smtplib.SMTP(self.smtp_server, self.smtp_port)
                server.starttls()
                server.login(self.smtp_user, self.smtp_pass)
                server.send_message(msg)
                server.quit()
                return True, f"Alert email dispatched to {recipient}"
            except Exception as e:
                return False, f"SMTP Error: {str(e)}"
        else:
            print(f"[EmailNotifier Simulator] Configured recipient: {recipient}. SMTP credentials not set; email payload generated cleanly.")
            return True, f"Simulated alert email dispatched successfully to {recipient}"

    def send_sector_alert_email(self, event_data, recipient_email=None):
        """
        Dispatches multi-sector security alert email to configured SOC administrator.
        Fulfills DARKON AI requirement for immediate automated email reporting on HIGH and CRITICAL events.
        """
        recipient = recipient_email or self.alert_recipient or "akshayjoji0@gmail.com"
        
        sector = event_data.get('sector', 'Unknown Sector')
        asset = event_data.get('asset', 'Critical Node')
        event = event_data.get('event', 'Security Anomaly')
        severity = event_data.get('severity', 'HIGH').upper()
        risk_score = event_data.get('risk_score', 85.0)
        timestamp = event_data.get('timestamp') or datetime.utcnow().strftime("%d %B %Y, %I:%M %p")
        description = event_data.get('description', 'A high-risk security anomaly was intercepted.')
        detected_activity = event_data.get('detected_activity', description)
        recommended_action = event_data.get('recommended_action', 'Investigate the affected system and isolate it if required.')

        subject = f"DARKON AI SECURITY ALERT - [{severity}] {sector}: {event}"

        body_text = f"""DARKON AI SECURITY ALERT
Sector: {sector}
Asset: {asset}
Event: {event}
Severity: {severity}
Risk Score: {risk_score}/100
Timestamp: {timestamp}
Description: {description}
Detected Activity: {detected_activity}
Recommended Action: {recommended_action}

====================================================
Darkon AI Autonomous Multi-Sector SOC Defense System
Kerala Cyber Command Operations
====================================================
"""

        msg = MIMEMultipart()
        msg['From'] = self.smtp_user or "soc-alerts@darkon.ai"
        msg['To'] = recipient
        msg['Subject'] = subject
        msg.attach(MIMEText(body_text, 'plain'))

        if self.smtp_user and self.smtp_pass:
            try:
                server = smtplib.SMTP(self.smtp_server, self.smtp_port)
                server.starttls()
                server.login(self.smtp_user, self.smtp_pass)
                server.send_message(msg)
                server.quit()
                print(f"[EmailNotifier] Security alert email successfully delivered to {recipient} via SMTP.")
                return True, f"Alert email dispatched to {recipient}"
            except Exception as e:
                print(f"[EmailNotifier] SMTP Delivery Error: {e}. Fallback to simulated delivery log.")
                return False, f"SMTP Error: {str(e)}"
        else:
            print(f"[EmailNotifier Simulation Log]\nTo: {recipient}\n{body_text}")
            return True, f"Simulated alert email dispatched successfully to {recipient}"

