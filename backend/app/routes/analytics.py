from flask import Blueprint, request, jsonify, current_app
from app.services.storage_service import StorageService
from app.services.nlp_query_engine import NLPQueryEngine
from app.services.dashboard_generator import DashboardGenerator

analytics_bp = Blueprint("analytics", __name__)

def get_storage():
    return current_app.config["STORAGE_SERVICE"]

@analytics_bp.route("/analytics/query", methods=["POST"])
def query_analytics():
    data = request.get_json() or {}
    dataset_id = data.get("dataset_id")
    query_str = data.get("query")

    if not dataset_id or not query_str:
        return jsonify({"error": "dataset_id and query are required."}), 400

    storage: StorageService = get_storage()
    try:
        file_path = storage.get_dataset_file_path(dataset_id)
    except FileNotFoundError:
        return jsonify({"error": "Dataset file missing."}), 404

    try:
        result = NLPQueryEngine.answer_query(file_path, query_str)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": f"Query execution failed: {str(e)}"}), 500


@analytics_bp.route("/chat", methods=["POST"])
def chat_analytics():
    data = request.get_json() or {}
    dataset_id = data.get("dataset_id")
    message = data.get("message")

    if not dataset_id or not message:
        return jsonify({"error": "dataset_id and message are required."}), 400

    storage: StorageService = get_storage()
    try:
        file_path = storage.get_dataset_file_path(dataset_id)
    except FileNotFoundError:
        return jsonify({"error": "Dataset file missing."}), 404

    try:
        result = NLPQueryEngine.answer_query(file_path, message)
        storage.log_activity("AI_CHAT_QUERY", {"dataset_id": dataset_id, "query": message[:60]})
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": f"Chat failed: {str(e)}"}), 500


@analytics_bp.route("/datasets/<dataset_id>/insights", methods=["GET"])
def get_insights(dataset_id):
    storage: StorageService = get_storage()
    try:
        file_path = storage.get_dataset_file_path(dataset_id)
    except FileNotFoundError:
        return jsonify({"error": "Dataset file missing."}), 404

    try:
        suggested_questions = NLPQueryEngine.get_suggested_questions(file_path)
        dashboard_meta = DashboardGenerator.generate(file_path)
        return jsonify({
            "suggested_questions": suggested_questions,
            "insights": dashboard_meta.get("insights", []),
            "quality_score": dashboard_meta.get("quality_score", 95)
        }), 200
    except Exception as e:
        return jsonify({"error": f"Insights generation failed: {str(e)}"}), 500


@analytics_bp.route("/overview/stats", methods=["GET"])
def get_overview_stats():
    storage: StorageService = get_storage()
    stats = storage.get_overview_stats()
    return jsonify(stats), 200
