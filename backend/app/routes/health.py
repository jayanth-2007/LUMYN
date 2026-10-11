from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "LUMYN Analytics API",
        "version": "1.0.0",
        "storage": "File-based JSON & Uploads (Zero Database)",
        "database": None
    }), 200
