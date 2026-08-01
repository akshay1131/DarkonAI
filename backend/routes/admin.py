from flask import Blueprint, jsonify, request
from models import db, User, AuditLog
from config import Config
from routes.auth import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

@admin_bp.route('/logs', methods=['GET'])
@admin_required
def list_audit_logs():
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(20).all()
    return jsonify([l.to_dict() for l in logs]), 200

@admin_bp.route('/config', methods=['GET', 'POST'])
@admin_required
def manage_config():
    if request.method == 'POST':
        data = request.get_json() or {}
        if 'groq_api_key' in data: Config.GROQ_API_KEY = data['groq_api_key']
        if 'gemini_api_key' in data: Config.GEMINI_API_KEY = data['gemini_api_key']
        if 'openai_api_key' in data: Config.OPENAI_API_KEY = data['openai_api_key']
        return jsonify({'message': 'API Configurations updated successfully'}), 200

    return jsonify({
        'groq_configured': bool(Config.GROQ_API_KEY),
        'gemini_configured': bool(Config.GEMINI_API_KEY),
        'openai_configured': bool(Config.OPENAI_API_KEY),
        'database_uri': 'sqlite:///darkon.db',
        'nmap_installed': True
    }), 200
