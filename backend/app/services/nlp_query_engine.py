import os
import re
import pandas as pd
import numpy as np
from app.services.dataset_service import DatasetService
from app.utils.serialization import sanitize_data_for_json

class NLPQueryEngine:
    @classmethod
    def get_suggested_questions(cls, file_path: str) -> list:
        """Generate smart context-aware sample questions for the dataset."""
        df = DatasetService.load_dataframe(file_path)
        profile = DatasetService.profile_dataset(file_path)
        num_cols = profile.get("numeric_columns", [])
        cat_cols = profile.get("categorical_columns", [])
        date_cols = profile.get("date_columns", [])

        questions = [
            "What are the key summary statistics of this dataset?",
            "Are there any missing values or duplicates?"
        ]

        # Metric-specific questions
        if num_cols:
            primary_num = num_cols[0]
            for col in num_cols:
                if any(k in col.lower() for k in ["revenue", "sales", "amount", "profit", "price"]):
                    primary_num = col
                    break
            clean_num_title = primary_num.replace('_', ' ')
            questions.append(f"What is the total and average {clean_num_title}?")

            if cat_cols:
                clean_cat = cat_cols[0].replace('_', ' ')
                questions.append(f"Which {clean_cat} has the highest {clean_num_title}?")
                questions.append(f"Compare {clean_num_title} across {clean_cat}s.")

            if date_cols:
                questions.append(f"What is the monthly trend for {clean_num_title}?")

        if cat_cols and len(cat_cols) > 1:
            questions.append(f"How is data distributed across {cat_cols[1].replace('_', ' ')}?")

        return questions[:6]

    @classmethod
    def answer_query(cls, file_path: str, query: str) -> dict:
        """Process a natural language query deterministically, with fallback to LLM if configured."""
        df = DatasetService.load_dataframe(file_path)
        query_clean = query.strip()
        q_lower = query_clean.lower()

        # Step 1: Detect deterministic intent and execute safely
        deterministic_res = cls._execute_deterministic(df, q_lower, query_clean)

        # Step 2: If LLM is configured via environment and query was ambiguous or conversational, try LLM enhancement
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key and (deterministic_res is None or deterministic_res.get("confidence") == "low"):
            try:
                llm_res = cls._query_llm_safely(df, query_clean, openai_key)
                if llm_res:
                    return llm_res
            except Exception:
                pass

        if deterministic_res:
            return deterministic_res

        # Fallback response for unparsed question
        return {
            "answer": f"I couldn't identify a specific aggregation or column for '{query_clean}'. Try asking about totals, averages, comparisons across categories (e.g., 'Compare revenue by category'), or time trends.",
            "source": "deterministic_engine",
            "confidence": "low",
            "table_data": None,
            "chart_suggestion": None
        }

    @classmethod
    def _execute_deterministic(cls, df: pd.DataFrame, q: str, raw_query: str) -> dict:
        """Safely parse intent without executing arbitrary code."""
        profile = DatasetService.profile_dataset_from_df(df)
        num_cols = profile["numeric"]
        cat_cols = profile["categorical"]
        date_cols = profile["date"]

        # 1. Missing values & data health query
        if any(w in q for w in ["missing", "null", "blank", "nan", "duplicate", "clean", "quality"]):
            missing_total = int(df.isna().sum().sum())
            dupes = int(df.duplicated().sum())
            missing_by_col = df.isna().sum()
            col_missing_text = ", ".join([f"{c} ({v})" for c, v in missing_by_col.items() if v > 0])
            if not col_missing_text:
                col_missing_text = "No columns have missing values."

            ans = f"Dataset Health Check: There are {missing_total} missing values and {dupes} duplicate rows across {len(df):,} total records. Details: {col_missing_text}"
            return {
                "answer": ans,
                "source": "deterministic_engine",
                "confidence": "high",
                "table_data": [{"Metric": "Total Records", "Value": len(df)},
                               {"Metric": "Missing Values", "Value": missing_total},
                               {"Metric": "Duplicate Rows", "Value": dupes}],
                "chart_suggestion": None
            }

        # 2. Key summary statistics
        if any(w in q for w in ["summary", "overview", "describe", "statistics", "profile"]):
            desc = df.describe().round(2).reset_index()
            records = desc.to_dict(orient="records")
            return {
                "answer": f"Here is the statistical summary of numerical columns across {len(df):,} records.",
                "source": "deterministic_engine",
                "confidence": "high",
                "table_data": sanitize_data_for_json(records),
                "chart_suggestion": None
            }

        # Match columns mentioned in query
        matched_num = None
        for col in num_cols:
            col_tokens = re.findall(r'\w+', col.lower())
            if any(token in q for token in col_tokens) or col.lower() in q:
                matched_num = col
                break
        # Common synonym matching
        if not matched_num:
            if "sale" in q or "revenue" in q or "income" in q:
                for col in num_cols:
                    if any(k in col.lower() for k in ["revenue", "sales", "amount", "total"]):
                        matched_num = col
                        break
            elif "price" in q or "cost" in q:
                for col in num_cols:
                    if any(k in col.lower() for k in ["price", "cost", "unit_price"]):
                        matched_num = col
                        break
            elif "quantity" in q or "units" in q or "volume" in q:
                for col in num_cols:
                    if any(k in col.lower() for k in ["quantity", "qty", "units"]):
                        matched_num = col
                        break
        if not matched_num and num_cols:
            matched_num = num_cols[0]

        matched_cat = None
        for col in cat_cols:
            col_tokens = re.findall(r'\w+', col.lower())
            if any(token in q for token in col_tokens) or col.lower() in q:
                matched_cat = col
                break
        # Category synonyms only if relevant word in query
        if not matched_cat:
            if "category" in q:
                for col in cat_cols:
                    if "category" in col.lower():
                        matched_cat = col
                        break
            elif any(w in q for w in ["region", "country", "location", "city"]):
                for col in cat_cols:
                    if any(k in col.lower() for k in ["region", "country", "location", "city"]):
                        matched_cat = col
                        break
            elif any(w in q for w in ["segment", "customer"]):
                for col in cat_cols:
                    if any(k in col.lower() for k in ["segment", "customer"]):
                        matched_cat = col
                        break

        # 3. Average / Mean query (Higher precedence before general grouping)
        if any(w in q for w in ["average", "avg", "mean"]) and not any(w in q for w in ["by ", "per ", "across "]) and matched_num:
            avg_val = float(df[matched_num].mean())
            min_val = float(df[matched_num].min())
            max_val = float(df[matched_num].max())
            ans = f"The average {matched_num.replace('_', ' ')} is {avg_val:,.2f} (ranging from {min_val:,.2f} to {max_val:,.2f})."
            return {
                "answer": ans,
                "source": "deterministic_engine",
                "confidence": "high",
                "table_data": [{"Metric": f"Average {matched_num}", "Value": round(avg_val, 2)},
                               {"Metric": f"Min {matched_num}", "Value": round(min_val, 2)},
                               {"Metric": f"Max {matched_num}", "Value": round(max_val, 2)}],
                "chart_suggestion": None
            }

        # 4. Total / Sum query (without grouping)
        if any(w in q for w in ["total", "sum", "overall"]) and not any(w in q for w in ["by ", "per ", "across "]) and matched_num:
            tot_val = float(df[matched_num].sum())
            ans = f"The overall total for {matched_num.replace('_', ' ')} is {tot_val:,.2f} across all {len(df):,} rows."
            return {
                "answer": ans,
                "source": "deterministic_engine",
                "confidence": "high",
                "table_data": [{"Metric": f"Total {matched_num}", "Value": round(tot_val, 2)}],
                "chart_suggestion": None
            }

        # 5. Monthly / Date Trend Query
        if any(w in q for w in ["trend", "monthly", "over time", "timeline", "by month", "annual", "daily"]) and date_cols and matched_num:
            date_col = date_cols[0]
            temp = df[[date_col, matched_num]].dropna().copy()
            temp[date_col] = pd.to_datetime(temp[date_col], errors="coerce")
            temp = temp.dropna().sort_values(by=date_col)
            temp["month"] = temp[date_col].dt.strftime("%Y-%m")
            grouped = temp.groupby("month")[matched_num].sum().reset_index()
            records = [{"Date": r["month"], matched_num.replace('_', ' ').title(): round(float(r[matched_num]), 2)} for _, r in grouped.iterrows()]

            total_val = grouped[matched_num].sum()
            avg_val = grouped[matched_num].mean()
            ans = f"Monthly trend for {matched_num.replace('_', ' ').title()} across {len(grouped)} periods. Total: {total_val:,.2f}, Average per period: {avg_val:,.2f}."

            chart = {
                "type": "line",
                "title": f"Monthly {matched_num.replace('_', ' ').title()} Trend",
                "x_key": "Date",
                "y_keys": [matched_num.replace('_', ' ').title()],
                "data": records
            }
            return {
                "answer": ans,
                "source": "deterministic_engine",
                "confidence": "high",
                "table_data": sanitize_data_for_json(records),
                "chart_suggestion": chart
            }

        # 6. Grouping / Comparison across Category
        target_cat = matched_cat or (cat_cols[0] if (cat_cols and any(w in q for w in ["compare", "highest", "top", "best", "lowest", "by", "per", "across", "breakdown", "which", "distribution"])) else None)
        if target_cat and matched_num:
            is_highest = any(w in q for w in ["highest", "top", "best", "most", "maximum", "max"])
            is_lowest = any(w in q for w in ["lowest", "bottom", "least", "worst", "minimum", "min"])

            grouped = df.groupby(target_cat)[matched_num].agg(["sum", "mean", "count"]).reset_index()
            grouped.columns = [target_cat, "Total", "Average", "Count"]

            if is_lowest:
                grouped = grouped.sort_values(by="Total", ascending=True)
            else:
                grouped = grouped.sort_values(by="Total", ascending=False)

            top_row = grouped.iloc[0]
            top_name = str(top_row[target_cat])
            top_val = float(top_row["Total"])

            records = [
                {
                    target_cat.replace('_', ' ').title(): str(r[target_cat]),
                    f"Total {matched_num.replace('_', ' ').title()}": round(float(r["Total"]), 2),
                    "Average": round(float(r["Average"]), 2),
                    "Count": int(r["Count"])
                }
                for _, r in grouped.iterrows()
            ]

            chart_data = [{"label": str(r[target_cat]), "value": round(float(r["Total"]), 2)} for _, r in grouped.head(10).iterrows()]
            chart = {
                "type": "bar",
                "title": f"{matched_num.replace('_', ' ').title()} by {target_cat.replace('_', ' ').title()}",
                "x_key": "label",
                "y_keys": ["value"],
                "data": chart_data
            }

            superlative = "highest" if not is_lowest else "lowest"
            ans = f"In terms of {matched_num.replace('_', ' ').title()}, '{top_name}' has the {superlative} volume at {top_val:,.2f} across {len(grouped)} unique {target_cat.replace('_', ' ')} segments."

            return {
                "answer": ans,
                "source": "deterministic_engine",
                "confidence": "high",
                "table_data": sanitize_data_for_json(records),
                "chart_suggestion": chart
            }

        # 5. Average / Mean query
        if any(w in q for w in ["average", "avg", "mean"]) and matched_num:
            avg_val = float(df[matched_num].mean())
            min_val = float(df[matched_num].min())
            max_val = float(df[matched_num].max())
            ans = f"The average {matched_num.replace('_', ' ')} is {avg_val:,.2f} (ranging from {min_val:,.2f} to {max_val:,.2f})."
            return {
                "answer": ans,
                "source": "deterministic_engine",
                "confidence": "high",
                "table_data": [{"Metric": f"Average {matched_num}", "Value": round(avg_val, 2)},
                               {"Metric": f"Min {matched_num}", "Value": round(min_val, 2)},
                               {"Metric": f"Max {matched_num}", "Value": round(max_val, 2)}],
                "chart_suggestion": None
            }

        # 6. Total / Sum query
        if any(w in q for w in ["total", "sum", "overall"]) and matched_num:
            tot_val = float(df[matched_num].sum())
            ans = f"The overall total for {matched_num.replace('_', ' ')} is {tot_val:,.2f} across all {len(df):,} rows."
            return {
                "answer": ans,
                "source": "deterministic_engine",
                "confidence": "high",
                "table_data": [{"Metric": f"Total {matched_num}", "Value": round(tot_val, 2)}],
                "chart_suggestion": None
            }

        # 7. Count / How many rows
        if any(w in q for w in ["how many", "count", "number of rows", "number of orders", "number of records"]):
            ans = f"The dataset contains a total of {len(df):,} records and {len(df.columns)} columns."
            return {
                "answer": ans,
                "source": "deterministic_engine",
                "confidence": "high",
                "table_data": [{"Total Records": len(df), "Total Columns": len(df.columns)}],
                "chart_suggestion": None
            }

        return None

    @classmethod
    def _query_llm_safely(cls, df: pd.DataFrame, query: str, api_key: str):
        """Optional LLM query using OpenAI SDK if available and configured. Never executes code."""
        try:
            import openai
            client = openai.OpenAI(api_key=api_key)
            schema_summary = {
                "columns": list(df.columns),
                "dtypes": {c: str(df[c].dtype) for c in df.columns},
                "row_count": len(df),
                "numeric_summary": df.describe().round(2).to_dict()
            }
            system_prompt = (
                "You are LUMYN AI, an analytical assistant. You explain dataset insights clearly and concisely. "
                "You do not write Python or SQL code to execute. Based on the dataset summary provided, "
                "answer the user's question directly with factual conclusions."
            )
            response = client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Dataset metadata: {str(schema_summary)[:1500]}\n\nQuestion: {query}"}
                ],
                max_tokens=250,
                temperature=0.2
            )
            text_answer = response.choices[0].message.content.strip()
            return {
                "answer": text_answer,
                "source": "ai_assisted",
                "confidence": "high",
                "table_data": None,
                "chart_suggestion": None
            }
        except Exception:
            return None

# Helper method on DatasetService for fast column detection
def _profile_dataset_from_df(df: pd.DataFrame) -> dict:
    numeric = []
    categorical = []
    dates = []
    for col in df.columns:
        s = df[col]
        if pd.api.types.is_numeric_dtype(s):
            numeric.append(col)
        elif pd.api.types.is_datetime64_any_dtype(s) or "date" in col.lower() or "time" in col.lower():
            dates.append(col)
        else:
            categorical.append(col)
    return {"numeric": numeric, "categorical": categorical, "date": dates}

DatasetService.profile_dataset_from_df = staticmethod(_profile_dataset_from_df)
