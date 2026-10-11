import os
import sys
import shutil
import tempfile
import pytest

# Ensure backend root is on sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import create_app

@pytest.fixture
def test_storage_dir():
    temp_dir = tempfile.mkdtemp(prefix="lumyn_test_storage_")
    yield temp_dir
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir, ignore_errors=True)

@pytest.fixture
def client(test_storage_dir):
    app = create_app(storage_dir=test_storage_dir)
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client
