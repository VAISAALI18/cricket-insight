# ─────────────────────────────────────────────────────
# backend/routes/match_routes.py
# Flask Blueprint — all /api/match/* endpoints
# ─────────────────────────────────────────────────────

from flask import Blueprint, request, jsonify

from backend.utils.match_finder      import find_match
from backend.utils.match_data        import fetch_all_match_data
from backend.utils.data_transformers import (
    convert_date, dismissal_type,
    extract_catcher, extract_bowler,
    compute_awards, extract_commentary,
)

match_bp = Blueprint("match", __name__, url_prefix="/api")


# ── /api/search ───────────────────────────────────────
@match_bp.route("/search")
def search():
    """Find a match between two teams in a given year."""
    team1 = request.args.get("team1", "").strip().upper()
    team2 = request.args.get("team2", "").strip().upper()
    year  = request.args.get("year", "2026").strip()

    if not team1 or not team2:
        return jsonify({"error": "Both team1 and team2 are required."}), 400
    if team1 == team2:
        return jsonify({"error": "team1 and team2 must be different."}), 400

    match, series_or_years, match_type_or_flag = find_match(team1, team2, year)

    if not match:
        available_years   = series_or_years        # list when no match
        teams_in_any_year = match_type_or_flag
        return jsonify({
            "found":             False,
            "available_years":   available_years,
            "teams_in_any_year": teams_in_any_year,
            "team1": team1, "team2": team2, "year": year,
        })

    info     = match.get("matchInfo", {})
    match_id = info.get("matchId")

    return jsonify({
        "found":      True,
        "match_id":   match_id,
        "series":     series_or_years,
        "match_type": match_type_or_flag,
        "team1":      info.get("team1", {}).get("teamSName", team1),
        "team2":      info.get("team2", {}).get("teamSName", team2),
    })


