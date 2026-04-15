# ─────────────────────────────────────────────────────
# backend/utils/match_finder.py
# Locates a match between two IPL teams in a given year
# across live / recent / upcoming feeds.
# ─────────────────────────────────────────────────────

import re
from backend.api import api_get, FEED_ENDPOINTS


def find_match(team1: str, team2: str, year: str):
    """
    Search live → recent → upcoming for a match between team1 and team2.

    Returns:
        On success : (match_dict, series_name, feed_label)
        On failure : (None, sorted_available_years, teams_found_in_any_year)
    """
    t1 = team1.strip().upper()
    t2 = team2.strip().upper()

    available_years   = set()
    teams_in_any_year = False

    for endpoint in FEED_ENDPOINTS:
        label = endpoint.split("/")[-1].upper()
        try:
            data = api_get(endpoint)
        except Exception:
            continue

        for tm in data.get("typeMatches", []):
            for sm in tm.get("seriesMatches", []):
                wrapper = sm.get("seriesAdWrapper", {})
                series  = wrapper.get("seriesName", "")

                for yr in re.findall(r"(20\d{2})", series):
                    available_years.add(yr)

                for match in wrapper.get("matches", []):
                    info = match.get("matchInfo", {})
                    s1   = info.get("team1", {}).get("teamSName", "").upper()
                    s2   = info.get("team2", {}).get("teamSName", "").upper()
                    pair = {s1, s2} == {t1, t2}

                    if pair:
                        teams_in_any_year = True
                        if not year or year in series:
                            return match, series, label

    return None, sorted(available_years), teams_in_any_year
