import os
from datetime import timedelta

# Auto-load .env file from backend or root directory if present
def _load_env_file():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    candidates = [
        os.path.join(base_dir, '.env'),
        os.path.join(os.path.dirname(base_dir), '.env')
    ]
    for env_path in candidates:
        if os.path.isfile(env_path):
            try:
                with open(env_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            key, val = line.split('=', 1)
                            key = key.strip()
                            val = val.strip().strip("'\"")
                            if key and key not in os.environ:
                                os.environ[key] = val
            except Exception:
                pass

_load_env_file()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "darkon-cyber-secret-key-2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "darkon-jwt-secret-key-super-secure")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    JWT_TOKEN_LOCATION = ['headers']
    # bcrypt digest for the initial darkon.ai account. Deployments can replace it
    # with DARKON_ADMIN_PASSWORD_HASH without ever placing a password in source.
    DARKON_ADMIN_PASSWORD_HASH = os.getenv(
        "DARKON_ADMIN_PASSWORD_HASH",
        "$2b$12$HlJDWeNbAPicLGtykJJIz.og6/4zr9O9D3hYkYp6umZg1klrZ/k/K"
    )

    # Authentication abuse controls. Override these in the deployment environment
    # when a stricter SOC policy is required.
    MAX_LOGIN_ATTEMPTS = int(os.getenv("MAX_LOGIN_ATTEMPTS", "5"))
    LOGIN_LOCKOUT_MINUTES = int(os.getenv("LOGIN_LOCKOUT_MINUTES", "15"))
    RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
    RATELIMIT_HEADERS_ENABLED = True
    
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'darkon.db')}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # AI API Keys
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

    # Multi-Sector Alert & Email Notifications
    ALERT_EMAIL = os.getenv("ALERT_EMAIL", "akshayjoji0@gmail.com")
    EMAIL_HOST = os.getenv("EMAIL_HOST", os.getenv("SMTP_SERVER", "smtp.gmail.com"))
    EMAIL_PORT = int(os.getenv("EMAIL_PORT", os.getenv("SMTP_PORT", 587)))
    EMAIL_USERNAME = os.getenv("EMAIL_USERNAME", os.getenv("SMTP_USER", ""))
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", os.getenv("SMTP_PASS", ""))

