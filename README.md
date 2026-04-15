# 🏏 Cricket Insight Automator

Real-time IPL match intelligence dashboard.  
**Backend:** Flask (Python) · **Frontend:** Vanilla JS ES Modules

---

## 📁 Project Structure

```
cricket-insight/
│
├── app.py                          ← Flask entry point (serves API + frontend)
├── requirements.txt
│
├── backend/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── config.py               ← API key, host, endpoint helpers
│   │   └── fetcher.py              ← Single api_get() HTTP function
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── match_finder.py         ← find_match() — live/recent/upcoming search
│   │   ├── match_data.py           ← fetch_all_match_data() — parallel fetch
│   │   └── data_transformers.py    ← Pure helpers: dates, dismissals, awards
│   └── routes/
│       ├── __init__.py
│       └── match_routes.py         ← Flask Blueprint: /api/search + /api/match/<id>
│
└── frontend/
    ├── index.html                  ← Single-page app shell
    ├── css/
    │   ├── base.css                ← Variables, reset, typography
    │   └── layout.css              ← All components: cards, tables, tabs, etc.
    └── js/
        ├── app.js                  ← Main controller (wires form → API → UI)
        ├── modules/
        │   ├── teamThemes.js       ← IPL team colours + CSS variable injection
        │   ├── apiClient.js        ← fetch wrappers for Flask endpoints
        │   └── uiState.js          ← DOM helpers: status, tabs, panels, banner
        └── components/
            └── renderers.js        ← Pure render functions → HTML strings
```

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
cd cricket-insight
pip install -r requirements.txt
```

### 2. Run the server

```bash
python app.py
```

Server starts at **http://localhost:5000**

### 3. Open in browser

Navigate to `http://localhost:5000` — the Flask server serves both the API and the frontend.

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/search?team1=CSK&team2=RCB&year=2026` | GET | Find a match between two teams |
| `GET /api/match/<match_id>` | GET | Fetch all processed data for a match |

### `/api/search` Response
```json
{
  "found": true,
  "match_id": "12345",
  "series": "TATA IPL 2026",
  "match_type": "LIVE",
  "team1": "CSK",
  "team2": "RCB"
}
```

### `/api/match/<id>` Response
```json
{
  "match_info": { "venue": "...", "toss": "...", ... },
  "innings": [
    {
      "team": "Chennai Super Kings",
      "score": 180, "wickets": 6, "overs": 20,
      "batsmen": [...],
      "bowlers": [...],
      "fow": [...],
      "partnerships": [...],
      "extras": { "total": 12, ... }
    }
  ],
  "snapshot": { "crr": 9.5, "rrr": 8.2, ... },
  "awards": { "topBatter": { "name": "...", ... }, ... },
  "commentary": [ { "type": "ball", "over": 19, ... } ]
}
```

---

## 🎨 Team Themes

All 10 IPL teams have registered brand colours in `frontend/js/modules/teamThemes.js`.  
Selecting a team pair **instantly re-themes the entire UI** — background glow, panel headers, vs-banner, and hero gradient all update via CSS custom properties.

| Code | Team |
|------|------|
| CSK | Chennai Super Kings |
| RCB | Royal Challengers Bengaluru |
| MI  | Mumbai Indians |
| KKR | Kolkata Knight Riders |
| SRH | Sunrisers Hyderabad |
| DC  | Delhi Capitals |
| PBKS | Punjab Kings |
| RR  | Rajasthan Royals |
| LSG | Lucknow Super Giants |
| GT  | Gujarat Titans |

---

## 📊 Features

| Tab | Content |
|-----|---------|
| Overview | Match info, venue, toss, officials, innings scores, live CRR/RRR |
| Batting | Full scorecard with dismissal types, extras, SR |
| Bowling | Figures with economy, dots, wides, no-balls, Impact Sub flag |
| Fall of Wickets | Per-innings wicket timeline |
| Partnerships | Per-innings partnership breakdown |
| Playing XI | Side-by-side lineup with captain / keeper badges |
| Awards | Top scorer, best bowler, most sixes/fours, best SR |
| Commentary | Latest 14 commentary items with over-by-over breakdown |

---

## 🔑 Changing API Key

Edit `backend/api/config.py`:

```python
API_KEY = "your-rapidapi-key-here"
```

Get a key at: https://rapidapi.com/cricbuzz/api/cricbuzz-cricket
