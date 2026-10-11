import os
import math
import pandas as pd
import numpy as np
from app.utils.serialization import sanitize_data_for_json

class DatasetService:
    @staticmethod
    def load_dataframe(file_path: str) -> pd.DataFrame:
        """Load CSV or Excel (.xlsx, .xls) file into a pandas DataFrame with comprehensive error handling."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found on disk: {file_path}")

        _, ext = os.path.splitext(file_path.lower())
        df = None

        if ext == ".csv":
            encodings_to_try = ["utf-8", "latin-1", "cp1252", "iso-8859-1"]
            for enc in encodings_to_try:
                try:
                    df = pd.read_csv(file_path, encoding=enc)
                    break
                except UnicodeDecodeError:
                    continue
                except Exception:
                    continue

            if df is None:
                # Fallback to python engine with delimiter detection
                try:
                    df = pd.read_csv(file_path, sep=None, engine="python", encoding="latin-1")
                except Exception as e:
                    raise ValueError(f"Unable to parse CSV file: {str(e)}. Please check file formatting.")

        elif ext == ".xlsx":
            try:
                df = pd.read_excel(file_path, engine="openpyxl")
            except Exception as e:
                raise ValueError(f"Unable to parse Excel (.xlsx) file: {str(e)}. Please ensure file is a valid Excel workbook.")

        elif ext == ".xls":
            try:
                df = pd.read_excel(file_path, engine="xlrd")
            except Exception:
                try:
                    df = pd.read_excel(file_path)
                except Exception as e:
                    raise ValueError(f"Unable to parse Excel (.xls) file: {str(e)}. Please convert to .xlsx or .csv.")

        else:
            raise ValueError(f"Unsupported file format '{ext}'. Only .csv, .xlsx, and .xls files are supported.")

        if df is None or df.empty:
            raise ValueError("The uploaded dataset contains no rows or readable tabular records.")

        # Clean column names (strip whitespace and ensure string labels)
        df.columns = [str(c).strip() for c in df.columns]
        return df

    @classmethod
    def get_preview(cls, file_path: str, page: int = 1, page_size: int = 25, sort_by: str = None, sort_dir: str = "asc") -> dict:
        """Return paginated preview of dataset."""
        df = cls.load_dataframe(file_path)
        total_rows = len(df)
        total_cols = len(df.columns)

        if sort_by and sort_by in df.columns:
            ascending = (sort_dir.lower() != "desc")
            df = df.sort_values(by=sort_by, ascending=ascending)

        start_idx = max(0, (page - 1) * page_size)
        end_idx = min(total_rows, start_idx + page_size)
        sliced_df = df.iloc[start_idx:end_idx]

        # Convert to records
        records = sliced_df.to_dict(orient="records")
        clean_records = sanitize_data_for_json(records)

        return {
            "page": page,
            "page_size": page_size,
            "total_rows": total_rows,
            "total_cols": total_cols,
            "total_pages": math.ceil(total_rows / page_size) if page_size > 0 else 1,
            "columns": list(df.columns),
            "data": clean_records
        }

    @classmethod
    def profile_dataset(cls, file_path: str) -> dict:
        """Generate comprehensive data profiling statistics using Pandas and NumPy."""
        df = cls.load_dataframe(file_path)
        total_rows = len(df)
        total_cols = len(df.columns)

        if total_rows == 0:
            return {
                "rows": 0,
                "columns_count": total_cols,
                "column_names": list(df.columns),
                "columns": {},
                "correlations": {},
                "duplicate_rows": 0,
                "quality_score": 0,
                "summary": "Dataset is empty."
            }

        duplicate_rows = int(df.duplicated().sum())

        column_profiles = {}
        numeric_cols = []
        date_cols = []
        categorical_cols = []

        total_missing_cells = 0
        total_cells = total_rows * total_cols
        total_outliers = 0

        for col in df.columns:
            series = df[col]
            missing_count = int(series.isna().sum())
            missing_pct = round((missing_count / total_rows) * 100, 2)
            total_missing_cells += missing_count

            # Type detection
            inferred_type = "string"
            is_date = False

            # Check if numeric
            if pd.api.types.is_numeric_dtype(series):
                # Distinguish boolean or id
                if pd.api.types.is_bool_dtype(series) or series.dropna().isin([0, 1]).all() and series.nunique() <= 2:
                    inferred_type = "boolean"
                elif "id" in col.lower() or series.nunique() == total_rows:
                    inferred_type = "identifier"
                    numeric_cols.append(col)
                else:
                    inferred_type = "numeric"
                    numeric_cols.append(col)

            # Check if date/time
            elif pd.api.types.is_datetime64_any_dtype(series):
                inferred_type = "datetime"
                is_date = True
                date_cols.append(col)
            else:
                # Try string date parsing heuristic if object
                sample_valid = series.dropna().head(20)
                if len(sample_valid) > 0 and ("date" in col.lower() or "time" in col.lower() or "year" in col.lower() or "day" in col.lower()):
                    try:
                        parsed_dates = pd.to_datetime(sample_valid, errors="coerce")
                        if parsed_dates.notna().sum() / len(sample_valid) > 0.8:
                            inferred_type = "datetime"
                            is_date = True
                            date_cols.append(col)
                    except Exception:
                        pass

                if not is_date:
                    unique_count = series.nunique()
                    if unique_count <= 50 or (unique_count / total_rows < 0.2):
                        inferred_type = "categorical"
                        categorical_cols.append(col)
                    else:
                        inferred_type = "text"

            col_info = {
                "name": col,
                "type": inferred_type,
                "missing_count": missing_count,
                "missing_percentage": missing_pct,
                "unique_count": int(series.nunique())
            }

            # Numerical statistics
            if inferred_type in ["numeric", "identifier"]:
                clean_s = series.dropna()
                if len(clean_s) > 0:
                    mean_val = float(clean_s.mean())
                    std_val = float(clean_s.std()) if len(clean_s) > 1 else 0.0
                    min_val = float(clean_s.min())
                    max_val = float(clean_s.max())
                    median_val = float(clean_s.median())
                    q25 = float(clean_s.quantile(0.25))
                    q75 = float(clean_s.quantile(0.75))
                    iqr = q75 - q25
                    lower_bound = q25 - 1.5 * iqr
                    upper_bound = q75 + 1.5 * iqr
                    outliers_series = clean_s[(clean_s < lower_bound) | (clean_s > upper_bound)]
                    outlier_count = int(len(outliers_series))
                    total_outliers += outlier_count

                    skewness = float(clean_s.skew()) if len(clean_s) > 2 else 0.0

                    col_info["stats"] = {
                        "mean": round(mean_val, 4),
                        "std": round(std_val, 4),
                        "min": round(min_val, 4),
                        "max": round(max_val, 4),
                        "median": round(median_val, 4),
                        "q25": round(q25, 4),
                        "q75": round(q75, 4),
                        "iqr": round(iqr, 4),
                        "outlier_count": outlier_count,
                        "skewness": round(skewness, 3)
                    }

            # Categorical statistics
            elif inferred_type in ["categorical", "boolean"]:
                clean_s = series.dropna().astype(str)
                val_counts = clean_s.value_counts().head(10)
                col_info["stats"] = {
                    "top_values": [{"label": k, "count": int(v), "percentage": round((v / total_rows) * 100, 2)}
                                   for k, v in val_counts.items()]
                }

            # Datetime statistics
            elif inferred_type == "datetime":
                try:
                    dt_series = pd.to_datetime(series, errors="coerce").dropna()
                    if len(dt_series) > 0:
                        min_dt = dt_series.min()
                        max_dt = dt_series.max()
                        col_info["stats"] = {
                            "min_date": str(min_dt)[:10],
                            "max_date": str(max_dt)[:10],
                            "days_span": int((max_dt - min_dt).days)
                        }
                except Exception:
                    pass

            column_profiles[col] = col_info

        # Correlations for numeric columns (top 15 to keep response efficient)
        correlations = {}
        valid_num_cols = [c for c in numeric_cols if c in df.columns and df[c].nunique() > 1][:12]
        if len(valid_num_cols) >= 2:
            try:
                corr_matrix = df[valid_num_cols].corr(method="pearson").round(3)
                for c1 in valid_num_cols:
                    correlations[c1] = {}
                    for c2 in valid_num_cols:
                        val = corr_matrix.loc[c1, c2]
                        correlations[c1][c2] = None if pd.isna(val) else float(val)
            except Exception:
                correlations = {}

        # Data quality score calculation (0 - 100)
        missing_rate = (total_missing_cells / total_cells) if total_cells > 0 else 0
        duplicate_rate = (duplicate_rows / total_rows) if total_rows > 0 else 0
        outlier_rate = (total_outliers / total_cells) if total_cells > 0 else 0

        quality_score = 100 - (missing_rate * 40) - (duplicate_rate * 30) - (min(outlier_rate * 100, 30))
        quality_score = max(10, min(100, round(quality_score)))

        return {
            "rows": total_rows,
            "columns_count": total_cols,
            "column_names": list(df.columns),
            "columns": column_profiles,
            "numeric_columns": numeric_cols,
            "categorical_columns": categorical_cols,
            "date_columns": date_cols,
            "duplicate_rows": duplicate_rows,
            "missing_cells": total_missing_cells,
            "missing_percentage": round((total_missing_cells / total_cells) * 100, 2) if total_cells > 0 else 0,
            "quality_score": quality_score,
            "correlations": correlations
        }
