# ─────────────────────────────────────────────────────
# backend/api/fetcher.py
# Raw HTTP layer — one function, one job
# ─────────────────────────────────────────────────────

import requests
from .config import BASE_URL, HEADERS


def api_get(endpoint: str, params: dict = None) -> dict:
    """
    GET request to the Cricbuzz RapidAPI.
    Raises requests.HTTPError on non-2xx responses.
    """
    url = f"{BASE_URL}/{endpoint}"
    response = requests.get(url, headers=HEADERS, params=params, timeout=15)
    response.raise_for_status()
    return response.json()
