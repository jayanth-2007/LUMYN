import io
import json
import pandas as pd
import pytest

def test_health_endpoint(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"
    assert data["storage"] == "File-based JSON & Uploads (Zero Database)"
    assert data["database"] is None

def test_csv_upload_and_preview(client):
    csv_content = (
        "order_id,product,category,revenue,quantity\n"
        "1,Laptop,Electronics,1200,2\n"
        "2,Chair,Furniture,300,1\n"
        "3,Headphones,Electronics,150,3\n"
    )
    data = {
        "file": (io.BytesIO(csv_content.encode("utf-8")), "orders.csv")
    }
    res = client.post("/api/v1/datasets/upload", data=data, content_type="multipart/form-data")
    assert res.status_code == 201
    res_data = res.get_json()
    assert "dataset" in res_data
    dataset_id = res_data["dataset"]["id"]
    assert res_data["dataset"]["rows"] == 3
    assert res_data["dataset"]["columns_count"] == 5

    # Test preview
    preview_res = client.get(f"/api/v1/datasets/{dataset_id}/preview?page=1&page_size=2")
    assert preview_res.status_code == 200
    preview_data = preview_res.get_json()
    assert preview_data["total_rows"] == 3
    assert len(preview_data["data"]) == 2
    assert preview_data["columns"] == ["order_id", "product", "category", "revenue", "quantity"]

def test_xlsx_upload(client):
    df = pd.DataFrame({
        "item": ["Widget A", "Widget B"],
        "price": [19.99, 29.99]
    })
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False)
    output.seek(0)

    data = {
        "file": (output, "inventory.xlsx")
    }
    res = client.post("/api/v1/datasets/upload", data=data, content_type="multipart/form-data")
    assert res.status_code == 201
    res_data = res.get_json()
    assert res_data["dataset"]["rows"] == 2
    assert res_data["dataset"]["columns"] == ["item", "price"]

def test_invalid_file_rejection(client):
    data = {
        "file": (io.BytesIO(b"fake executable content"), "malicious.exe")
    }
    res = client.post("/api/v1/datasets/upload", data=data, content_type="multipart/form-data")
    assert res.status_code == 400
    res_data = res.get_json()
    assert "Invalid file type" in res_data["error"]

def test_dataset_profiling(client):
    csv_content = (
        "region,sales,discount\n"
        "North,500,0.1\n"
        "South,200,0.05\n"
        "East,800,0.15\n"
        "West,150,0.0\n"
    )
    data = {"file": (io.BytesIO(csv_content.encode("utf-8")), "regional_sales.csv")}
    upload_res = client.post("/api/v1/datasets/upload", data=data, content_type="multipart/form-data")
    dataset_id = upload_res.get_json()["dataset"]["id"]

    profile_res = client.get(f"/api/v1/datasets/{dataset_id}/profile")
    assert profile_res.status_code == 200
    prof = profile_res.get_json()["profile"]
    assert prof["rows"] == 4
    assert "sales" in prof["columns"]
    assert prof["columns"]["sales"]["stats"]["mean"] == 412.5
    assert "correlations" in prof
    assert prof["quality_score"] > 80

