# LUMYN — AI Dashboard Generator (Database-Free MVP)

> **Tagline:** Upload your data. Ask questions. Get an intelligent dashboard.

**LUMYN** is an AI-powered analytics SaaS platform where users upload CSV or Excel files, automatically synthesize interactive visual dashboards, explore statistical data profiles, and ask analytical questions in natural language.

---

## 🌟 Zero-Database Architectural Guarantee

**LUMYN does not require or use any database (No PostgreSQL, MySQL, SQLite, MongoDB, etc.).**

- **Dataset Storage:** Raw uploaded CSV and Excel files are stored locally in `backend/storage/uploads/` identified by generated secure UUIDs.
- **Metadata & Dashboards:** Schemas, analytical profiles, and dashboard configurations are saved as clean JSON files in `backend/storage/metadata/`.
- **Atomic Operations:** All metadata writes use atomic temporary writes and replacement to prevent corruption.
- **Deterministic Analytics Engine:** Natural-language queries are answered using Pandas and NumPy calculations with zero arbitrary code execution risk and zero hallucination. An external AI API key is completely optional.

---

## 🚀 Windows 11 Quick Start Guide

Follow these exact steps to run LUMYN on Windows 11.

### Prerequisites

1. **Python 3.10+**: Download from [python.org](https://www.python.org/) (ensure **"Add Python to PATH"** is checked during setup).
2. **Node.js (v18+) & npm**: Download from [nodejs.org](https://nodejs.org/).

Verify in PowerShell or Command Prompt:
```powershell
python --version
node --version
npm --version
```

---

### Step 1: Clone or Navigate to the Project

```powershell
cd c:\Users\Asus\OneDrive\Documents\lumynnn
```

---

### Step 2: Set Up Python Backend

1. Navigate to the backend directory:
   ```powershell
   cd backend
   ```

2. *(Optional but recommended)* Create and activate a virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
   *(If PowerShell displays an execution policy error, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`)*

3. Install backend dependencies:
   ```powershell
   python -m pip install -r requirements.txt
   ```

4. *(Optional)* Configure environment variables:
   ```powershell
   cp .env.example .env
   ```
   *Note: `OPENAI_API_KEY` is completely optional. The built-in deterministic engine answers questions without any API key.*

5. Start the Flask backend server:
   ```powershell
   python run.py
   ```
   You will see:
   ```
   =======================================================
     LUMYN Backend Server running on http://127.0.0.1:5000
     Storage Mode: File-based JSON & Uploads (NO DATABASE)
   =======================================================
   ```

---

### Step 3: Set Up React Frontend

Open a **second PowerShell terminal** in the project root:

1. Navigate to the frontend directory:
   ```powershell
   cd frontend
   ```

2. Install frontend dependencies:
   ```powershell
   npm install
   ```

3. Start the Vite React development server:
   ```powershell
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 📊 Exploring Features & Workflows

### 1. Instant Demo Exploration
- On the landing page (`http://localhost:5173`), click **"Explore Demo"** or click **"Load Demo Sales Data"** in the sidebar.
- This immediately loads `sample_data/sample_sales.csv` (300 orders across Electronics, Furniture, Office Supplies, and Apparel) into local storage.

### 2. Upload Your Own Dataset
- Navigate to **"Upload Dataset"** (`/app/upload`).
- Drag-and-drop any CSV or Excel file (`.xlsx`, `.xls`) up to **25 MB**.
- Watch real-time upload progress and schema validation.

### 3. Deep Statistical Profiling
- Go to **"Dataset Explorer"** (`/app/explorer`).
- View total row counts, column types, completeness scores (0–100), duplicate detection, and missing percentages.
- Inspect numerical statistics: mean, median, standard deviation, IQR, and automatic outlier detection.
- Explore the interactive **Pearson correlation heatmap**.
- Browse paginated rows and click **"Export CSV"**.

### 4. Automatic Dashboard Generation
- Open **"Auto Dashboard"** (`/app/dashboard`).
- LUMYN automatically chooses the most meaningful visualizations:
  - KPI summary metrics (Total Revenue, Average Order Value, Top Segment)
  - Chronological time-series line charts
  - Categorical volume breakdown bar charts
  - Proportion pie & donut charts
  - Bivariate scatter correlation plots
  - Value frequency distribution histograms
  - Dynamic AI narrative insights
- Filter by category or segment in real-time.
- Click **"Save Dashboard"** to persist the configuration to `backend/storage/metadata/dashboards/`.
- Click **"Printable View"** for presentation and export.

### 5. Natural Language AI Data Chat
- Navigate to **"AI Data Chat"** (`/app/chat`).
- Click any suggested prompt or ask natural questions:
  - *"What are the main trends in this dataset?"*
  - *"Which category has the highest revenue?"*
  - *"What is the average revenue?"*
  - *"Are there missing values?"*
  - *"Compare revenue by category"*
  - *"Show monthly sales trends"*
- Answers are computed in real-time by the deterministic analytics engine with zero hallucination.

### 6. Library & Data Management
- Go to **"Library"** (`/app/library`) to search, rename, reopen, or delete saved dashboards and datasets.

### 7. Resetting Local Development Storage
- Click **"Reset Data"** in the bottom left of the sidebar, or call `POST /api/v1/datasets/reset`.
- This safely cleans out uploaded files and JSON metadata while preserving directory structure.

---

## 🧪 Running Automated Tests

Run the backend test suite from the repository root:

```powershell
python -m pytest backend/tests -v
```

This verifies:
- Health check endpoint
- CSV and XLSX uploads
- 25 MB size limits & invalid file rejection
- Paginated dataset preview
- Deep statistical profiling & IQR outlier detection
- Automatic dashboard generation & JSON persistence
- Dashboard renaming (PATCH) and deletion (DELETE)
- Deterministic NLP queries (counts, sums, averages, rankings, monthly trends)
- Missing file and malformed data handling
- Overview metrics calculation

To test the frontend production build:
```powershell
cd frontend
npm run build
```

---

## 🛠️ Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **Port 5000 is in use** | Set `PORT=5001` in `backend/.env` and update `VITE_API_URL=http://127.0.0.1:5001/api/v1` in `frontend/.env`. |
| **CORS errors** | Ensure Flask is running. Flask-CORS is enabled by default for all `/api/*` endpoints. |
| **Execution Policy Error in PowerShell** | Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` to allow activating Python virtual environments. |
| **Excel files fail to read** | Ensure `openpyxl` is installed via `pip install openpyxl`. |
| **Resetting storage** | Click "Reset Data" in the sidebar footer to clear all test files cleanly. |

---

## 🔒 Security Notice

This application is designed for local single-tenant development. File-based JSON storage persists across server restarts on your local machine, but is not intended as a multi-user production database. Full authentication and cloud persistence can be integrated in later phases.
"# LUMYN" 
