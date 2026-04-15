/* ═══════════════════════════════════════════════
   js/components/renderers.js
   Pure render functions — receive data, return HTML strings
═══════════════════════════════════════════════ */

/* ── helpers ──────────────────────────────────── */
const esc = (s) => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const pill = (txt, extra = "") => `<span class="d-pill ${extra}">${esc(txt)}</span>`;
const empty = (msg) => `<div class="empty-state"><div class="empty-icon">🏏</div><p>${msg}</p></div>`;
const card  = (title, icon, body) =>
  `<div class="card"><div class="card-title"><span>${icon}</span>${title}</div>${body}</div>`;
const innHead = (name, score, wkts, overs, rr, idx) =>
  `<div class="inn-head ${idx===0?"t1":"t2}">
    <span class="inn-name">${esc(name)}</span>
    <span class="inn-score">${score}/${wkts} (${overs} ov) &nbsp;·&nbsp; RR ${rr}</span>
  </div>`;

/* ── renderOverview ───────────────────────────── */
export function renderOverview(data) {
  const { match_info: m, innings, snapshot } = data;

  // Result banner
  const resultBanner = m.status
    ? `<div class="result-banner">
        <div class="rb-main">${esc(m.status)}</div>
        ${m.shortStatus ? `<div class="rb-sub">${esc(m.shortStatus)}</div>` : ""}
       </div>`
    : "";

  // Info grid cells
  const cells = [
    ["Match",        m.matchDesc],
    ["Format",       m.format,       "hl"],
    ["State",        m.state,        "hl"],
    ["Date & Time",  m.startDate],
    ["Venue",        m.venue],
    ["City",         m.city],
    ["Capacity",     m.capacity],
    ["Established",  m.established],
    ["Home Team",    m.homeTeam],
    ["Toss",         m.toss],
    ["Broadcast",    m.broadcast],
    ["Umpire 1",     m.umpire1],
    ["Umpire 2",     m.umpire2],
    ["TV Umpire",    m.tvUmpire],
    ["Referee",      m.referee],
  ].map(([label, val, cls = ""]) =>
    `<div class="info-cell">
       <div class="ic-label">${label}</div>
       <div class="ic-value ${cls}">${esc(val) || "—"}</div>
     </div>`
  ).join("");
  const infoCard = card("Match Information", "📋",
    `<div class="info-grid">${cells}</div>`);

  // Innings scores table
  let scoreRows = innings.map((inn, i) =>
    `<tr>
      <td class="bold">${esc(inn.team)}</td>
      <td class="num bold" style="font-size:15px">${inn.score}/${inn.wickets}</td>
      <td class="num">${inn.overs}</td>
      <td class="num hl">${inn.runrate}</td>
    </tr>`
  ).join("");
  const scoresCard = scoreRows
    ? card("Innings Scores", "📊",
        `<div class="dt"><table>
          <thead><tr><th>Team</th><th class="num">Score</th><th class="num">Overs</th><th class="num">RR</th></tr></thead>
          <tbody>${scoreRows}</tbody>
        </table></div>`)
    : "";

  // Snapshot
  const sn = snapshot ?? {};
  const snapCells = [
    sn.crr  != null && sn.crr  ? ["CRR",    sn.crr]   : null,
    sn.rrr  != null && sn.rrr  ? ["RRR",    sn.rrr]   : null,
    sn.innings                  ? ["Innings", sn.innings]: null,
  ].filter(Boolean).map(([label, val]) =>
    `<div class="snap-cell"><div class="snap-val">${val}</div><div class="snap-label">${label}</div></div>`
  ).join("");

  let snExtra = "";
  if (sn.lastWkt)  snExtra += `<p style="margin-top:10px;font-size:13px"><span style="color:var(--muted);font-family:var(--ff-mono);font-size:10px;letter-spacing:.1em">LAST WKT &nbsp;</span>${esc(sn.lastWkt)}</p>`;
  if (sn.lastOver) snExtra += `<p style="margin-top:6px;font-size:13px"><span style="color:var(--muted);font-family:var(--ff-mono);font-size:10px;letter-spacing:.1em">LAST OVER &nbsp;</span>${esc(sn.lastOver)}</p>`;

  const snapCard = snapCells
    ? card("Live Snapshot", "⚡",
        `<div class="snap-grid">${snapCells}</div>${snExtra}`)
    : "";

  return resultBanner + infoCard + scoresCard + snapCard;
}

