/* ═══════════════════════════════════════════════════════════
   js/app.js  —  Self-contained app (no ES module imports)
   All modules inlined to guarantee Flask static serving works
═══════════════════════════════════════════════════════════ */

/* ── teamThemes ──────────────────────────────────────────── */
const TEAMS = {
  CSK:  { name:"Chennai Super Kings",          emoji:"🦁", a:"#F9CD05", b:"#0A2FA0", grad:"linear-gradient(135deg,#0A2FA0,#1a4fcf,#F9CD05)", glow:"rgba(249,205,5,0.32)"   },
  RCB:  { name:"Royal Challengers Bengaluru",  emoji:"🔴", a:"#EC1C24", b:"#1A1A1A", grad:"linear-gradient(135deg,#1A1A1A,#3a0000,#EC1C24)", glow:"rgba(236,28,36,0.30)"   },
  MI:   { name:"Mumbai Indians",               emoji:"💙", a:"#D1AB3E", b:"#004BA0", grad:"linear-gradient(135deg,#002060,#004BA0,#D1AB3E)", glow:"rgba(0,75,160,0.40)"     },
  KKR:  { name:"Kolkata Knight Riders",        emoji:"🟣", a:"#F5C300", b:"#3B0160", grad:"linear-gradient(135deg,#3B0160,#6a0ab5,#F5C300)", glow:"rgba(59,1,96,0.40)"      },
  SRH:  { name:"Sunrisers Hyderabad",          emoji:"🌅", a:"#FF822A", b:"#1A1A1A", grad:"linear-gradient(135deg,#1A1A1A,#7a2e00,#FF822A)", glow:"rgba(255,130,42,0.38)"   },
  DC:   { name:"Delhi Capitals",               emoji:"🔵", a:"#0078BC", b:"#EF1C25", grad:"linear-gradient(135deg,#00408a,#0078BC,#EF1C25)", glow:"rgba(0,120,188,0.38)"    },
  PBKS: { name:"Punjab Kings",                 emoji:"🏴", a:"#ED1B24", b:"#A7A9AC", grad:"linear-gradient(135deg,#8a0000,#ED1B24,#A7A9AC)", glow:"rgba(237,27,36,0.30)"    },
  RR:   { name:"Rajasthan Royals",             emoji:"👑", a:"#EA1A85", b:"#2D4396", grad:"linear-gradient(135deg,#2D4396,#6040b0,#EA1A85)", glow:"rgba(234,26,133,0.30)"   },
  LSG:  { name:"Lucknow Super Giants",         emoji:"🦅", a:"#A4C8E0", b:"#003161", grad:"linear-gradient(135deg,#003161,#005baa,#A4C8E0)", glow:"rgba(164,200,224,0.28)"  },
  GT:   { name:"Gujarat Titans",               emoji:"🏔", a:"#C8A951", b:"#1782C5", grad:"linear-gradient(135deg,#0d2a40,#1782C5,#C8A951)", glow:"rgba(23,130,197,0.38)"   },
};

function resolveTeam(key) {
  const k = String(key).trim().toUpperCase();
  return TEAMS[k] || { name:k, emoji:"🏏", a:"#6c63ff", b:"#1a1a2e",
    grad:"linear-gradient(135deg,#1a1a2e,#6c63ff)", glow:"rgba(108,99,255,0.30)" };
}

function applyTeamTheme(k1, k2) {
  const t1 = resolveTeam(k1), t2 = resolveTeam(k2);
  const r = document.documentElement.style;
  r.setProperty("--t1-a", t1.a);    r.setProperty("--t1-b", t1.b);
  r.setProperty("--t1-grad", t1.grad); r.setProperty("--t1-glow", t1.glow);
  r.setProperty("--t2-a", t2.a);    r.setProperty("--t2-b", t2.b);
  r.setProperty("--t2-grad", t2.grad); r.setProperty("--t2-glow", t2.glow);
  const glow = document.getElementById("bg-glow");
  if (glow) glow.style.background =
    `radial-gradient(ellipse 55% 45% at 10% 15%, ${t1.glow} 0%, transparent 65%),
     radial-gradient(ellipse 55% 45% at 90% 85%, ${t2.glow} 0%, transparent 65%)`;
  const h1 = document.querySelector(".hero h1");
  if (h1) {
    h1.style.background = `linear-gradient(100deg,${t1.a} 0%,#fff 38%,${t2.a} 100%)`;
    h1.style.webkitBackgroundClip = "text";
    h1.style.webkitTextFillColor  = "transparent";
    h1.style.backgroundClip       = "text";
  }
  return { t1, t2 };
}

