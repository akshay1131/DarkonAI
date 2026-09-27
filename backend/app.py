import os
import threading
import time
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter.errors import RateLimitExceeded

from config import Config
from models import db, User, Scan, AuditLog, AdminUser
from routes.auth import auth_bp, limiter
from routes.scan import scan_bp
from routes.dashboard import dashboard_bp
from routes.powergrid import powergrid_bp
from routes.admin import admin_bp
from routes.siem import siem_bp
from routes.ai_agents import ai_agents_bp
from routes.incident import incident_bp
from routes.sectors import sectors_bp
from utils.sector_simulator import sector_engine


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    jwt = JWTManager(app)
    limiter.init_app(app)
    db.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(scan_bp, url_prefix='/api/scan')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(powergrid_bp, url_prefix='/api/power-grid')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(siem_bp, url_prefix='/api/siem')
    app.register_blueprint(ai_agents_bp, url_prefix='/api/ai')
    app.register_blueprint(incident_bp, url_prefix='/api/incident')
    app.register_blueprint(sectors_bp, url_prefix='/api/sectors')

    # Direct convenient aliases for sectors, heatmap, and alerts
    @app.route('/api/agriculture', methods=['GET'])
    def ag_alias():
        return jsonify(sector_engine.get_sector_data('agriculture')), 200

    @app.route('/api/hospital', methods=['GET'])
    def hosp_alias():
        return jsonify(sector_engine.get_sector_data('hospital')), 200

    @app.route('/api/education', methods=['GET'])
    def edu_alias():
        return jsonify(sector_engine.get_sector_data('education')), 200

    @app.route('/api/heatmap', methods=['GET'])
    def heatmap_alias():
        return jsonify(sector_engine.get_heatmap_data()), 200

    @app.route('/api/alerts', methods=['GET'])
    def alerts_alias():
        return jsonify(sector_engine.get_alerts()), 200

    @jwt.unauthorized_loader
    def missing_token(message):
        return jsonify({'error': 'Authentication required', 'message': message}), 401

    @jwt.invalid_token_loader
    def invalid_token(message):
        return jsonify({'error': 'Invalid authentication token', 'message': message}), 401

    @jwt.expired_token_loader
    def expired_token(_jwt_header, _jwt_payload):
        return jsonify({'error': 'Authentication token has expired'}), 401

    @app.errorhandler(RateLimitExceeded)
    def rate_limit_exceeded(_error):
        return jsonify({'error': 'Too many requests. Please wait before trying again.'}), 429

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({
            'status': 'online', 
            'platform': 'Darkon AI Multi-Sector Cyber SOC & Kerala Smart Grid Digital Twin v2.5',
            'monitored_sectors': ['Power Grid', 'Agriculture', 'Hospital', 'Education'],
            'total_assets': 328,
            'power_grid_assets': 252,
            'agriculture_assets': 26,
            'hospital_assets': 25,
            'education_assets': 25
        }), 200

    with app.app_context():
        db.create_all()
        seed_initial_data()
        # Start multi-sector autonomous background simulation
        sector_engine.start_background_monitoring(app)

    return app


def seed_initial_data():
    if not AdminUser.query.filter_by(username='darkon.ai').first():
        # The initial credential is supplied as a bcrypt digest, never plaintext.
        soc_admin = AdminUser(
            username='darkon.ai',
            password_hash=Config.DARKON_ADMIN_PASSWORD_HASH,
            role='admin'
        )
        db.session.add(soc_admin)
        db.session.commit()

    if User.query.count() == 0:
        admin_user = User(
            username='admin',
            email='akshayjoji0@gmail.com',
            role='admin',
            organization='Kerala Smart Grid SLDC SOC Command'
        )
        admin_user.set_password('admin123')
        db.session.add(admin_user)
        db.session.commit()

app = create_app()

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    )
