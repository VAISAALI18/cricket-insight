/* ═══════════════════════════════════════════════
   js/modules/uiState.js
   DOM helpers — status bar, tabs, clash banner, errors
═══════════════════════════════════════════════ */

/* ── Status bar ───────────────────────────────── */
export function showStatus(msg) {
  const bar = document.getElementById("statusBar");
  document.getElementById("statusText").textContent = msg;
  bar.classList.add("show");
}
export function hideStatus() {
  document.getElementById("statusBar").classList.remove("show");
}

/* ── Error box ────────────────────────────────── */
export function showError(html) {
  const box = document.getElementById("errorBox");
  box.innerHTML = html;
  box.classList.add("show");
}
export function hideError() {
  document.getElementById("errorBox").classList.remove("show");
}

/* ── Search button ────────────────────────────── */
export function setSearching(v) {
  document.getElementById("searchBtn").disabled = v;
}

/* ── Clash banner ─────────────────────────────── */
export function updateClashBanner(t1key, t1theme, t2key, t2theme) {
  document.getElementById("cb-emoji1").textContent = t1theme.emoji;
  document.getElementById("cb-code1").textContent  = t1key;
  document.getElementById("cb-name1").textContent  = t1theme.name;
  document.getElementById("cb-emoji2").textContent = t2theme.emoji;
  document.getElementById("cb-code2").textContent  = t2key;
  document.getElementById("cb-name2").textContent  = t2theme.name;
  document.getElementById("clashBanner").classList.add("show");
}

/* ── Tabs ─────────────────────────────────────── */
export function showTabs() {
  document.getElementById("tabsWrap").classList.add("show");
}
export function hideTabs() {
  document.getElementById("tabsWrap").classList.remove("show");
}

export function switchTab(name) {
  document.querySelectorAll(".tab-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.tab === name)
  );
  document.querySelectorAll(".panel").forEach(p =>
    p.classList.toggle("active", p.id === `panel-${name}`)
  );
}

/* ── Panel content ────────────────────────────── */
export function setPanel(name, html) {
  const el = document.getElementById(`panel-${name}`);
  if (el) el.innerHTML = html;
}

export function resetPanels() {
  document.querySelectorAll(".panel").forEach(p => { p.innerHTML = ""; p.classList.remove("active"); });
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
}

export function activateFirstTab() {
  const first = document.querySelector(".tab-btn");
  if (first) switchTab(first.dataset.tab);
}
