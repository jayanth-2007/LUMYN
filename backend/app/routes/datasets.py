import os
import shutil
from flask import Blueprint, request, jsonify, current_app
from app.services.storage_service import StorageService
from app.services.dataset_service import DatasetService
from app.utils.security import MAX_UPLOAD_SIZE, is_allowed_file

datasets_bp = Blueprint("datasets", __name__)

def get_storage():
    return current_app.config["STORAGE_SERVICE"]

@datasets_bp.route("/datasets/upload", methods=["POST"])
def upload_dataset():
    if "file" not in request.files:
        return jsonify({"error": "No file part in request."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file."}), 400

    if not is_allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Only CSV and Excel (.xlsx, .xls) files are supported."}), 400

    storage: StorageService = get_storage()

    dataset_id = None
    try:
        # Save uploaded file
        dataset_id, file_path, orig_name, file_size, ext = storage.save_uploaded_file(file)

        if file_size > MAX_UPLOAD_SIZE:
            storage.delete_dataset(dataset_id)
            return jsonify({"error": f"File exceeds maximum allowed limit of {MAX_UPLOAD_SIZE // (1024*1024)} MB."}), 413

        # Profile basic metrics for dataset metadata
        df = DatasetService.load_dataframe(file_path)
        rows_count = len(df)
        cols_count = len(df.columns)
        columns_list = list(df.columns)

        meta = {
            "name": orig_name,
            "filename": os.path.basename(file_path),
            "storage_path": file_path,
            "size_bytes": file_size,
            "extension": ext,
            "rows": rows_count,
            "columns_count": cols_count,
            "columns": columns_list
        }

        saved_meta = storage.save_dataset_meta(dataset_id, meta)
        storage.log_activity("DATASET_UPLOADED", {
            "dataset_id": dataset_id,
            "name": orig_name,
            "rows": rows_count,
            "columns": cols_count
        })

        return jsonify({
            "message": "Dataset uploaded successfully.",
            "dataset": saved_meta
        }), 201

    except ValueError as ve:
        if dataset_id:
            storage.delete_dataset(dataset_id)
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        if dataset_id:
            storage.delete_dataset(dataset_id)
        return jsonify({"error": f"Failed to process file: {str(e)}"}), 400


@datasets_bp.route("/datasets", methods=["GET"])
def list_datasets():
    storage: StorageService = get_storage()
    datasets = storage.list_dataset_metas()
    return jsonify({"datasets": datasets, "total": len(datasets)}), 200


@datasets_bp.route("/datasets/<dataset_id>", methods=["GET"])
def get_dataset(dataset_id):
    storage: StorageService = get_storage()
    meta = storage.get_dataset_meta(dataset_id)
    if not meta:
        return jsonify({"error": "Dataset not found."}), 404
    return jsonify({"dataset": meta}), 200


@datasets_bp.route("/datasets/<dataset_id>/preview", methods=["GET"])
def preview_dataset(dataset_id):
    storage: StorageService = get_storage()
    try:
        file_path = storage.get_dataset_file_path(dataset_id)
    except FileNotFoundError:
        return jsonify({"error": "Dataset file missing from local storage."}), 404

    page = request.args.get("page", 1, type=int)
    page_size = request.args.get("page_size", 25, type=int)
    sort_by = request.args.get("sort_by", None, type=str)
    sort_dir = request.args.get("sort_dir", "asc", type=str)

    try:
        preview = DatasetService.get_preview(file_path, page=page, page_size=page_size, sort_by=sort_by, sort_dir=sort_dir)
        return jsonify(preview), 200
    except Exception as e:
        return jsonify({"error": f"Preview generation failed: {str(e)}"}), 500


@datasets_bp.route("/datasets/<dataset_id>/profile", methods=["GET"])
def profile_dataset(dataset_id):
    storage: StorageService = get_storage()
    try:
        file_path = storage.get_dataset_file_path(dataset_id)
    except FileNotFoundError:
        return jsonify({"error": "Dataset file missing from local storage."}), 404

    try:
        profile_data = DatasetService.profile_dataset(file_path)
        return jsonify({"profile": profile_data}), 200
    except Exception as e:
        return jsonify({"error": f"Profiling failed: {str(e)}"}), 500


@datasets_bp.route("/datasets/<dataset_id>", methods=["DELETE"])
def delete_dataset(dataset_id):
    storage: StorageService = get_storage()
    meta = storage.get_dataset_meta(dataset_id)
    if not meta:
        return jsonify({"error": "Dataset not found."}), 404

    success = storage.delete_dataset(dataset_id)
    return jsonify({"message": "Dataset deleted successfully.", "dataset_id": dataset_id, "success": success}), 200


def _get_or_create_sample_sales_csv(storage: StorageService) -> str:
    """Find sample_sales.csv across known locations, or generate it on the fly if missing."""
    candidate_paths = [
        os.path.abspath(os.path.join(storage.base_dir, "..", "sample_data", "sample_sales.csv")),
        os.path.abspath(os.path.join(storage.base_dir, "..", "..", "sample_data", "sample_sales.csv")),
        os.path.abspath(os.path.join(os.getcwd(), "sample_data", "sample_sales.csv")),
        os.path.abspath(os.path.join(os.getcwd(), "..", "sample_data", "sample_sales.csv")),
        os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "sample_data", "sample_sales.csv")),
        os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "..", "sample_data", "sample_sales.csv")),
    ]

    for path in candidate_paths:
        if os.path.exists(path) and os.path.getsize(path) > 100:
            return path

    # If file was deleted or not found, generate it reliably
    target_dir = os.path.abspath(os.path.join(storage.base_dir, "..", "sample_data"))
    os.makedirs(target_dir, exist_ok=True)
    generated_path = os.path.join(target_dir, "sample_sales.csv")

    import csv
    import random
    from datetime import datetime, timedelta

    products_by_category = {
        "Electronics": [
            ("Quantum Pro Laptop", 1299.99),
            ("Aura Wireless Headphones", 199.99),
            ("Lumyn 4K Monitor", 449.50),
            ("Ergo Mechanical Keyboard", 129.00),
            ("Precision Optical Mouse", 49.99),
            ("Smart Docking Station", 179.00),
        ],
        "Furniture": [
            ("Ergonomic Mesh Chair", 349.00),
            ("Motorized Standing Desk", 599.99),
            ("Acoustic Desk Privacy Screen", 89.00),
            ("Monitor Arm Dual Mount", 119.50),
            ("Hardwood Filing Cabinet", 210.00),
        ],
        "Office Supplies": [
            ("Ultra-Smooth Gel Pens (12pk)", 18.50),
            ("Premium Dotted Notebook", 24.00),
            ("Heavy-Duty Stapler Set", 32.00),
            ("Desk Cable Management Kit", 29.99),
            ("Dry Erase Whiteboard 36x24", 75.00),
        ],
        "Apparel": [
            ("Merino Wool Tech Hoodie", 120.00),
            ("Breathable Commuter Jacket", 165.00),
            ("Organic Cotton Team Polo", 45.00),
            ("Water-Resistant Laptop Backpack", 89.90),
        ]
    }

    regions = ["North America", "Europe", "Asia Pacific", "Latin America"]
    segments = ["Enterprise", "SMB", "Consumer"]
    start_date = datetime(2024, 1, 15)
    rows = []
    random.seed(42)

    for i in range(1, 301):
        order_id = f"ORD-{2024000 + i}"
        days_offset = random.randint(0, 365)
        order_date = (start_date + timedelta(days=days_offset)).strftime("%Y-%m-%d")
        category = random.choice(list(products_by_category.keys()))
        product, unit_price = random.choice(products_by_category[category])
        region = random.choice(regions)
        segment = random.choice(segments)
        
        if segment == "Enterprise":
            quantity = random.randint(3, 15)
        elif segment == "SMB":
            quantity = random.randint(2, 8)
        else:
            quantity = random.randint(1, 3)

        discount = random.choice([0.0, 0.05, 0.1, 0.15]) if quantity > 5 else 0.0
        revenue = round(quantity * unit_price * (1 - discount), 2)

        rows.append({
            "order_id": order_id,
            "order_date": order_date,
            "product": product,
            "category": category,
            "region": region,
            "quantity": quantity,
            "unit_price": unit_price,
            "revenue": revenue,
            "customer_segment": segment
        })

    rows.sort(key=lambda x: x["order_date"])

    with open(generated_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "order_id", "order_date", "product", "category", "region", 
            "quantity", "unit_price", "revenue", "customer_segment"
        ])
        writer.writeheader()
        writer.writerows(rows)

    return generated_path


