/* ═══════════════════════════════════════════════
   js/modules/apiClient.js
   All fetch calls to the Flask backend
═══════════════════════════════════════════════ */

const BASE = "/api";

/**
 * Search for a match between two teams in a given year.
 * Returns the parsed JSON from /api/search
 */
export async function searchMatch(team1, team2, year) {
  const params = new URLSearchParams({ team1, team2, year });
  const res    = await fetch(`${BASE}/search?${params}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
}

/**
 * Fetch all processed match data for a given matchId.
 * Returns the parsed JSON from /api/match/:id
 */
export async function fetchMatchData(matchId) {
  const res = await fetch(`${BASE}/match/${matchId}`);
  if (!res.ok) throw new Error(`Data fetch failed: ${res.status}`);
  return res.json();
}
