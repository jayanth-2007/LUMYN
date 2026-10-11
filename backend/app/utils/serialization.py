import json
import math
import numpy as np
import pandas as pd
from datetime import date, datetime


class LumynJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder handling NumPy scalars, arrays, Pandas Timestamps, and NaN values."""
    def default(self, obj):
        if isinstance(obj, (np.integer, np.int64, np.int32, np.int16, np.int8)):
            return int(obj)
        elif isinstance(obj, (np.floating, np.float64, np.float32, np.float16)):
            if np.isnan(obj) or np.isinf(obj):
                return None
            return float(obj)
        elif isinstance(obj, np.bool_):
            return bool(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, (datetime, date, pd.Timestamp)):
            return obj.isoformat()
        elif pd.isna(obj):
            return None
        return super().default(obj)


def sanitize_data_for_json(data):
    """Recursively clean dicts/lists to convert NaN/inf to None and numpy types to python natives."""
    if isinstance(data, dict):
        return {k: sanitize_data_for_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_data_for_json(v) for v in data]
    elif isinstance(data, (float, np.floating)):
        if math.isnan(data) or math.isinf(data):
            return None
        return round(float(data), 4) if round(float(data), 4) == data else float(data)
    elif isinstance(data, (np.integer, np.int64, np.int32)):
        return int(data)
    elif isinstance(data, np.bool_):
        return bool(data)
    elif isinstance(data, (datetime, date, pd.Timestamp)):
        return data.isoformat()
    elif pd.isna(data):
        return None
    return data


def safe_json_dumps(obj, indent=None):
    """Safe json dumps with custom encoder."""
    clean_obj = sanitize_data_for_json(obj)
    return json.dumps(clean_obj, cls=LumynJSONEncoder, indent=indent)
