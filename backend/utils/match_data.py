# ─────────────────────────────────────────────────────
# backend/utils/match_data.py
# Bulk-fetches all 4 data bundles for a given match ID
# ─────────────────────────────────────────────────────

from concurrent.futures import ThreadPoolExecutor, as_completed
from backend.api import (
    api_get,
    scorecard_url, match_center_url, commentary_url, overs_url,
)


def fetch_all_match_data(match_id) -> dict:
    """
    Parallel fetch of scorecard, match_center, commentary, overs.
    Returns a dict with None for any failed endpoint.
    """
    tasks = {
        "scorecard":    scorecard_url(match_id),
        "match_center": match_center_url(match_id),
        "commentary":   commentary_url(match_id),
        "overs":        overs_url(match_id),
    }

    results = {}

    def fetch(key, endpoint):
        try:
            return key, api_get(endpoint)
        except Exception as exc:
            return key, None

    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(fetch, k, v): k for k, v in tasks.items()}
        for future in as_completed(futures):
            key, data = future.result()
            results[key] = data

    return results