/* ── apiClient ───────────────────────────────────────────── */
async function searchMatch(team1, team2, year) {
  const p = new URLSearchParams({ team1, team2, year });
  const r = await fetch(`/api/search?${p}`);
  if (!r.ok) throw new Error(`Search failed: ${r.status}`);
  return r.json();
}
async function fetchMatchData(matchId) {
  const r = await fetch(`/api/match/${matchId}`);
  if (!r.ok) throw new Error(`Data fetch failed: ${r.status}`);
  return r.json();
}

/* ── uiState ─────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

function showStatus(msg) { $("statusText").textContent = msg; $("statusBar").classList.add("show"); }
function hideStatus()    { $("statusBar").classList.remove("show"); }
function showError(html) { $("errorBox").innerHTML = html; $("errorBox").classList.add("show"); }
function hideError()     { $("errorBox").classList.remove("show"); }
function setSearching(v) { $("searchBtn").disabled = v; }

function updateClashBanner(k1, t1, k2, t2) {
  $("cb-emoji1").textContent = t1.emoji; $("cb-code1").textContent = k1; $("cb-name1").textContent = t1.name;
  $("cb-emoji2").textContent = t2.emoji; $("cb-code2").textContent = k2; $("cb-name2").textContent = t2.name;
  $("clashBanner").classList.add("show");
}
function showTabs()  { $("tabsWrap").classList.add("show"); }
function hideTabs()  { $("tabsWrap").classList.remove("show"); }
function switchTab(name) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  document.querySelectorAll(".panel").forEach(p => p.classList.toggle("active", p.id === `panel-${name}`));
}
function setPanel(name, html) { const el = $(`panel-${name}`); if (el) el.innerHTML = html; }
function resetPanels() {
  document.querySelectorAll(".panel").forEach(p => { p.innerHTML = ""; p.classList.remove("active"); });
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
}
function activateFirstTab() { const f = document.querySelector(".tab-btn"); if (f) switchTab(f.dataset.tab); }

/* ── renderers ───────────────────────────────────────────── */
const esc = s => String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const pill = (txt, extra) => `<span class="d-pill${extra?" "+extra:""}">${esc(txt)}</span>`;
const emptyState = msg => `<div class="empty-state"><div class="empty-icon">🏏</div><p>${msg}</p></div>`;
const card = (title, icon, body) => `<div class="card"><div class="card-title"><span>${icon}</span>${title}</div>${body}</div>`;
const innHead = (name, score, wkts, overs, rr, idx) =>
  `<div class="inn-head ${idx===0?"t1":"t2"}">
     <span class="inn-name">${esc(name)}</span>
     <span class="inn-score">${score}/${wkts} (${overs} ov) · RR ${rr}</span>
   </div>`;