@datasets_bp.route("/datasets/load-sample", methods=["POST"])
def load_sample_dataset():
    """Load the built-in demo dataset for instant exploration."""
    storage: StorageService = get_storage()
    try:
        sample_file = _get_or_create_sample_sales_csv(storage)

        dataset_id, file_path, orig_name, file_size, ext = storage.save_uploaded_file(
            sample_file,
            custom_id="ds_demo_sales",
            original_filename="sample_sales.csv"
        )

        df = DatasetService.load_dataframe(file_path)
        meta = {
            "name": "Global Retail Sales (Demo)",
            "filename": "sample_sales.csv",
            "storage_path": file_path,
            "size_bytes": file_size,
            "extension": ext,
            "rows": len(df),
            "columns_count": len(df.columns),
            "columns": list(df.columns),
            "is_demo": True
        }

        saved_meta = storage.save_dataset_meta(dataset_id, meta)
        storage.log_activity("DEMO_LOADED", {"dataset_id": dataset_id, "name": meta["name"]})

        return jsonify({
            "message": "Demo dataset loaded successfully.",
            "dataset": saved_meta
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to load sample dataset: {str(e)}"}), 500


@datasets_bp.route("/datasets/reset", methods=["POST"])
def reset_storage():
    """Safely clear local development data."""
    storage: StorageService = get_storage()
    storage.reset_all_data()
    return jsonify({"message": "All local development datasets and dashboards reset successfully."}), 200
