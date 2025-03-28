from flask import Flask

# Import blueprints
from .health import health_bp
from .upload import upload_bp
from .optimize import optimize_bp
from .download import download_bp

def register_routes(app: Flask):
    """Register all route blueprints with the Flask application"""
    app.register_blueprint(health_bp)
    app.register_blueprint(upload_bp)
    app.register_blueprint(optimize_bp)
    app.register_blueprint(download_bp) 