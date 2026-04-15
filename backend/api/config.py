# ─────────────────────────────────────────────────────
# backend/api/config.py
# Central configuration for Cricbuzz RapidAPI
# ─────────────────────────────────────────────────────

API_KEY  = "b2311f87b4mshf249d950f17d853p18032ajsnf8659a884dee"
HOST     = "cricbuzz-cricket.p.rapidapi.com"
BASE_URL = f"https://{HOST}"

HEADERS = {
    "x-rapidapi-key":  API_KEY,
    "x-rapidapi-host": HOST,
}

FEED_ENDPOINTS = [
    "matches/v1/live",
    "matches/v1/recent",
    "matches/v1/upcoming",
]

def scorecard_url(match_id):    return f"mcenter/v1/{match_id}/hscard"
def match_center_url(match_id): return f"mcenter/v1/{match_id}"
def commentary_url(match_id):   return f"mcenter/v1/{match_id}/comm"
def overs_url(match_id):        return f"mcenter/v1/{match_id}/overs"
