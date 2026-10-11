import os
import json
import shutil
from datetime import datetime
from app.utils.security import generate_id, sanitize_filename, validate_path_containment, is_allowed_file
from app.utils.serialization import safe_json_dumps, sanitize_data_for_json

class StorageService:
    def __init__(self, base_storage_dir=None):
        if base_storage_dir is None:
            # Default to backend/storage relative to current project layout
            curr_dir = os.path.dirname(os.path.abspath(__file__))
            self.base_dir = os.path.abspath(os.path.join(curr_dir, "..", "..", "storage"))
        else:
            self.base_dir = os.path.abspath(base_storage_dir)

        self.uploads_dir = os.path.join(self.base_dir, "uploads")
        self.metadata_dir = os.path.join(self.base_dir, "metadata")
        self.datasets_meta_dir = os.path.join(self.metadata_dir, "datasets")
        self.dashboards_meta_dir = os.path.join(self.metadata_dir, "dashboards")
        self.activity_dir = os.path.join(self.metadata_dir, "activity")

        self._ensure_directories()

    def _ensure_directories(self):
        for directory in [self.uploads_dir, self.datasets_meta_dir, self.dashboards_meta_dir, self.activity_dir]:
            os.makedirs(directory, exist_ok=True)

    def _atomic_write_json(self, file_path: str, data: dict):
        """Write JSON atomically using a temporary file and replace."""
        if not validate_path_containment(file_path, self.base_dir):
            raise PermissionError("Access outside storage boundary is disallowed.")

        temp_path = f"{file_path}.tmp_{os.getpid()}"
        clean_json_str = safe_json_dumps(data, indent=2)
        with open(temp_path, "w", encoding="utf-8") as f:
            f.write(clean_json_str)
            f.flush()
            os.fsync(f.fileno())
        os.replace(temp_path, file_path)

    def _read_json(self, file_path: str) -> dict:
        """Safely read and parse a JSON file."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        if not validate_path_containment(file_path, self.base_dir):
            raise PermissionError("Access outside storage boundary is disallowed.")

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            # Malformed JSON recovery
            return {"error": "Malformed JSON file", "raw_path": file_path, "details": str(e)}

    # --- Dataset Storage Methods ---

    def save_uploaded_file(self, file_storage, custom_id=None, original_filename=None):
        """Save an uploaded file using a secure internal ID."""
        orig_name = original_filename or getattr(file_storage, "filename", "unnamed.csv")
        clean_name = sanitize_filename(orig_name)
        _, ext = os.path.splitext(clean_name.lower())

        if not is_allowed_file(clean_name):
            raise ValueError(f"Invalid file extension '{ext}'. Only CSV and Excel (.xlsx, .xls) files are supported.")

        dataset_id = custom_id or generate_id("ds")
        target_filename = f"{dataset_id}{ext}"
        target_path = os.path.join(self.uploads_dir, target_filename)

        if hasattr(file_storage, "save"):
            file_storage.save(target_path)
        elif hasattr(file_storage, "read"):
            with open(target_path, "wb") as f:
                f.write(file_storage.read())
        elif isinstance(file_storage, (bytes, bytearray)):
            with open(target_path, "wb") as f:
                f.write(file_storage)
        elif isinstance(file_storage, str) and os.path.exists(file_storage):
            shutil.copy2(file_storage, target_path)
        else:
            raise ValueError("Unsupported file source format.")

        file_size = os.path.getsize(target_path)
        return dataset_id, target_path, orig_name, file_size, ext

    def get_dataset_file_path(self, dataset_id: str) -> str:
        """Retrieve path to raw uploaded file for dataset_id."""
        meta = self.get_dataset_meta(dataset_id)
        if not meta or "storage_path" not in meta:
            raise FileNotFoundError(f"Metadata for dataset '{dataset_id}' not found.")
        file_path = meta["storage_path"]
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File on disk missing for dataset '{dataset_id}'.")
        return file_path

    def save_dataset_meta(self, dataset_id: str, meta: dict):
        file_path = os.path.join(self.datasets_meta_dir, f"{dataset_id}.json")
        meta["id"] = dataset_id
        meta["updated_at"] = datetime.utcnow().isoformat()
        if "created_at" not in meta:
            meta["created_at"] = meta["updated_at"]
        self._atomic_write_json(file_path, meta)
        return meta

    def get_dataset_meta(self, dataset_id: str) -> dict:
        file_path = os.path.join(self.datasets_meta_dir, f"{dataset_id}.json")
        if not os.path.exists(file_path):
            return None
        return self._read_json(file_path)

    def list_dataset_metas(self) -> list:
        datasets = []
        if not os.path.exists(self.datasets_meta_dir):
            return datasets
        for fname in os.listdir(self.datasets_meta_dir):
            if fname.endswith(".json") and not fname.endswith(".tmp"):
                fpath = os.path.join(self.datasets_meta_dir, fname)
                try:
                    data = self._read_json(fpath)
                    if isinstance(data, dict) and "id" in data and "error" not in data:
                        datasets.append(data)
                except Exception:
                    continue
        # Sort newest first
        datasets.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return datasets

    def delete_dataset(self, dataset_id: str) -> bool:
        """Delete uploaded file and its metadata JSON."""
        deleted = False
        meta = self.get_dataset_meta(dataset_id)
        if meta and "storage_path" in meta and os.path.exists(meta["storage_path"]):
            try:
                os.remove(meta["storage_path"])
                deleted = True
            except OSError:
                pass

        meta_path = os.path.join(self.datasets_meta_dir, f"{dataset_id}.json")
        if os.path.exists(meta_path):
            try:
                os.remove(meta_path)
                deleted = True
            except OSError:
                pass

        self.log_activity("DATASET_DELETED", {"dataset_id": dataset_id, "name": meta.get("name") if meta else "Unknown"})
        return deleted

    # --- Dashboard Storage Methods ---

    def save_dashboard(self, dashboard: dict) -> dict:
        dash_id = dashboard.get("id") or generate_id("dash")
        dashboard["id"] = dash_id
        dashboard["updated_at"] = datetime.utcnow().isoformat()
        if "created_at" not in dashboard:
            dashboard["created_at"] = dashboard["updated_at"]

        file_path = os.path.join(self.dashboards_meta_dir, f"{dash_id}.json")
        self._atomic_write_json(file_path, dashboard)
        self.log_activity("DASHBOARD_SAVED", {"dashboard_id": dash_id, "title": dashboard.get("title")})
        return dashboard

    def get_dashboard(self, dashboard_id: str) -> dict:
        file_path = os.path.join(self.dashboards_meta_dir, f"{dashboard_id}.json")
        if not os.path.exists(file_path):
            return None
        return self._read_json(file_path)

    def list_dashboards(self) -> list:
        dashboards = []
        if not os.path.exists(self.dashboards_meta_dir):
            return dashboards
        for fname in os.listdir(self.dashboards_meta_dir):
            if fname.endswith(".json") and not fname.endswith(".tmp"):
                fpath = os.path.join(self.dashboards_meta_dir, fname)
                try:
                    data = self._read_json(fpath)
                    if isinstance(data, dict) and "id" in data and "error" not in data:
                        dashboards.append(data)
                except Exception:
                    continue
        dashboards.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
        return dashboards

    def update_dashboard(self, dashboard_id: str, updates: dict) -> dict:
        dash = self.get_dashboard(dashboard_id)
        if not dash:
            return None
        dash.update(updates)
        dash["updated_at"] = datetime.utcnow().isoformat()
        file_path = os.path.join(self.dashboards_meta_dir, f"{dashboard_id}.json")
        self._atomic_write_json(file_path, dash)
        self.log_activity("DASHBOARD_UPDATED", {"dashboard_id": dashboard_id, "title": dash.get("title")})
        return dash

    def delete_dashboard(self, dashboard_id: str) -> bool:
        file_path = os.path.join(self.dashboards_meta_dir, f"{dashboard_id}.json")
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                self.log_activity("DASHBOARD_DELETED", {"dashboard_id": dashboard_id})
                return True
            except OSError:
                return False
        return False

    # --- Activity & Overview Methods ---

    def log_activity(self, action: str, details: dict):
        log_file = os.path.join(self.activity_dir, "events.json")
        events = []
        if os.path.exists(log_file):
            try:
                events = self._read_json(log_file)
                if not isinstance(events, list):
                    events = []
            except Exception:
                events = []

        new_event = {
            "id": generate_id("act"),
            "action": action,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        }
        events.insert(0, new_event)
        # Retain last 100 events
        events = events[:100]
        try:
            self._atomic_write_json(log_file, events)
        except Exception:
            pass

    def get_recent_activities(self, limit=10) -> list:
        log_file = os.path.join(self.activity_dir, "events.json")
        if not os.path.exists(log_file):
            return []
        try:
            events = self._read_json(log_file)
            return events[:limit] if isinstance(events, list) else []
        except Exception:
            return []

    def get_overview_stats(self) -> dict:
        datasets = self.list_dataset_metas()
        dashboards = self.list_dashboards()
        total_rows = sum(d.get("rows", 0) for d in datasets)

        return {
            "dataset_count": len(datasets),
            "total_rows_analyzed": total_rows,
            "saved_dashboards_count": len(dashboards),
            "recent_datasets": datasets[:5],
            "recent_dashboards": dashboards[:5],
            "recent_activity": self.get_recent_activities(8),
            "storage_mode": "File-Based (No Database)",
            "auth_status": "Development Demo Session"
        }

    def reset_all_data(self):
        """Safe reset of all uploaded datasets, metadata, and dashboards."""
        for folder in [self.uploads_dir, self.datasets_meta_dir, self.dashboards_meta_dir, self.activity_dir]:
            if os.path.exists(folder):
                for item in os.listdir(folder):
                    if item == ".gitkeep":
                        continue
                    item_path = os.path.join(folder, item)
                    try:
                        if os.path.isfile(item_path):
                            os.remove(item_path)
                        elif os.path.isdir(item_path):
                            shutil.rmtree(item_path)
                    except OSError:
                        pass
        self._ensure_directories()
        self.log_activity("SYSTEM_RESET", {"message": "All local data reset by user."})
        return True
