from datetime import datetime, timedelta
from functools import wraps

from flask import Blueprint, current_app, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from models import db, AdminUser, AuditLog

auth_bp = Blueprint('auth', __name__)
limiter = Limiter(key_func=get_remote_address)


def current_admin():
    try:
        return AdminUser.query.get(int(get_jwt_identity()))
    except (TypeError, ValueError):
        return None


def admin_required(view):
    """Require a valid JWT belonging to an active SOC administrator."""
    @wraps(view)
    @jwt_required()
    def wrapped(*args, **kwargs):
        admin = current_admin()
        if not admin or admin.role != 'admin':
            return jsonify({'error': 'Administrator access required'}), 403
        return view(*args, **kwargs)
    return wrapped

@auth_bp.route('/register', methods=['POST'])
def register():
    return jsonify({'error': 'Self-registration is disabled for this SOC platform'}), 403

@auth_bp.route('/login', methods=['POST'])
@limiter.limit('5 per minute')
def login():
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    admin = AdminUser.query.filter_by(username=username).first()
    now = datetime.utcnow()
    if admin and admin.locked_until and admin.locked_until > now:
        return jsonify({'error': 'Account temporarily locked. Try again later.'}), 423

    if not admin or not admin.check_password(password):
        if admin:
            admin.failed_login_attempts += 1
            if admin.failed_login_attempts >= current_app.config['MAX_LOGIN_ATTEMPTS']:
                admin.locked_until = now + timedelta(
                    minutes=current_app.config['LOGIN_LOCKOUT_MINUTES']
                )
                admin.failed_login_attempts = 0
            db.session.add(AuditLog(
                user_id=admin.id,
                action='FAILED_LOGIN',
                details=f'Failed login attempt from {get_remote_address()}'
            ))
            db.session.commit()
        return jsonify({'error': 'Invalid credentials'}), 401

    admin.failed_login_attempts = 0
    admin.locked_until = None
    admin.last_login_at = now
    db.session.add(AuditLog(
        user_id=admin.id,
        action='SUCCESSFUL_LOGIN',
        details=f'SOC administrator login from {get_remote_address()}'
    ))
    db.session.commit()
    access_token = create_access_token(identity=str(admin.id), additional_claims={'role': admin.role})
    return jsonify({
        'token': access_token,
        'user': admin.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user = current_admin()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200
