# ─────────────────────────────────────────────────────
# backend/utils/data_transformers.py
# Pure helper functions — no side effects, no I/O
# ─────────────────────────────────────────────────────

from datetime import datetime


def convert_date(ms) -> str:
    try:
        return datetime.fromtimestamp(int(ms) / 1000).strftime("%d %B %Y, %I:%M %p")
    except Exception:
        return str(ms)


def dismissal_type(outdec: str) -> str:
    if not outdec:                                      return "Yet to bat"
    if outdec == "not out":                             return "Not Out"
    if "run out" in outdec.lower():                     return "Run Out"
    if outdec.startswith("st "):                        return "Stumped"
    if outdec.startswith("lbw"):                        return "LBW"
    if outdec.startswith("c&b"):                        return "Ct & Bowled"
    if outdec.startswith("c ") and " b " in outdec:    return "Caught"
    if outdec.startswith("b "):                         return "Bowled"
    if outdec.startswith("hit"):                        return "Hit Wicket"
    return "Out"


def extract_catcher(outdec: str, dtype: str) -> str:
    if dtype == "Caught" and outdec.startswith("c ") and " b " in outdec:
        return outdec[2:].split(" b ")[0].strip()
    if dtype == "Stumped" and outdec.startswith("st ") and " b " in outdec:
        return outdec[3:].split(" b ")[0].strip()
    return "-"


def extract_bowler(outdec: str, dtype: str) -> str:
    if dtype in {"Not Out", "Yet to bat", "Run Out"}:
        return "-"
    if outdec and " b " in outdec:
        return outdec.split(" b ")[-1].strip()
    return "-"


def compute_awards(scorecard: dict) -> dict:
    """Derive performance awards from scorecard data."""
    best = {
        "bat":  {"player": {}, "runs": 0, "team": ""},
        "bowl": {"player": {}, "wkts": 0, "eco": 999, "team": ""},
        "six":  {"player": {}, "count": 0, "team": ""},
        "four": {"player": {}, "count": 0, "team": ""},
        "sr":   {"player": {}, "val": 0,   "team": ""},
    }

    for inn in scorecard.get("scorecard", []):
        team = inn.get("batteamname", "")

        for p in inn.get("batsman", []):
            r   = p.get("runs",  0)
            six = p.get("sixes", 0)
            fou = p.get("fours", 0)
            sr  = float(p.get("strkrate", 0))
            b   = p.get("balls", 0)

            if r   > best["bat"]["runs"]:                  best["bat"]  = {"player": p, "runs":  r,   "team": team}
            if six > best["six"]["count"]:                 best["six"]  = {"player": p, "count": six, "team": team}
            if fou > best["four"]["count"]:                best["four"] = {"player": p, "count": fou, "team": team}
            if sr  > best["sr"]["val"] and b >= 10:        best["sr"]   = {"player": p, "val":   sr,  "team": team}

        for bw in inn.get("bowler", []):
            w   = bw.get("wickets", 0)
            eco = float(bw.get("economy", 999))
            if w > best["bowl"]["wkts"] or (w == best["bowl"]["wkts"] and eco < best["bowl"]["eco"]):
                best["bowl"] = {"player": bw, "wkts": w, "eco": eco, "team": team}

    return best


def extract_commentary(comm_data: dict, limit: int = 14) -> list:
    items = []
    for item in comm_data.get("comwrapper", []):
        if len(items) >= limit:
            break
        if "commsnippet" in item:
            hl = item["commsnippet"].get("headline", "").strip()
            if hl:
                items.append({"type": "headline", "text": hl})
        if "commentary" in item:
            c    = item["commentary"]
            text = c.get("commtxt", "").strip()
            if text:
                items.append({
                    "type": "ball",
                    "over": c.get("overNumber", c.get("overnbr", "")),
                    "ball": c.get("ballNumber", c.get("ballnbr", "")),
                    "event": c.get("event", ""),
                    "text": text,
                })
    return items
def format_date(date_str):
    """Format date string (basic placeholder)"""
    return str(date_str)

def format_dismissal(dismissal):
    """Format dismissal info (basic placeholder)"""
    return str(dismissal)