/* ── renderBatting ────────────────────────────── */
export function renderBatting(data) {
  const { innings } = data;
  if (!innings?.length) return empty("Batting data not available");

  return innings.map((inn, idx) => {
    const rows = inn.batsmen.filter(p => p.dtype !== "Yet to bat").map(p => {
      const notOut = ["Not Out"].includes(p.dtype);
      const capWk  = (p.isCaptain ? " ©" : "") + (p.isKeeper ? " †" : "");
      return `<tr>
        <td>
          <span class="bold">${esc(p.name)}${esc(capWk)}</span>
          ${p.outdec && p.outdec !== "not out"
            ? `<br><span class="dim">${esc(p.outdec)}</span>` : ""}
        </td>
        <td>${pill(p.dtype, notOut ? "not-out" : "")}</td>
        <td class="num bold" style="font-size:16px">${p.runs}</td>
        <td class="num">${p.balls}</td>
        <td class="num">${p.fours}</td>
        <td class="num">${p.sixes}</td>
        <td class="num hl">${p.strkrate}</td>
        <td class="dim">${esc(p.bowler)}</td>
      </tr>`;
    }).join("");

    const ex = inn.extras;
    const extrasRow = `<tr style="background:rgba(255,255,255,.018)">
      <td colspan="2" class="dim">
        Extras (${ex.total}): B ${ex.byes} · LB ${ex.legByes} · W ${ex.wides} · NB ${ex.noBalls}
      </td>
      <td class="num bold">${ex.total}</td>
      <td colspan="5"></td>
    </tr>`;

    const body = `
      ${innHead(inn.team, inn.score, inn.wickets, inn.overs, inn.runrate, idx)}
      <div class="dt"><table>
        <thead><tr>
          <th>Batter</th><th>Dismissal</th>
          <th class="num">R</th><th class="num">B</th>
          <th class="num">4s</th><th class="num">6s</th>
          <th class="num">SR</th><th>Bowler</th>
        </tr></thead>
        <tbody>${rows}${extrasRow}</tbody>
      </table></div>`;

    return `<div class="card" style="margin-bottom:18px">
      <div class="card-title">🏏 Batting — ${esc(inn.team)} &nbsp; <span style="font-size:14px;color:var(--text);font-family:var(--ff-mono)">${inn.score}/${inn.wickets} (${inn.overs} ov)</span></div>
      ${body}
    </div>`;
  }).join("");
}

/* ── renderBowling ────────────────────────────── */
export function renderBowling(data) {
  const { innings } = data;
  if (!innings?.length) return empty("Bowling data not available");

  return innings.map((inn, idx) => {
    const rows = inn.bowlers.map(b =>
      `<tr>
        <td class="bold">${esc(b.name)}${b.note ? ` <span class="d-pill" style="background:rgba(200,169,81,.15);color:var(--gold)">${esc(b.note)}</span>` : ""}</td>
        <td class="num">${b.overs}</td>
        <td class="num">${b.maidens}</td>
        <td class="num bold">${b.runs}</td>
        <td class="num bold hl">${b.wickets}</td>
        <td class="num">${b.economy}</td>
        <td class="num">${b.dots}</td>
        <td class="num">${b.noBalls}</td>
        <td class="num">${b.wides}</td>
      </tr>`
    ).join("");

    return `<div class="card" style="margin-bottom:18px">
      <div class="card-title">🎯 Bowling — vs ${esc(inn.team)}</div>
      <div class="dt"><table>
        <thead><tr>
          <th>Bowler</th>
          <th class="num">O</th><th class="num">M</th>
          <th class="num">R</th><th class="num">W</th>
          <th class="num">Eco</th><th class="num">Dots</th>
          <th class="num">NB</th><th class="num">Wd</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </div>`;
  }).join("");
}

/* ── renderFoW ────────────────────────────────── */
export function renderFoW(data) {
  const { innings } = data;
  const hasData = innings.some(i => i.fow?.length);
  if (!hasData) return empty("Fall of Wickets not available");

  return card("Fall of Wickets", "📉",
    innings.filter(i => i.fow?.length).map((inn, idx) => {
      const rows = inn.fow.map((f, i) =>
        `<tr>
          <td class="num dim">${i+1}</td>
          <td class="bold">${esc(f.batsman)}</td>
          <td class="num hl">${f.runs}</td>
          <td class="num dim">${f.over}.${f.ball}</td>
        </tr>`
      ).join("");
      return `
        ${innHead(inn.team, inn.score, inn.wickets, inn.overs, inn.runrate, idx)}
        <div class="dt" style="margin-bottom:16px"><table>
          <thead><tr><th class="num">#</th><th>Batsman</th><th class="num">Score</th><th class="num">Over</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>`;
    }).join("")
  );
}

