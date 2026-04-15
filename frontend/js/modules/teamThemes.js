/* ═══════════════════════════════════════════════
   js/modules/teamThemes.js
   IPL team colour registry + CSS variable injector
═══════════════════════════════════════════════ */

export const TEAMS = {
  CSK:  { name:"Chennai Super Kings",           emoji:"🦁", a:"#F9CD05", b:"#0A2FA0", grad:"linear-gradient(135deg,#0A2FA0,#1a4fcf,#F9CD05)", glow:"rgba(249,205,5,0.32)"    },
  RCB:  { name:"Royal Challengers Bengaluru",   emoji:"🔴", a:"#EC1C24", b:"#1A1A1A", grad:"linear-gradient(135deg,#1A1A1A,#3a0000,#EC1C24)", glow:"rgba(236,28,36,0.30)"    },
  MI:   { name:"Mumbai Indians",                emoji:"💙", a:"#D1AB3E", b:"#004BA0", grad:"linear-gradient(135deg,#002060,#004BA0,#D1AB3E)", glow:"rgba(0,75,160,0.40)"      },
  KKR:  { name:"Kolkata Knight Riders",         emoji:"🟣", a:"#F5C300", b:"#3B0160", grad:"linear-gradient(135deg,#3B0160,#6a0ab5,#F5C300)", glow:"rgba(59,1,96,0.40)"       },
  SRH:  { name:"Sunrisers Hyderabad",           emoji:"🌅", a:"#FF822A", b:"#1A1A1A", grad:"linear-gradient(135deg,#1A1A1A,#7a2e00,#FF822A)", glow:"rgba(255,130,42,0.38)"    },
  DC:   { name:"Delhi Capitals",                emoji:"🔵", a:"#0078BC", b:"#EF1C25", grad:"linear-gradient(135deg,#00408a,#0078BC,#EF1C25)", glow:"rgba(0,120,188,0.38)"      },
  PBKS: { name:"Punjab Kings",                  emoji:"🏴", a:"#ED1B24", b:"#A7A9AC", grad:"linear-gradient(135deg,#8a0000,#ED1B24,#A7A9AC)", glow:"rgba(237,27,36,0.30)"      },
  RR:   { name:"Rajasthan Royals",              emoji:"👑", a:"#EA1A85", b:"#2D4396", grad:"linear-gradient(135deg,#2D4396,#6040b0,#EA1A85)", glow:"rgba(234,26,133,0.30)"     },
  LSG:  { name:"Lucknow Super Giants",          emoji:"🦅", a:"#A4C8E0", b:"#003161", grad:"linear-gradient(135deg,#003161,#005baa,#A4C8E0)", glow:"rgba(164,200,224,0.28)"    },
  GT:   { name:"Gujarat Titans",               emoji:"🏔️", a:"#C8A951", b:"#1782C5", grad:"linear-gradient(135deg,#0d2a40,#1782C5,#C8A951)", glow:"rgba(23,130,197,0.38)"      },
};

const FALLBACK = (k) => ({
  name: k, emoji:"🏏",
  a:"#6c63ff", b:"#1a1a2e",
  grad:"linear-gradient(135deg,#1a1a2e,#6c63ff)",
  glow:"rgba(108,99,255,0.30)",
});

export function resolveTeam(key) {
  const k = key.trim().toUpperCase();
  return TEAMS[k] ?? FALLBACK(k);
}

/** Injects CSS variables for both teams into :root */
export function applyTeamTheme(t1key, t2key) {
  const t1 = resolveTeam(t1key);
  const t2 = resolveTeam(t2key);
  const r  = document.documentElement.style;

  r.setProperty("--t1-a",    t1.a);
  r.setProperty("--t1-b",    t1.b);
  r.setProperty("--t1-grad", t1.grad);
  r.setProperty("--t1-glow", t1.glow);

  r.setProperty("--t2-a",    t2.a);
  r.setProperty("--t2-b",    t2.b);
  r.setProperty("--t2-grad", t2.grad);
  r.setProperty("--t2-glow", t2.glow);

  // Ambient background glow
  document.getElementById("bg-glow").style.background =
    `radial-gradient(ellipse 55% 45% at 10% 15%, ${t1.glow} 0%, transparent 65%),
     radial-gradient(ellipse 55% 45% at 90% 85%, ${t2.glow} 0%, transparent 65%)`;

  // Hero gradient
  const h1 = document.querySelector(".hero h1");
  if (h1) {
    h1.style.background = `linear-gradient(100deg, ${t1.a} 0%, #fff 38%, ${t2.a} 100%)`;
    h1.style["-webkit-background-clip"] = "text";
    h1.style["-webkit-text-fill-color"] = "transparent";
    h1.style["background-clip"]         = "text";
  }

  return { t1, t2 };
}

export const TEAM_LIST = Object.keys(TEAMS);
