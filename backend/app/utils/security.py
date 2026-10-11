import os
import uuid
import re

ALLOWED_EXTENSIONS = {'.csv', '.xlsx', '.xls'}
MAX_UPLOAD_SIZE = 25 * 1024 * 1024  # 25 MB


def generate_id(prefix=""):
    """Generate a clean UUID-based identifier."""
    raw = uuid.uuid4().hex[:12]
    return f"{prefix}_{raw}" if prefix else raw


def is_allowed_file(filename: str) -> bool:
    """Validate file extension."""
    if not filename:
        return False
    _, ext = os.path.splitext(filename.lower())
    return ext in ALLOWED_EXTENSIONS


def sanitize_filename(filename: str) -> str:
    """Sanitize display filename to prevent directory traversal and weird characters."""
    base = os.path.basename(filename)
    clean = re.sub(r'[^a-zA-Z0-9_.-]', '_', base)
    return clean[:120] if clean else "unnamed_file"


def validate_path_containment(child_path: str, base_dir: str) -> bool:
    """Ensure child path resolves inside base_dir to prevent directory traversal."""
    abs_child = os.path.abspath(child_path)
    abs_base = os.path.abspath(base_dir)
    return abs_child.startswith(abs_base)


def sanitize_for_csv_cell(value):
    """Prevent CSV formula injection by prepending apostrophe to dangerous leading characters."""
    if isinstance(value, str) and value.startswith(('=', '+', '-', '@', '\t', '\r')):
        return f"'{value}"
    return value