/* ── renderPartnerships ───────────────────────── */
export function renderPartnerships(data) {
  const { innings } = data;
  const hasData = innings.some(i => i.partnerships?.length);
  if (!hasData) return empty("Partnerships not available");

  return card("Partnerships", "🤝",
    innings.filter(i => i.partnerships?.length).map((inn, idx) => {
      const rows = inn.partnerships.map((p, i) =>
        `<tr>
          <td class="num dim">${i+1}</td>
          <td class="bold">${esc(p.bat1)}</td>
          <td class="num">${p.bat1runs}<span class="dim"> (${p.bat1balls}b)</span></td>
          <td class="bold">${esc(p.bat2)}</td>
          <td class="num">${p.bat2runs}<span class="dim"> (${p.bat2balls}b)</span></td>
          <td class="num bold hl">${p.total}</td>
          <td class="num dim">${p.totalBalls}b</td>
        </tr>`
      ).join("");
      return `
        ${innHead(inn.team, inn.score, inn.wickets, inn.overs, inn.runrate, idx)}
        <div class="dt" style="margin-bottom:16px"><table>
          <thead><tr>
            <th class="num">#</th>
            <th>Bat 1</th><th class="num">R(B)</th>
            <th>Bat 2</th><th class="num">R(B)</th>
            <th class="num">Total</th><th class="num">Balls</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table></div>`;
    }).join("")
  );
}

/* ── renderXI ─────────────────────────────────── */
export function renderXI(data) {
  const { innings } = data;
  const teams = {}, order = [];
  for (const inn of innings ?? []) {
    if (!teams[inn.team]) { teams[inn.team] = inn.batsmen; order.push(inn.team); }
  }
  if (order.length < 2) return empty("Playing XI not fully available");

  const buildTeam = (name, players, cls) => {
    const rows = players.map((p, i) =>
      `<div class="xi-row">
        <span><span class="xi-num">${i+1}.</span>${esc(p.name)}</span>
        <span class="xi-badges">
          ${p.isCaptain ? '<span class="badge badge-c">C</span>'  : ""}
          ${p.isKeeper  ? '<span class="badge badge-wk">WK</span>' : ""}
        </span>
      </div>`
    ).join("");
    return `<div>
      <div class="xi-col-head ${cls}">${esc(name)}</div>
      <div class="xi-list">${rows}</div>
    </div>`;
  };

  return card("Playing XI", "👕",
    `<div class="xi-grid">
      ${buildTeam(order[0], teams[order[0]], "t1")}
      ${buildTeam(order[1], teams[order[1]], "t2")}
    </div>`
  );
}

/* ── renderAwards ─────────────────────────────── */
export function renderAwards(data) {
  const a = data.awards ?? {};
  const items = [
    { icon:"🏏", label:"Top Scorer",      ...a.topBatter },
    { icon:"🎯", label:"Best Bowler",     ...a.topBowler },
    { icon:"💥", label:"Most Sixes",      ...a.mostSixes },
    { icon:"🔥", label:"Most Fours",      ...a.mostFours },
    { icon:"⚡", label:"Best Strike Rate",...a.bestSR    },
  ];

  const cells = items.map(it =>
    `<div class="award-cell">
      <div class="aw-icon">${it.icon}</div>
      <div class="aw-label">${it.label}</div>
      <div class="aw-name">${esc(it.name) || "—"}</div>
      <div class="aw-team">${esc(it.team) || "—"}</div>
      <div class="aw-stat">${esc(it.stat) || ""}</div>
    </div>`
  ).join("");

  return card("Awards & Highlights", "🏆",
    `<div class="awards-grid">${cells}</div>`);
}

/* ── renderCommentary ─────────────────────────── */
export function renderCommentary(data) {
  const items = data.commentary ?? [];
  if (!items.length) return empty("No commentary available");

  const html = items.map(it => {
    if (it.type === "headline")
      return `<div class="comm-item headline">📹 ${esc(it.text)}</div>`;
    return `<div class="comm-item ball">
      ${it.over !== ""
        ? `<div class="comm-over">Over ${it.over}.${it.ball}${it.event ? `<span class="comm-event">${esc(it.event)}</span>` : ""}</div>`
        : ""}
      ${esc(it.text)}
    </div>`;
  }).join("");

  return card("Match Commentary", "🎙️", html);
}
