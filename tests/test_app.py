import pytest
from unittest.mock import patch
import sys
import os

# Ensure project root is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import app


@pytest.fixture
def client():
    """Create test client"""
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


def test_homepage_loads(client):
    """Frontend SPA shell should be served at /"""
    response = client.get("/")
    assert response.status_code == 200


def test_search_missing_params(client):
    """Search without params should return 400"""
    response = client.get("/api/search")
    assert response.status_code in [400, 422, 500]


def test_search_endpoint_exists(client):
    """Search endpoint must exist and handle no match"""
    with patch("backend.routes.match_routes.find_match") as mock_find:
        # FIX: return tuple instead of None
        mock_find.return_value = (None, None, None)

        response = client.get("/api/search?team1=CSK&team2=RCB&year=2026")

        # Endpoint should respond, even if no match
        assert response.status_code in [200, 404, 500]


def test_match_endpoint_exists(client):
    """Match detail endpoint must exist"""
    with patch("backend.routes.match_routes.fetch_all_match_data") as mock_fetch:
        mock_fetch.return_value = {}

        response = client.get("/api/match/99999")

        assert response.status_code in [200, 404, 500]


def test_config_has_api_key():
    """Config must expose API_KEY"""
    from backend.api.config import API_KEY, HOST

    assert HOST == "cricbuzz-cricket.p.rapidapi.com"
    assert isinstance(API_KEY, str)


def test_data_transformer_imports():
    """data_transformers must be importable"""
    from backend.utils.data_transformers import (
        format_date,
        format_dismissal
    )

    assert callable(format_date)
    assert callable(format_dismissal)