def test_dashboard_generation_and_persistence(client):
    csv_content = (
        "date,category,revenue\n"
        "2024-01-01,Tech,1000\n"
        "2024-02-01,Furniture,400\n"
        "2024-03-01,Tech,1200\n"
        "2024-04-01,Supplies,300\n"
    )
    upload_res = client.post(
        "/api/v1/datasets/upload",
        data={"file": (io.BytesIO(csv_content.encode("utf-8")), "trends.csv")},
        content_type="multipart/form-data"
    )
    dataset_id = upload_res.get_json()["dataset"]["id"]

    # 1. Generate dashboard
    gen_res = client.post("/api/v1/dashboards/generate", json={"dataset_id": dataset_id, "title": "Trends KPI"})
    assert gen_res.status_code == 200
    dash_config = gen_res.get_json()["dashboard"]
    assert len(dash_config["kpi_cards"]) > 0
    assert len(dash_config["charts"]) > 0

    # 2. Save dashboard JSON
    save_res = client.post("/api/v1/dashboards", json=dash_config)
    assert save_res.status_code == 201
    saved_id = save_res.get_json()["dashboard"]["id"]

    # 3. Retrieve dashboard
    get_res = client.get(f"/api/v1/dashboards/{saved_id}")
    assert get_res.status_code == 200
    assert get_res.get_json()["dashboard"]["id"] == saved_id

    # 4. Rename dashboard (PATCH)
    patch_res = client.patch(f"/api/v1/dashboards/{saved_id}", json={"title": "Renamed Executive View"})
    assert patch_res.status_code == 200
    assert patch_res.get_json()["dashboard"]["title"] == "Renamed Executive View"

    # 5. Delete dashboard
    del_res = client.delete(f"/api/v1/dashboards/{saved_id}")
    assert del_res.status_code == 200

    # Verify not found
    get_res2 = client.get(f"/api/v1/dashboards/{saved_id}")
    assert get_res2.status_code == 404

def test_deterministic_nlp_analytics(client):
    csv_content = (
        "category,revenue\n"
        "Electronics,5000\n"
        "Furniture,2000\n"
        "Clothing,1500\n"
    )
    upload_res = client.post(
        "/api/v1/datasets/upload",
        data={"file": (io.BytesIO(csv_content.encode("utf-8")), "retail.csv")},
        content_type="multipart/form-data"
    )
    dataset_id = upload_res.get_json()["dataset"]["id"]

    # Test "Which category has the highest revenue?"
    q_res = client.post("/api/v1/analytics/query", json={
        "dataset_id": dataset_id,
        "query": "Which category has the highest revenue?"
    })
    assert q_res.status_code == 200
    data = q_res.get_json()
    assert "Electronics" in data["answer"]
    assert data["source"] == "deterministic_engine"
    assert data["chart_suggestion"] is not None

    # Test "What is the average revenue?"
    avg_res = client.post("/api/v1/analytics/query", json={
        "dataset_id": dataset_id,
        "query": "What is the average revenue?"
    })
    assert avg_res.status_code == 200
    avg_data = avg_res.get_json()
    assert "2,833.33" in avg_data["answer"]

def test_dataset_deletion_and_missing_handling(client):
    csv_content = "id,val\n1,10\n"
    upload_res = client.post(
        "/api/v1/datasets/upload",
        data={"file": (io.BytesIO(csv_content.encode("utf-8")), "temp.csv")},
        content_type="multipart/form-data"
    )
    dataset_id = upload_res.get_json()["dataset"]["id"]

    # Delete dataset
    del_res = client.delete(f"/api/v1/datasets/{dataset_id}")
    assert del_res.status_code == 200

    # Getting deleted dataset should return 404
    get_res = client.get(f"/api/v1/datasets/{dataset_id}")
    assert get_res.status_code == 404

    # Previewing missing dataset should return 404
    prev_res = client.get(f"/api/v1/datasets/{dataset_id}/preview")
    assert prev_res.status_code == 404

def test_load_sample_data(client):
    res = client.post("/api/v1/datasets/load-sample")
    assert res.status_code == 200
    data = res.get_json()
    assert "dataset" in data
    assert data["dataset"]["id"] == "ds_demo_sales"
    assert data["dataset"]["rows"] == 300
    assert data["dataset"]["is_demo"] is True

def test_query_validation(client):
    # Empty payload
    res = client.post("/api/v1/analytics/query", json={})
    assert res.status_code == 400

    # Missing query text
    res = client.post("/api/v1/analytics/query", json={"dataset_id": "ds_demo_sales"})
    assert res.status_code == 400

def test_overview_stats(client):
    res = client.get("/api/v1/overview/stats")
    assert res.status_code == 200
    stats = res.get_json()
    assert "dataset_count" in stats
    assert "total_rows_analyzed" in stats
    assert "saved_dashboards_count" in stats
    assert stats["storage_mode"] == "File-Based (No Database)"