function renderOverview(data) {
  const m = data.match_info || {}, inn = data.innings || [], sn = data.snapshot || {};
  const rb = m.status ? `<div class="result-banner"><div class="rb-main">${esc(m.status)}</div>${m.shortStatus?`<div class="rb-sub">${esc(m.shortStatus)}</div>`:""}</div>` : "";
  const cells = [["Match",m.matchDesc],["Format",m.format,"hl"],["State",m.state,"hl"],["Date & Time",m.startDate],
    ["Venue",m.venue],["City",m.city],["Capacity",m.capacity],["Established",m.established],
    ["Home Team",m.homeTeam],["Toss",m.toss],["Broadcast",m.broadcast],
    ["Umpire 1",m.umpire1],["Umpire 2",m.umpire2],["TV Umpire",m.tvUmpire],["Referee",m.referee]
  ].map(([l,v,c])=>`<div class="info-cell"><div class="ic-label">${l}</div><div class="ic-value${c?" "+c:""}">${esc(v)||"—"}</div></div>`).join("");
  const scRows = inn.map(i=>`<tr><td class="bold">${esc(i.team)}</td><td class="num bold" style="font-size:15px">${i.score}/${i.wickets}</td><td class="num">${i.overs}</td><td class="num hl">${i.runrate}</td></tr>`).join("");
  const snapCells = [[sn.crr,"CRR"],[sn.rrr,"RRR"],[sn.innings,"Innings"]].filter(([v])=>v)
    .map(([v,l])=>`<div class="snap-cell"><div class="snap-val">${v}</div><div class="snap-label">${l}</div></div>`).join("");
  return rb + card("Match Information","📋",`<div class="info-grid">${cells}</div>`)
    + (scRows?card("Innings Scores","📊",`<div class="dt"><table><thead><tr><th>Team</th><th class="num">Score</th><th class="num">Overs</th><th class="num">RR</th></tr></thead><tbody>${scRows}</tbody></table></div>`):"")
    + (snapCells?card("Live Snapshot","⚡",`<div class="snap-grid">${snapCells}</div>${sn.lastWkt?`<p style="margin-top:10px;font-size:13px"><span style="color:var(--muted);font-family:var(--ff-mono);font-size:10px">LAST WKT </span>${esc(sn.lastWkt)}</p>`:""}${sn.lastOver?`<p style="margin-top:6px;font-size:13px"><span style="color:var(--muted);font-family:var(--ff-mono);font-size:10px">LAST OVER </span>${esc(sn.lastOver)}</p>`:""}`):"");
}

function renderBatting(data) {
  const innings = data.innings || [];
  if (!innings.length) return emptyState("Batting data not available");
  return innings.map((inn, idx) => {
    const rows = (inn.batsmen||[]).filter(p=>p.dtype!=="Yet to bat").map(p=>{
      const no=p.dtype==="Not Out", cw=(p.isCaptain?" ©":"")+(p.isKeeper?" †":"");
      return `<tr><td><span class="bold">${esc(p.name)}${esc(cw)}</span>${p.outdec&&p.outdec!=="not out"?`<br><span class="dim">${esc(p.outdec)}</span>`:""}</td><td>${pill(p.dtype,no?"not-out":"")}</td><td class="num bold" style="font-size:16px">${p.runs}</td><td class="num">${p.balls}</td><td class="num">${p.fours}</td><td class="num">${p.sixes}</td><td class="num hl">${p.strkrate}</td><td class="dim">${esc(p.bowler)}</td></tr>`;
    }).join("");
    const ex=inn.extras||{};
    const exRow=`<tr style="background:rgba(255,255,255,.018)"><td colspan="2" class="dim">Extras (${ex.total||0}): B ${ex.byes||0} · LB ${ex.legByes||0} · W ${ex.wides||0} · NB ${ex.noBalls||0}</td><td class="num bold">${ex.total||0}</td><td colspan="5"></td></tr>`;
    return `<div class="card" style="margin-bottom:18px"><div class="card-title">🏏 Batting — ${esc(inn.team)} <span style="font-size:14px;color:var(--text);font-family:var(--ff-mono);margin-left:8px">${inn.score}/${inn.wickets} (${inn.overs} ov)</span></div>${innHead(inn.team,inn.score,inn.wickets,inn.overs,inn.runrate,idx)}<div class="dt"><table><thead><tr><th>Batter</th><th>Dismissal</th><th class="num">R</th><th class="num">B</th><th class="num">4s</th><th class="num">6s</th><th class="num">SR</th><th>Bowler</th></tr></thead><tbody>${rows}${exRow}</tbody></table></div></div>`;
  }).join("");
}

