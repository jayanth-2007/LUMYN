from flask import Blueprint, request, jsonify, current_app
from app.services.storage_service import StorageService
from app.services.dashboard_generator import DashboardGenerator

dashboards_bp = Blueprint("dashboards", __name__)

def get_storage():
    return current_app.config["STORAGE_SERVICE"]

@dashboards_bp.route("/dashboards/generate", methods=["POST"])
def generate_dashboard():
    data = request.get_json() or {}
    dataset_id = data.get("dataset_id")
    if not dataset_id:
        return jsonify({"error": "dataset_id is required."}), 400

    storage: StorageService = get_storage()
    meta = storage.get_dataset_meta(dataset_id)
    if not meta:
        return jsonify({"error": "Dataset metadata not found."}), 404

    try:
        file_path = storage.get_dataset_file_path(dataset_id)
        dashboard_title = data.get("title") or f"{meta.get('name', 'Dataset')} Dashboard"
        generated_config = DashboardGenerator.generate(file_path, dataset_name=dashboard_title)
        generated_config["dataset_id"] = dataset_id
        generated_config["dataset_name"] = meta.get("name", "Dataset")

        return jsonify({"dashboard": generated_config}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to generate dashboard: {str(e)}"}), 500


@dashboards_bp.route("/dashboards", methods=["POST"])
def save_dashboard():
    data = request.get_json() or {}
    if not data or "title" not in data or "charts" not in data:
        return jsonify({"error": "Invalid dashboard payload. Title and charts are required."}), 400

    storage: StorageService = get_storage()
    saved = storage.save_dashboard(data)
    return jsonify({"message": "Dashboard saved successfully.", "dashboard": saved}), 201


@dashboards_bp.route("/dashboards", methods=["GET"])
def list_dashboards():
    storage: StorageService = get_storage()
    dashboards = storage.list_dashboards()
    return jsonify({"dashboards": dashboards, "total": len(dashboards)}), 200


@dashboards_bp.route("/dashboards/<dashboard_id>", methods=["GET"])
def get_dashboard(dashboard_id):
    storage: StorageService = get_storage()
    dash = storage.get_dashboard(dashboard_id)
    if not dash:
        return jsonify({"error": "Dashboard not found."}), 404
    return jsonify({"dashboard": dash}), 200


@dashboards_bp.route("/dashboards/<dashboard_id>", methods=["PATCH"])
def update_dashboard(dashboard_id):
    data = request.get_json() or {}
    storage: StorageService = get_storage()
    updated = storage.update_dashboard(dashboard_id, data)
    if not updated:
        return jsonify({"error": "Dashboard not found."}), 404
    return jsonify({"message": "Dashboard updated successfully.", "dashboard": updated}), 200


@dashboards_bp.route("/dashboards/<dashboard_id>", methods=["DELETE"])
def delete_dashboard(dashboard_id):
    storage: StorageService = get_storage()
    success = storage.delete_dashboard(dashboard_id)
    if not success:
        return jsonify({"error": "Dashboard not found or could not be deleted."}), 404
    return jsonify({"message": "Dashboard deleted successfully.", "dashboard_id": dashboard_id}), 200
