# LUMYN Architecture & Technical Specification

## 1. Architectural Philosophy: Zero-Database Design

LUMYN is purposefully engineered as a database-free MVP. Instead of requiring PostgreSQL, MySQL, SQLite, or MongoDB, LUMYN utilizes a hardened file-based storage architecture:

```
lumyn/
├── backend/
│   ├── storage/
│   │   ├── uploads/               # Raw uploaded CSV / XLSX files (named by UUID)
│   │   └── metadata/
│   │       ├── datasets/          # Schema, rows, column profiling metadata JSON
│   │       ├── dashboards/        # Saved dashboard layout and chart JSON
│   │       └── activity/          # System events and audit log JSON
```

### Key Storage Guarantees:
- **UUID Keys**: Raw uploaded files are stored under internal identifiers (e.g. `ds_a83f910e12.csv`) to prevent path collision and traversal.
- **Path Traversal Protection**: All file access undergoes containment validation (`validate_path_containment`), ensuring no read or write escapes the designated storage boundary.
- **Atomic JSON Writes**: Metadata modifications are written first to `.tmp_<pid>` files, flushed to disk with `os.fsync()`, and atomically swapped using `os.replace()` to prevent corrupted or partial writes.
- **25 MB Upload Limit**: Upload streams are strictly bound to a 25 MB ceiling with HTTP 413 rejection.

---

## 2. Analytics & Profiling Pipeline

```
   Raw CSV / XLSX File
           │
           ▼
   Pandas DataFrame Loader (utf-8 / latin-1 / openpyxl)
           │
     ┌─────┴────────────────────────────┐
     ▼                                  ▼
Data Profiling                     Automatic Dashboard Synthesis
- Data type inference              - High-value KPI extraction
- Missing cell metrics             - Chronological time-series detection
- IQR outlier computation (1.5x)   - Categorical breakdown (Bar / Donut)
- Pearson correlation matrix       - Bivariate scatter correlation
- Completeness scoring (0-100)     - Metric distribution histogram
```

---

## 3. Deterministic NLP Engine (Zero Hallucination)

LUMYN eliminates the safety risks and hallucination issues of running LLM-generated Python or SQL code directly on user machines.

Instead, the deterministic engine:
1. **Parses User Intent**: Identifies operations (`sum`, `average`, `count`, `compare`, `trend`, `outliers`, `missing`).
2. **Performs Schema & Column Resolution**: Employs token and synonym matching against the dataset schema (e.g., "sales" $\to$ `revenue`, "region" $\to$ `region`).
3. **Executes Pure Pandas Calculations**: Direct in-memory operations on the active DataFrame.
4. **Returns Structured Responses**: Natural language summary, exact scalar or tabular results, and dynamic chart specifications for instant rendering in chat.
5. **Optional LLM Fallback**: If `OPENAI_API_KEY` is provided, optional LLM explanations can augment the deterministic results without ever executing unvetted code.