function renderBowling(data) {
  const innings = data.innings || [];
  if (!innings.length) return emptyState("Bowling data not available");
  return innings.map((inn)=>{
    const rows=(inn.bowlers||[]).map(b=>`<tr><td class="bold">${esc(b.name)}${b.note?` <span class="d-pill" style="background:rgba(200,169,81,.15);color:var(--gold)">${esc(b.note)}</span>`:""}</td><td class="num">${b.overs}</td><td class="num">${b.maidens}</td><td class="num bold">${b.runs}</td><td class="num bold hl">${b.wickets}</td><td class="num">${b.economy}</td><td class="num">${b.dots}</td><td class="num">${b.noBalls}</td><td class="num">${b.wides}</td></tr>`).join("");
    return `<div class="card" style="margin-bottom:18px"><div class="card-title">🎯 Bowling — vs ${esc(inn.team)}</div><div class="dt"><table><thead><tr><th>Bowler</th><th class="num">O</th><th class="num">M</th><th class="num">R</th><th class="num">W</th><th class="num">Eco</th><th class="num">Dots</th><th class="num">NB</th><th class="num">Wd</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  }).join("");
}

function renderFoW(data) {
  const innings=(data.innings||[]).filter(i=>i.fow&&i.fow.length);
  if (!innings.length) return emptyState("Fall of Wickets not available");
  return card("Fall of Wickets","📉",innings.map((inn,idx)=>{
    const rows=inn.fow.map((f,i)=>`<tr><td class="num dim">${i+1}</td><td class="bold">${esc(f.batsman)}</td><td class="num hl">${f.runs}</td><td class="num dim">${f.over}.${f.ball}</td></tr>`).join("");
    return innHead(inn.team,inn.score,inn.wickets,inn.overs,inn.runrate,idx)+`<div class="dt" style="margin-bottom:16px"><table><thead><tr><th class="num">#</th><th>Batsman</th><th class="num">Score</th><th class="num">Over</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }).join(""));
}

function renderPartnerships(data) {
  const innings=(data.innings||[]).filter(i=>i.partnerships&&i.partnerships.length);
  if (!innings.length) return emptyState("Partnerships not available");
  return card("Partnerships","🤝",innings.map((inn,idx)=>{
    const rows=inn.partnerships.map((p,i)=>`<tr><td class="num dim">${i+1}</td><td class="bold">${esc(p.bat1)}</td><td class="num">${p.bat1runs}<span class="dim"> (${p.bat1balls}b)</span></td><td class="bold">${esc(p.bat2)}</td><td class="num">${p.bat2runs}<span class="dim"> (${p.bat2balls}b)</span></td><td class="num bold hl">${p.total}</td><td class="num dim">${p.totalBalls}b</td></tr>`).join("");
    return innHead(inn.team,inn.score,inn.wickets,inn.overs,inn.runrate,idx)+`<div class="dt" style="margin-bottom:16px"><table><thead><tr><th class="num">#</th><th>Bat 1</th><th class="num">R(B)</th><th>Bat 2</th><th class="num">R(B)</th><th class="num">Total</th><th class="num">Balls</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }).join(""));
}

function renderXI(data) {
  const teams={}, order=[];
  for (const inn of data.innings||[]) { if (!teams[inn.team]) { teams[inn.team]=inn.batsmen||[]; order.push(inn.team); } }
  if (order.length<2) return emptyState("Playing XI not fully available");
  const buildTeam=(name,players,cls)=>
    `<div><div class="xi-col-head ${cls}">${esc(name)}</div><div class="xi-list">${players.map((p,i)=>
      `<div class="xi-row"><span><span class="xi-num">${i+1}.</span>${esc(p.name)}</span><span class="xi-badges">${p.isCaptain?'<span class="badge badge-c">C</span>':""}${p.isKeeper?'<span class="badge badge-wk">WK</span>':""}</span></div>`
    ).join("")}</div></div>`;
  return card("Playing XI","👕",`<div class="xi-grid">${buildTeam(order[0],teams[order[0]],"t1")}${buildTeam(order[1],teams[order[1]],"t2")}</div>`);
}

function renderAwards(data) {
  const a=data.awards||{};
  const items=[
    {icon:"🏏",label:"Top Scorer",     ...(a.topBatter||{})},
    {icon:"🎯",label:"Best Bowler",    ...(a.topBowler||{})},
    {icon:"💥",label:"Most Sixes",     ...(a.mostSixes||{})},
    {icon:"🔥",label:"Most Fours",     ...(a.mostFours||{})},
    {icon:"⚡",label:"Best Strike Rate",...(a.bestSR||{})},
  ];
  return card("Awards & Highlights","🏆",
    `<div class="awards-grid">${items.map(it=>`<div class="award-cell"><div class="aw-icon">${it.icon}</div><div class="aw-label">${it.label}</div><div class="aw-name">${esc(it.name)||"—"}</div><div class="aw-team">${esc(it.team)||"—"}</div><div class="aw-stat">${esc(it.stat)||""}</div></div>`).join("")}</div>`);
}

function renderCommentary(data) {
  const items=data.commentary||[];
  if (!items.length) return emptyState("No commentary available");
  return card("Match Commentary","🎙️",items.map(it=>
    it.type==="headline"
      ? `<div class="comm-item headline">📹 ${esc(it.text)}</div>`
      : `<div class="comm-item ball">${it.over!==""?`<div class="comm-over">Over ${it.over}.${it.ball}${it.event?`<span class="comm-event">${esc(it.event)}</span>`:""}</div>`:""} ${esc(it.text)}</div>`
  ).join(""));
}

/* ══════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════ */
function populateSelects() {
  const opts = Object.keys(TEAMS).map(k =>
    `<option value="${k}">${TEAMS[k].emoji} ${k} — ${TEAMS[k].name}</option>`
  ).join("");

  ["team1Select","team2Select"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<option value="">— Select Team —</option>${opts}`;
  });

  document.getElementById("team1Select").value = "CSK";
  document.getElementById("team2Select").value = "RCB";
  onTeamChange();
}

function onTeamChange() {
  const k1 = document.getElementById("team1Select").value;
  const k2 = document.getElementById("team2Select").value;
  if (!k1 || !k2) return;
  const { t1, t2 } = applyTeamTheme(k1, k2);
  updateClashBanner(k1, t1, k2, t2);
}

async function onSearch() {
  const team1 = (document.getElementById("team1Select").value || "").trim().toUpperCase();
  const team2 = (document.getElementById("team2Select").value || "").trim().toUpperCase();
  const year  = (document.getElementById("yearInput").value   || "").trim();

  hideError(); resetPanels(); hideTabs();
  if (!team1 || !team2) { showError("Please select both teams."); return; }
  if (team1 === team2)  { showError("Please select two <em>different</em> teams."); return; }

  setSearching(true);
  showStatus(`Searching for ${team1} vs ${team2} in IPL ${year}…`);

  try {
    const result = await searchMatch(team1, team2, year);
    if (!result.found) {
      hideStatus();
      const yrs=result.available_years||[], inAny=result.teams_in_any_year;
      let msg=`❌ No match found for <strong>${team1} vs ${team2}</strong> in IPL ${year}.<br><br>`;
      if (yrs.length) msg+=`ℹ️ API has data for: <strong>IPL ${yrs.join(", ")}</strong><br><span style="font-size:11px">(live, recent & upcoming only)</span><br><br>`;
      else msg+=`ℹ️ No season data returned by API right now.<br><br>`;
      msg+=inAny
        ? `💡 <strong>${team1} vs ${team2}</strong> IS in the feed but NOT in ${year}. Try one of the years above.`
        : `💡 <strong>${team1} vs ${team2}</strong> not found in any current feed. Check team codes or year.`;
      showError(msg); return;
    }

    showStatus(`Found! Match ID ${result.match_id} — Fetching data…`);
    const matchData = await fetchMatchData(result.match_id);
    matchData.match_info = matchData.match_info || {};
    matchData.match_info.series = result.series || "";
    hideStatus();

    setPanel("overview",     renderOverview(matchData));
    setPanel("batting",      renderBatting(matchData));
    setPanel("bowling",      renderBowling(matchData));
    setPanel("fow",          renderFoW(matchData));
    setPanel("partnerships", renderPartnerships(matchData));
    setPanel("xi",           renderXI(matchData));
    setPanel("awards",       renderAwards(matchData));
    setPanel("commentary",   renderCommentary(matchData));

    showTabs();
    activateFirstTab();
    $("tabsWrap").scrollIntoView({ behavior:"smooth", block:"start" });

  } catch (err) {
    hideStatus();
    showError(`❌ Error: ${err.message}`);
  } finally {
    setSearching(false);
  }
}

document.addEventListener("DOMContentLoaded", function() {
  populateSelects();
  document.getElementById("team1Select").addEventListener("change", onTeamChange);
  document.getElementById("team2Select").addEventListener("change", onTeamChange);
  document.getElementById("searchBtn").addEventListener("click", onSearch);
  document.getElementById("yearInput").addEventListener("keydown", function(e) { if (e.key==="Enter") onSearch(); });
  document.getElementById("tabBar").addEventListener("click", function(e) {
    const btn = e.target.closest(".tab-btn");
    if (btn) switchTab(btn.dataset.tab);
  });
});