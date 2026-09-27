from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class AdminUser(db.Model):
    """Privileged SOC operator accounts, stored separately from legacy users."""
    __tablename__ = 'admin_users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='admin')
    failed_login_attempts = db.Column(db.Integer, nullable=False, default=0)
    locked_until = db.Column(db.DateTime, nullable=True)
    last_login_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(
            password.encode('utf-8'), bcrypt.gensalt()
        ).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(
            password.encode('utf-8'), self.password_hash.encode('utf-8')
        )

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None,
        }

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='analyst') # admin, analyst
    organization = db.Column(db.String(100), default='Darkon Defense Operations')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'organization': self.organization,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Scan(db.Model):
    __tablename__ = 'scans'

    id = db.Column(db.Integer, primary_key=True)
    target = db.Column(db.String(255), nullable=False)
    scan_type = db.Column(db.String(50), default='Quick Discovery')
    status = db.Column(db.String(50), default='Completed')
    risk_score = db.Column(db.Float, default=0.0)
    risk_level = db.Column(db.String(20), default='Low')
    open_ports_count = db.Column(db.Integer, default=0)
    vulnerabilities_count = db.Column(db.Integer, default=0)
    os_detected = db.Column(db.String(100), default='Unknown / Linux')
    scan_duration = db.Column(db.Float, default=1.5)
    
    # Stored JSON objects as strings
    ports_json = db.Column(db.Text, default='[]')
    vulnerabilities_json = db.Column(db.Text, default='[]')
    ai_summary_json = db.Column(db.Text, default='{}')
    attack_categories_json = db.Column(db.Text, default='[]')
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'target': self.target,
            'scan_type': self.scan_type,
            'status': self.status,
            'risk_score': self.risk_score,
            'risk_level': self.risk_level,
            'open_ports_count': self.open_ports_count,
            'vulnerabilities_count': self.vulnerabilities_count,
            'os_detected': self.os_detected,
            'scan_duration': self.scan_duration,
            'ports': json.loads(self.ports_json or '[]'),
            'vulnerabilities': json.loads(self.vulnerabilities_json or '[]'),
            'ai_summary': json.loads(self.ai_summary_json or '{}'),
            'attack_categories': json.loads(self.attack_categories_json or '[]'),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'details': self.details,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }


class SectorSecurityEvent(db.Model):
    """
    Stores security events across all monitored sectors:
    Power Grid, Agriculture, Hospital, Education.
    """
    __tablename__ = 'sector_security_events'

    id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.String(50), unique=True, index=True)
    sector = db.Column(db.String(50), nullable=False, index=True)
    asset = db.Column(db.String(120), nullable=False)
    event = db.Column(db.String(150), nullable=False)
    severity = db.Column(db.String(20), nullable=False, index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    risk_score = db.Column(db.Float, nullable=False, default=0.0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    description = db.Column(db.Text, nullable=True)
    detected_activity = db.Column(db.Text, nullable=True)
    recommended_action = db.Column(db.Text, nullable=True)
    alert_status = db.Column(db.String(30), default='ACTIVE')  # ACTIVE, RESOLVED, ACKNOWLEDGED
    email_sent = db.Column(db.Boolean, default=False)
    details_json = db.Column(db.Text, default='{}')

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'incident_id': self.incident_id,
            'sector': self.sector,
            'asset': self.asset,
            'event': self.event,
            'severity': self.severity,
            'risk_score': self.risk_score,
            'timestamp': self.timestamp.strftime("%d %B %Y, %I:%M %p") if self.timestamp else None,
            'timestamp_iso': self.timestamp.isoformat() if self.timestamp else None,
            'description': self.description,
            'detected_activity': self.detected_activity,
            'recommended_action': self.recommended_action,
            'alert_status': self.alert_status,
            'email_sent': self.email_sent,
            'details': json.loads(self.details_json or '{}')
        }


class UnifiedAsset(db.Model):
    """
    Unified multi-sector cybersecurity asset model covering
    Power Grid, Agriculture, Hospital, and Education.
    """
    __tablename__ = 'unified_assets'

    id = db.Column(db.String(50), primary_key=True)
    asset_name = db.Column(db.String(150), nullable=False, index=True)
    sector = db.Column(db.String(50), nullable=False, index=True)  # Power Grid, Agriculture, Hospital, Education
    asset_type = db.Column(db.String(80), nullable=False)
    location = db.Column(db.String(150), nullable=True)
    district = db.Column(db.String(50), nullable=True, index=True)
    ip_address = db.Column(db.String(50), nullable=True)
    hostname = db.Column(db.String(100), nullable=True)
    criticality = db.Column(db.String(20), default='MEDIUM')  # CRITICAL, HIGH, MEDIUM, LOW
    status = db.Column(db.String(20), default='HEALTHY')      # HEALTHY, WARNING, DEGRADED, CRITICAL
    risk_score = db.Column(db.Float, default=15.0)
    last_seen = db.Column(db.String(50), nullable=True)
    protocol = db.Column(db.String(50), nullable=True)
    vendor = db.Column(db.String(80), nullable=True)
    model = db.Column(db.String(80), nullable=True)
    firmware = db.Column(db.String(50), nullable=True)
    open_ports_json = db.Column(db.Text, default='[]')
    vulnerabilities_json = db.Column(db.Text, default='[]')
    mitre_techniques_json = db.Column(db.Text, default='[]')
    extra_metadata_json = db.Column(db.Text, default='{}')

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'name': self.asset_name,
            'asset_name': self.asset_name,
            'sector': self.sector,
            'asset_type': self.asset_type,
            'location': self.location,
            'district': self.district,
            'ip_address': self.ip_address,
            'hostname': self.hostname,
            'criticality': self.criticality,
            'status': self.status,
            'risk_score': self.risk_score,
            'last_seen': self.last_seen,
            'protocol': self.protocol,
            'vendor': self.vendor,
            'model': self.model,
            'firmware': self.firmware,
            'open_ports': json.loads(self.open_ports_json or '[]'),
            'vulnerabilities': json.loads(self.vulnerabilities_json or '[]'),
            'associated_mitre_techniques': json.loads(self.mitre_techniques_json or '[]')
        }