# ── /api/match/<match_id> ─────────────────────────────
@match_bp.route("/match/<match_id>")
def match_data(match_id):
    """Fetch and transform all data for a match ID."""
    raw = fetch_all_match_data(match_id)

    scorecard   = raw.get("scorecard")   or {}
    mc_raw      = raw.get("match_center") or {}
    comm_raw    = raw.get("commentary")  or {}
    overs_raw   = raw.get("overs")       or {}

    mc   = mc_raw.get("matchInfo", mc_raw)   # some endpoints nest differently
    mini = overs_raw.get("miniscore", {})

    # ── Build innings data (batting + bowling + fow + partnerships) ──
    innings_data = []
    for inn in scorecard.get("scorecard", []):
        batsmen = []
        for p in inn.get("batsman", []):
            outdec  = p.get("outdec", "")
            dtype   = dismissal_type(outdec)
            batsmen.append({
                "name":      p.get("name", ""),
                "runs":      p.get("runs", 0),
                "balls":     p.get("balls", 0),
                "fours":     p.get("fours", 0),
                "sixes":     p.get("sixes", 0),
                "strkrate":  p.get("strkrate", "0"),
                "outdec":    outdec,
                "dtype":     dtype,
                "catcher":   extract_catcher(outdec, dtype),
                "bowler":    extract_bowler(outdec, dtype),
                "isCaptain": bool(p.get("iscaptain")),
                "isKeeper":  bool(p.get("iskeeper")),
            })

        bowlers = []
        for b in inn.get("bowler", []):
            bowlers.append({
                "name":     b.get("name", ""),
                "overs":    b.get("overs", 0),
                "maidens":  b.get("maidens", 0),
                "runs":     b.get("runs", 0),
                "wickets":  b.get("wickets", 0),
                "economy":  b.get("economy", "0"),
                "dots":     b.get("dots", 0),
                "rpb":      round(float(b.get("rpb", 0)), 2),
                "noBalls":  b.get("noballs", 0),
                "wides":    b.get("wides", 0),
                "note":     "Impact Sub" if b.get("playingxichange") == "IN" else "",
            })

        fow = []
        for f in inn.get("fow", {}).get("fow", []):
            fow.append({
                "batsman": f.get("batsmanname", ""),
                "runs":    f.get("runs", 0),
                "over":    f.get("overnbr", 0),
                "ball":    f.get("ballnbr", 0),
            })

        partnerships = []
        for ps in inn.get("partnership", {}).get("partnership", []):
            partnerships.append({
                "bat1":       ps.get("bat1name", ""),
                "bat1runs":   ps.get("bat1runs", 0),
                "bat1balls":  ps.get("bat1balls", 0),
                "bat2":       ps.get("bat2name", ""),
                "bat2runs":   ps.get("bat2runs", 0),
                "bat2balls":  ps.get("bat2balls", 0),
                "total":      ps.get("totalruns", 0),
                "totalBalls": ps.get("totalballs", 0),
            })

        extras = inn.get("extras", {})
        innings_data.append({
            "team":         inn.get("batteamname", ""),
            "score":        inn.get("score", 0),
            "wickets":      inn.get("wickets", 0),
            "overs":        inn.get("overs", 0),
            "runrate":      inn.get("runrate", 0),
            "batsmen":      batsmen,
            "bowlers":      bowlers,
            "fow":          fow,
            "partnerships": partnerships,
            "extras": {
                "total":    extras.get("total",    0),
                "wides":    extras.get("wides",    0),
                "noBalls":  extras.get("noballs",  0),
                "byes":     extras.get("byes",     0),
                "legByes":  extras.get("legbyes",  0),
            },
        })

    # ── Match info ────────────────────────────────────
    venue = mc.get("venueinfo", {})
    broadcasters = []
    for b in mc.get("broadcastinfo", []):
        for br in b.get("broadcaster", []):
            broadcasters.append(f"{br.get('broadcasttype','')} : {br.get('value','')}")

    match_info = {
        "series":      "",   # filled by search endpoint; not always in mc
        "matchDesc":   mc.get("matchdesc", ""),
        "format":      mc.get("matchformat", "T20"),
        "state":       mc.get("state", ""),
        "status":      mc.get("status", ""),
        "shortStatus": mc.get("shortstatus", ""),
        "toss":        mc.get("tossstatus", ""),
        "startDate":   convert_date(mc.get("startdate", "")),
        "team1":       mc.get("team1", {}).get("teamname", ""),
        "team2":       mc.get("team2", {}).get("teamname", ""),
        "venue":       venue.get("ground", ""),
        "city":        f"{venue.get('city','')} , {venue.get('country','')}",
        "ends":        venue.get("ends", ""),
        "capacity":    venue.get("capacity", ""),
        "established": str(venue.get("established", "")),
        "homeTeam":    venue.get("hometeam", ""),
        "umpire1":     f"{mc.get('umpire1',{}).get('name','—')} ({mc.get('umpire1',{}).get('country','')})",
        "umpire2":     f"{mc.get('umpire2',{}).get('name','—')} ({mc.get('umpire2',{}).get('country','')})",
        "tvUmpire":    f"{mc.get('umpire3',{}).get('name','—')} ({mc.get('umpire3',{}).get('country','')})",
        "referee":     f"{mc.get('referee',{}).get('name','—')} ({mc.get('referee',{}).get('country','')})",
        "broadcast":   " | ".join(broadcasters) or "N/A",
    }

    # ── Snapshot ──────────────────────────────────────
    inn_scores = []
    for s in mini.get("inningsscores", {}).get("inningsscore", []):
        inn_scores.append({
            "id":      s.get("inningsid", ""),
            "team":    s.get("batteamshortname", ""),
            "runs":    s.get("runs", 0),
            "wickets": s.get("wickets", 0),
            "overs":   s.get("overs", 0),
            "target":  s.get("target", "-"),
        })
    snapshot = {
        "innings":     mini.get("inningsnbr", ""),
        "crr":         mini.get("crr", 0),
        "rrr":         mini.get("rrr", 0),
        "lastWkt":     mini.get("lastwkt", ""),
        "lastOver":    mini.get("curovsstats", ""),
        "innScores":   inn_scores,
    }

    # ── Awards ────────────────────────────────────────
    raw_awards = compute_awards(scorecard)
    awards = {
        "topBatter": {
            "name":  raw_awards["bat"]["player"].get("name", "—"),
            "team":  raw_awards["bat"]["team"],
            "stat":  f"{raw_awards['bat']['runs']} off {raw_awards['bat']['player'].get('balls',0)}b"
                     f" | SR {raw_awards['bat']['player'].get('strkrate',0)}"
                     f" | 4s {raw_awards['bat']['player'].get('fours',0)}"
                     f" 6s {raw_awards['bat']['player'].get('sixes',0)}",
        },
        "topBowler": {
            "name":  raw_awards["bowl"]["player"].get("name", "—"),
            "team":  raw_awards["bowl"]["team"],
            "stat":  f"{raw_awards['bowl']['wkts']}/{raw_awards['bowl']['player'].get('runs',0)}"
                     f" in {raw_awards['bowl']['player'].get('overs',0)} ov"
                     f" | Eco {raw_awards['bowl']['eco']}",
        },
        "mostSixes": {
            "name":  raw_awards["six"]["player"].get("name", "—"),
            "team":  raw_awards["six"]["team"],
            "stat":  f"{raw_awards['six']['count']} sixes",
        },
        "mostFours": {
            "name":  raw_awards["four"]["player"].get("name", "—"),
            "team":  raw_awards["four"]["team"],
            "stat":  f"{raw_awards['four']['count']} fours",
        },
        "bestSR": {
            "name":  raw_awards["sr"]["player"].get("name", "—"),
            "team":  raw_awards["sr"]["team"],
            "stat":  f"SR {raw_awards['sr']['val']:.1f} in {raw_awards['sr']['player'].get('balls',0)}b",
        },
    }

    # ── Commentary ────────────────────────────────────
    commentary = extract_commentary(comm_raw)

    return jsonify({
        "match_info":  match_info,
        "innings":     innings_data,
        "snapshot":    snapshot,
        "awards":      awards,
        "commentary":  commentary,
    })
