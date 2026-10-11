import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from app.services.storage_service import StorageService
from app.routes.health import health_bp
from app.routes.datasets import datasets_bp
from app.routes.dashboards import dashboards_bp
from app.routes.analytics import analytics_bp

load_dotenv()


def create_app(storage_dir=None):
    app = Flask(__name__)

    # Configurable limits and storage
    app.config["MAX_CONTENT_LENGTH"] = 25 * 1024 * 1024  # 25MB max
    storage = StorageService(base_storage_dir=storage_dir)
    app.config["STORAGE_SERVICE"] = storage

    # CORS configuration for frontend dev
    CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "PATCH", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]}})

    @app.after_request
    def set_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        return response

    # Register blueprints under /api/v1
    app.register_blueprint(health_bp, url_prefix="/api/v1")
    app.register_blueprint(datasets_bp, url_prefix="/api/v1")
    app.register_blueprint(dashboards_bp, url_prefix="/api/v1")
    app.register_blueprint(analytics_bp, url_prefix="/api/v1")

    # Centralized JSON error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Bad request", "message": getattr(error, 'description', str(error))}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found", "message": getattr(error, 'description', str(error))}), 404

    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({"error": "File size exceeds limit (max 25MB allowed)."}), 413

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({"error": "Internal server error", "message": "An unexpected error occurred."}), 500

    return app
