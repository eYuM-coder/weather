// ==========================
// CONFIG
// ==========================
let LAST_HEADLINES = [];
let s = {};
let STREAM_THRESHOLDS = {
  ACTIVE: 0,
};

// ===============================
// TOOL MENU DROPDOWN
// ===============================

const toolsButton = document.getElementById("toolsButton");
const toolsMenu = document.getElementById("toolsMenu");

let menuOpen = false;

// Open / Close Menu
toolsButton.addEventListener("click", (e) => {
  e.stopPropagation();

  menuOpen = !menuOpen;

  if (menuOpen) {
    openToolsMenu();
  } else {
    closeToolsMenu();
  }
});

function positionToolsMenu() {
  const rect = toolsButton.getBoundingClientRect();

  toolsMenu.style.position = "fixed";
  toolsMenu.style.left = `${Math.round(rect.left) - Math.round(rect.width / 2)}px`;
  toolsMenu.style.top = `55px`;
  toolsMenu.style.zIndex = `50`;
}

positionToolsMenu();

function openToolsMenu() {
  positionToolsMenu(); // recalc every time
  toolsButton.setAttribute("data-state", "open");
  toolsMenu.setAttribute("data-state", "open");

  toolsMenu.classList.remove("hidden");

  rotateChevron(true);
}

function closeToolsMenu() {
  toolsButton.setAttribute("data-state", "closed");
  toolsMenu.setAttribute("data-state", "closed");
  // small delay for animation
  setTimeout(() => {
    toolsMenu.classList.add("hidden");
  }, 120);

  rotateChevron(false);
  menuOpen = false;
}

// Close menu on outside click
document.addEventListener("click", (e) => {
  if (!menuOpen) return;

  if (!toolsMenu.contains(e.target) && !toolsButton.contains(e.target)) {
    closeToolsMenu();
  }
});

// Chevron rotation
function rotateChevron(open) {
  const svg = toolsButton.querySelector(".lucide-chevron-down");
  svg.style.transition = "transform 0.15s ease";
  svg.style.transform = open ? "rotate(180deg)" : "rotate(0deg)";
}

// Optional: Escape key closes it
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuOpen) closeToolsMenu();
});

const refreshButton = document.getElementById("refresh-button");

refreshButton.addEventListener("click", () => {
  updateBreakingHeadlines();
  updateTimestamp();
  updateCurrentTopWarnings();
  updateScannerCards();
});

async function updateWISThreshold() {
  const threshold = await fetch(
    `https://quiet-wood-94aa.nathaniel2007w.workers.dev?t=${new Date().getTime()}`,
  );
  const threshold_data = await threshold.json();
  STREAM_THRESHOLDS.ACTIVE = threshold_data.thresholds?.ACTIVE;
}

async function updateTimestamp() {
  const span = document.getElementById("last-updated-timestamp");
  const now = Date.now();

  const formatted = new Intl.DateTimeFormat([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
    timeZone: "America/New_York",
  }).format(now);

  span.textContent = `UPDATED: ${formatted}`;
}

updateTimestamp();

// ==========================
// UPDATE: Breaking Headlines
// ==========================
async function updateBreakingHeadlines() {
  try {
    const res = await fetch(
      `https://public.yallsoft.app/rhy/summaries.json?t=${new Date().getTime()}`,
    );
    const data = await res.json();

    s = data;
    updateTodaysForecast();
    updateTomorrowsForecast();
    updateLiveCommunityPulse();
    updateThisWeeksForecast();

    const newHeadlines = data.community_analysis.headlines.headlines;
    const timestamp = data.community_analysis.headlines.generated_at;

    // Update timestamp
    document.getElementById("headlines-timestamp").textContent =
      `As of ${formatTime(timestamp, true)}`;

    // ⚡ PREVENT FLICKER: Check if anything changed
    if (JSON.stringify(newHeadlines) === JSON.stringify(LAST_HEADLINES)) {
      return; // No animation, no rewrite
    }

    const list = document.getElementById("headlines-list");

    // Fade out old headlines to the right (x = 12px)
    Array.from(list.children).forEach((li, i) => {
      li.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      li.style.opacity = "0";
      li.style.transform = "translateX(12px)";
    });

    // Wait for fade-out to complete before clearing
    await new Promise((resolve) => setTimeout(resolve, 300));

    LAST_HEADLINES = newHeadlines;

    // Preserve scroll position
    const oldScroll = list.scrollTop;

    list.innerHTML = "";

    newHeadlines.forEach((text, index) => {
      const li = document.createElement("li");
      li.className =
        "flex items-start gap-2 leading-relaxed opacity-0 transition-all duration-300"; // remove translate-y

      li.style.transform = "translateX(-12px)"; // initial horizontal offset

      li.innerHTML = `
        <span class="text-xs font-bold font-tech text-monitor-danger mt-0.5 select-none shrink-0">
          ${String(index + 1).padStart(2, "0")}
        </span>
        <span class="text-sm md:text-base">${text}</span>
      `;

      list.appendChild(li);

      // ⭐ STAGGERED ANIMATION (RHY STYLE)
      setTimeout(() => {
        li.style.opacity = "1";
        li.style.transform = "translateX(0)"; // move to default
      }, index * 50);
    });

    // Restore scroll
    list.scrollTop = oldScroll;
  } catch (err) {
    console.error("❌ Failed to fetch RHY Headlines:", err);
  }
}

function formatTime(ts, showTimeZone = false) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d)) return "—";

  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    ...(showTimeZone ? { timeZoneName: "short" } : {}),
  });
}

function formatTimeRange(start, end) {
  if (!start || !end) return null;

  const startTime = new Date(start);
  const endTime = new Date(end);

  if (isNaN(startTime) || isNaN(endTime)) return null;

  return `${formatTime(start)} - ${formatTime(end, true)}`;
}

function getFirstTimestamp(incident) {
  const ts = incident.timestamps?.[0];
  if (!ts) return 0;

  const d = new Date(ts);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function pickLocationString(locations) {
  if (!locations?.length) return "";
  const county = locations.find((loc) => /county/i.test(loc));
  return county || locations.find((loc) => loc.includes(",")) || locations[0];
}

function parseLocation(incident) {
  const parts = pickLocationString(incident.locations || [])
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  let stateKey = "";
  let placeKey = "";

  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1].toUpperCase();
    const maybeState = /^[A-Z]{2}$/.test(lastPart) ? lastPart : "";
    if (maybeState) {
      stateKey = maybeState;
      placeKey = parts.length >= 3 ? parts[parts.length - 2] : parts[0];
    } else {
      placeKey = parts[0];
    }
  } else if (parts.length === 1) {
    placeKey = parts[0];
  }

  return {
    stateKey: stateKey || "ZZZ",
    placeKey: placeKey || "Unknown",
  };
}

function getStateName(incident) {
  const { stateKey } = parseLocation(incident);
  return stateKey === "ZZZ" ? "Unknown" : stateKey;
}

// Sort incidents: state → severity → place → timestamp
function sortIncidents(incidents) {
  return [...incidents].sort((a, b) => {
    const locA = parseLocation(a);
    const locB = parseLocation(b);

    const stateCompare = locA.stateKey.localeCompare(locB.stateKey);
    if (stateCompare !== 0) return stateCompare;

    const severityCompare = severityRank(a.severity) - severityRank(b.severity);
    if (severityCompare !== 0) return severityCompare;

    const placeCompare = locA.placeKey.localeCompare(locB.placeKey);
    if (placeCompare !== 0) return placeCompare;

    return getFirstTimestamp(b) - getFirstTimestamp(a);
  });
}

// Group incidents by state
function groupByState(incidents) {
  const sorted = sortIncidents(incidents);
  const map = new Map();

  for (const incident of sorted) {
    const state = getStateName(incident);
    if (!map.has(state)) map.set(state, []);
    map.get(state).push(incident);
  }

  return map;
}

function countSeverities(incidents) {
  let high = 0,
    medium = 0,
    low = 0;

  for (const incident of incidents) {
    const s = (incident.severity || "").toLowerCase();
    if (s === "high" || s === "severe" || s === "critical") high++;
    else if (s === "medium" || s === "moderate") medium++;
    else low++;
  }

  return { high, medium, low };
}

// Parse markdown documentation into structured objects
function parseMarkdownDocs(md) {
  const lines = md.split(/\r?\n/);
  const sections = [];
  let current = null;

  const pushCurrent = () => {
    if (current) sections.push(current);
    current = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("### ")) {
      pushCurrent();
      current = { title: trimmed.slice(4).trim(), bullets: [], paragraphs: [] };
      continue;
    }

    if (current) {
      if (trimmed.startsWith("- ")) current.bullets.push(trimmed.slice(2));
      else if (trimmed.length > 0) current.paragraphs.push(trimmed);
    }
  }

  pushCurrent();
  return sections;
}

// ==========================
// UPDATE: Live WIS Mini Card
// ==========================
let lastWIS = null;
let lastThreshold = null;

async function updateMiniWIS() {
  try {
    const res = await fetch(
      `https://public.yallsoft.app/rhy/wis.json?t=${new Date().getTime()}`,
    );
    const data = await res.json();

    await updateWISThreshold();

    const wis = data.wis.weather_intensity_score;
    const threshold = STREAM_THRESHOLDS?.ACTIVE;
    const timestamp = data.wis.timestamp;

    const valEl = document.getElementById("live-wis-value");
    const thresholdValueEl = document.getElementById(
      "live-wis-threshold-value",
    );
    const thresholdEl = document.getElementById("live-wis-threshold");
    const updatedEl = document.getElementById("live-wis-updated");
    const thresholdBar = document.getElementById("threshold-bar");

    // =====================================
    // WIS VALUE ANIMATION (only when changed)
    // =====================================
    if (lastWIS !== wis) {
      valEl.style.transition = "opacity .3s, transform .3s";
      valEl.style.opacity = "0";
      valEl.style.transform = "translateY(10px)";

      setTimeout(() => {
        valEl.textContent = `
            ${wis.toFixed(2)}
          `;
        valEl.style.opacity = "1";
        valEl.style.transform = "translateY(0)";
      }, 200);
    }

    lastWIS = wis;

    // =====================================
    // THRESHOLD — NEVER remove SVG, only update number
    // =====================================
    if (lastThreshold !== threshold) {
      thresholdValueEl.style.transition = "opacity .3s, transform .3s";
      thresholdValueEl.style.opacity = "0";
      thresholdValueEl.style.transform = "translateY(10px)";
      thresholdEl.style.transition = "opacity .3s, transform .3s";
      thresholdEl.style.opacity = "0";
      thresholdEl.style.transform = "translateY(10px)";
      thresholdBar.style.width = `${(wis / threshold) * 100}%`;

      setTimeout(() => {
        thresholdValueEl.textContent = threshold;
        thresholdValueEl.style.opacity = "1";
        thresholdValueEl.style.transform = "translateY(0)";
        thresholdEl.textContent = `/ ${threshold}`;
        thresholdEl.style.opacity = "1";
        thresholdEl.style.transform = "translateY(0)";
      }, 200);

      lastThreshold = threshold;
    }

    updateStreamLabel(wis, threshold);

    // =====================================
    // Timestamp
    // =====================================
    updatedEl.textContent = "UPDATED: " + formatTime(timestamp, true);
  } catch (err) {
    console.error("Failed WIS update:", err);
  }
}

function updateStreamLabel(currentScore, threshold) {
  const el = document.getElementById("streamStateLabel");

  const above = currentScore >= threshold;

  el.textContent = above ? "Stream Ready" : "Monitoring";
  el.classList.toggle("text-emerald-300", above);
  el.classList.toggle("text-amber-300", !above);
}

const WARNING_COLORS = {
  "TORNADO EMERGENCY": { main: "#950BA1", dark: "#72067A" },

  "TO.W": { main: "#FF0000", dark: "#cc0000" },
  "TO.A": { main: "#ff3333", dark: "#ff0000" },

  "SV.W": { main: "#FFA500", dark: "#FF8C00" },
  "SV.A": { main: "#FFB733", dark: "#FFA500" },

  "FF.W": { main: "#39B54A", dark: "#2d8f3b" },
  "FF.A": { main: "#A7E2FF", dark: "#87CEEB" },

  "WS.W": { main: "#FF69B4", dark: "#cc5490" },
  "WS.A": { main: "#4169E1", dark: "#0000CD" },

  "WW.Y": { main: "#87CEEB", dark: "#4682B4" },

  "BZ.W": { main: "#E67300", dark: "#CC6600" },
  "IS.W": { main: "#8B008B", dark: "#6b006b" },
  "MA.W": { main: "#731e56", dark: "#5a1743" },

  "FZ.W": { main: "#483D8B", dark: "#27508F" },
  "FZ.A": { main: "#ADD8E6", dark: "#87CEEB" },

  "SP.S": { main: "#9370DB", dark: "#7B68EE" },
  "SQ.W": { main: "#00BFFF", dark: "#0099cc" },
  "LE.W": { main: "#008B8B", dark: "#006b6b" },

  "EC.W": { main: "#1B4F72", dark: "#0A2A3F" },
  "EC.A": { main: "#2874A6", dark: "#1B4F72" },

  "CW.Y": { main: "#5DADE2", dark: "#2874A6" },
  "WC.Y": { main: "#85C1E9", dark: "#5DADE2" },

  "AV.W": { main: "#1E90FF", dark: "#0066CC" },
  "AV.A": { main: "#6495ED", dark: "#4F75BA" },

  "FL.W": { main: "#006400", dark: "#004d00" },
  "FA.W": { main: "#008B45", dark: "#006633" },

  "CF.W": { main: "#20B2AA", dark: "#178F88" },
  "LS.W": { main: "#3CB371", dark: "#2E8B57" },

  "FL.Y": { main: "#90EE90", dark: "#74c474" },
  "FA.Y": { main: "#98FB98", dark: "#7bc97b" },

  "CF.Y": { main: "#B0E0E6", dark: "#89b3b9" },
  "LS.Y": { main: "#ADD8E6", dark: "#8badb6" },

  "FL.A": { main: "#4F9B82", dark: "#3d7a66" },
  "FA.A": { main: "#5F9EA0", dark: "#4b7e80" },
  "CF.A": { main: "#87CEEB", dark: "#6ca3bc" },
  "LS.A": { main: "#79CDCD", dark: "#61a3a3" },

  "CF.S": { main: "#B8D8D8", dark: "#93acac" },

  "FR.Y": { main: "#6495ED", dark: "#4f75ba" },

  "HU.W": { main: "#8B0000", dark: "#660000" },
  "HU.A": { main: "#FFB6C1", dark: "#FF91A4" },

  "TR.W": { main: "#FFD700", dark: "#CCAC00" },
  "TR.A": { main: "#4682B4", dark: "#36618A" },

  "SS.W": { main: "#8B008B", dark: "#6B006B" },
  "SS.A": { main: "#BA55D3", dark: "#9A42AD" },

  "EW.W": { main: "#FF8C00", dark: "#E57A00" },
  "HW.W": { main: "#DAA520", dark: "#C9961A" },
  "HW.A": { main: "#B8860B", dark: "#A57408" },

  "DS.W": { main: "#FFE4C4", dark: "#E6C9A6" },
  "DS.Y": { main: "#BDB76B", dark: "#A9A45F" },

  "DU.W": { main: "#FFE4C4", dark: "#E6C9A6" },
  "DU.Y": { main: "#BDB76B", dark: "#A9A45F" },

  "HF.W": { main: "#CD5C5C", dark: "#B55252" },
  "HF.A": { main: "#9932CC", dark: "#882AB8" },
};

const ICON_TORNADO = `
  <svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round"
    class="h-4 w-4"
  >
    <path d="M21 4H3" />
    <path d="M18 8H6" />
    <path d="M19 12H9" />
    <path d="M16 16h-6" />
    <path d="M11 20H9" />
  </svg>
`;

const ICON_SEVERE_TSTM = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-zap h-4 w-4"
  >
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
  </svg>
`;

const ICON_FLOOD = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-cloud-rain h-4 w-4"
  >
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
    <path d="M16 14v6"></path>
    <path d="M8 14v6"></path>
    <path d="M12 16v6"></path>
  </svg>
`;

const ICON_WINTER = `
  <svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round"
    class="h-4 w-4"
  >
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="m20 16-4-4 4-4" />
    <path d="m4 8 4 4-4 4" />
    <path d="m16 4-4 4-4-4" />
    <path d="m8 20 4-4 4 4" />
  </svg>
`;

const ICON_WIND = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-wind w-4 h-4"
  >
    <path d="M12.8 19.6A2 2 0 1 0 14 16H2"></path>
    <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"></path>
    <path d="M9.8 4.4A2 2 0 1 1 11 8H2"></path>
  </svg>
`;

const ICON_ALERT = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-circle-alert h-4 w-4"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" x2="12" y1="8" y2="12"></line>
    <line x1="12" x2="12.01" y1="16" y2="16"></line>
  </svg>
`;

const ICON_ACTIVITY = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-activity w-6 h-6"
  >
    <path
      d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"
    ></path>
  </svg>
`;

const ICON_CLOCK = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-clock w-4 h-4 text-zinc-400"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
`;

function getIcon(w) {
  const t = w.title.toLowerCase();

  if (t.includes("tornado")) return ICON_TORNADO;
  if (t.includes("thunderstorm") || t.includes("severe"))
    return ICON_SEVERE_TSTM;
  if (t.includes("flood")) return ICON_FLOOD;
  if (t.includes("winter") || t.includes("blizzard") || t.includes("snow"))
    return ICON_WINTER;
  if (t.includes("wind")) return ICON_WIND;

  return ICON_ALERT;
}

function getWarningColor(product, significance) {
  const key = `${product}.${significance}`;
  return WARNING_COLORS[key] || null;
}

function getSeverity(w) {
  const t = w.tags || {};

  if (
    w.emergency ||
    w.title.includes("Tornado Emergency") ||
    t.TORNADO_DAMAGE_THREAT === "CATASTROPHIC" ||
    t.FLASH_FLOOD_DAMAGE_THREAT === "CATASTROPHIC" ||
    t.THUNDERSTORM_DAMAGE_THREAT === "DESTRUCTIVE"
  )
    return "extreme";

  if (
    t.PDS ||
    t.EDS ||
    t.TORNADO === "OBSERVED" ||
    t.TORNADO_DAMAGE_THREAT === "CONSIDERABLE" ||
    t.THUNDERSTORM_DAMAGE_THREAT === "CONSIDERABLE"
  )
    return "severe";

  if (
    (w.product === "TO" && w.significance === "W") ||
    (w.product === "SV" && w.significance === "W") ||
    (w.product === "FF" && w.significance === "W")
  )
    return "moderate";

  return "standard";
}

function getExpiresIn(w) {
  const now = Date.now();
  const exp = new Date(w.expires_at).getTime();
  const msLeft = exp - now;

  if (msLeft <= 0) return "Expiring";

  const min = Math.floor(msLeft / 60000);
  if (min < 1) return "<1m left";
  if (min < 60) return `${min}m left`;

  const h = Math.floor(min / 60);
  const m = min % 60;

  return m === 0 ? `${h}h left` : `${h}h ${m}m left`;
}

function hexToRgba(hex, alpha = 1) {
  // Remove leading "#"
  hex = hex.replace("#", "").trim();

  // #RGB → convert to #RRGGBB
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((x) => x + x)
      .join("");
  }

  // #RRGGBBAA → handle alpha inside hex
  if (hex.length === 8) {
    const a = parseInt(hex.slice(6, 8), 16) / 255;
    alpha = a; // override manual alpha
    hex = hex.slice(0, 6);
  }

  if (hex.length !== 6) {
    console.warn("Invalid hex color:", hex);
    return `rgba(0,0,0,${alpha})`;
  }

  const int = parseInt(hex, 16);

  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatNumber(num) {
  if (num < 1000) return num.toString();
  if (num < 1_000_000) return (num / 1000).toFixed(0).replace(/\.0$/, "") + "K";
  if (num < 1_000_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
}

function getStateCodes(warning) {
  if (!warning.states || warning.states.length === 0) return "United States";

  // Extract "code" (e.g., "MI", "KS")
  const codes = warning.states.map((s) => s.code);

  // Remove duplicates (e.g., KS appearing twice)
  const unique = [...new Set(codes)];

  // Join into clean string: "KS, MO"
  return unique.join(", ");
}

function getReportColor(code) {
  switch (code) {
    case "T":
      return {
        main: "#ef4444",
        dark: "#dc2626",
      };
    case "H":
      return {
        main: "#22c55e",
        dark: "#16a34a",
      };
    case "W":
      return {
        main: "#f59e0b",
        dark: "#d97706",
      };
    case "N":
    case "G":
      return {
        main: "#3b82f6",
        dark: "#2563eb",
      };
    case "S":
      return {
        main: "#a855f7",
        dark: "#9333ea",
      };
    case "Z":
      return {
        main: "#06b6d4",
        dark: "#0891b2",
      };
    case "F":
      return {
        main: "#14b8a6",
        dark: "#0d9488",
      };
    default:
      return {
        main: "#6b7280",
        dark: "#4b5563",
      };
  }
}

function getReportIcon(code) {
  switch (code) {
    case "T":
      return ICON_TORNADO;
    case "H":
      return ICON_SEVERE_TSTM;
    case "W":
      return ICON_WIND;
    case "N":
    case "G":
      return ICON_WIND;
    case "S":
      return ICON_WINTER;
    case "F":
      return ICON_FLOOD;
    default:
      return ICON_ACTIVITY;
  }
}

function getReportTime(report) {
  let s = report.age_hours;

  return s < 1
    ? `${Math.round(s * 60)}m ago`
    : s < 24
      ? `${s.toFixed(1)}h ago`
      : `${Math.floor(s / 24)}d ago`;
}

function renderReportCard(report, index = 1) {
  const colors = getReportColor(report.event_code);
  const icon = getReportIcon(report.event_code);

  const gradientA = hexToRgba(colors?.main || "#ffffff", 0.125);
  const gradientB = hexToRgba(colors?.dark || "#000000", 0.063);
  const borderCol = hexToRgba(colors?.main || "#ffffff", 0.314);

  const timeAgo = getReportTime(report);

  return `
    <a
      class="group relative flex min-w-[210px] max-w-[260px] flex-col justify-between rounded-xl border bg-monitor-card/80 px-4 py-3 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_15px_(59,130,246,0.2)] hover:border-blue-400/50 shrink-0"
      aria-label="${report.event_type} report details"
      href="/reports"
      style="background-image: linear-gradient(135deg, ${gradientA}, ${gradientB}); border-color: ${borderCol}"
    >
      <div class="relative flex items-start gap-2 text-sm text-zinc-100 pr-16">
        <span class="text-xs font-bold font-mono text-gray-500">#${String(index).padStart(2, "0")}</span>
        <span style="color: ${hexToRgba(colors?.main || "#ffffff")};">${icon}</span>
        <p class="flex-1 font-semibold leading-tight text-sm text-white line-clamp-2 font-tech tracking-wide">${report.event_type}</p>
        <span class="absolute top-0 right-0 text-[9px] uppercase tracking-widest rounded-sm px-1.5 py-0.5 border whitespace-nowrap font-mono font-bold" style="background-color: ${hexToRgba(colors?.main, 0.19)}; border-color: ${borderCol}; color: ${hexToRgba(colors?.main)}">${report.magnitude} ${report.unit}</span>
      </div>
      <div class="mt-3 flex items-center justify-between text-xs text-gray-400 font-mono">
        <span class="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-map-pin h-3 w-3"
          >
            <path
              d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
            ></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          ${report.location}, ${report.state}
        </span>
        <span class="font-semibold" style="color: ${hexToRgba(colors?.main)};">${timeAgo}</span>
      </div>
      <div class="mt-2 flex items-center justify-between text-[10px] text-gray-500 font-mono uppercase">
        <span>${report.source.toLowerCase() === "measurable" ? "MEASURED" : "OBSERVED"}</span>
        <span class="text-monitor-active group-hover:text-white transition-colors">DETAILS -></span>
      </div>
    </a>
  `;
}

function renderWarningCard(warning, index = 1) {
  const severity = getSeverity(warning);
  const icon = getIcon(warning);
  const colors = getWarningColor(warning.product, warning.significance);

  const gradientA = hexToRgba(colors?.main || "#ffffff", 0.15);
  const gradientB = hexToRgba(colors?.dark || "#000000", 0.07);
  const borderCol = hexToRgba(colors?.main || "#ffffff", 0.33);

  const expires = getExpiresIn(warning);

  const stateCode = getStateCodes(warning);
  const pop = warning.population ? formatNumber(warning.population) : "—";

  const sevLabel =
    severity === "extreme"
      ? "EXTREME"
      : severity === "severe"
        ? "SEVERE"
        : severity === "moderate"
          ? "MODERATE"
          : "STANDARD";

  return `
  <a
    class="group relative flex min-w-[210px] max-w-[260px] flex-col justify-between rounded-xl border bg-monitor-card/80 px-4 py-3 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(56,189,249,0.2)] hover:border-monitor-active/50 shrink-0"
    aria-label="${warning.title} warning details"
    href="/warnings"
    style="${colors ? `background-image: linear-gradient(135deg, ${gradientA}, ${gradientB}); border-color: ${borderCol};` : `background-color: rgba(24, 24, 27, 0.65);`}"
  >
    <div class="relative flex items-start gap-2 text-sm text-zinc-100 pr-16">
      <span class="text-xs font-bold font-mono text-gray-500">#${index.toString().padStart(2, "0")}</span>
      <span class="text-white">${icon}</span>
      <p class="flex-1 font-semibold leading-tight text-sm text-white line-clamp-2 font-tech tracking-wide">
        ${warning.title}
      </p>
      <span class="absolute top-0 right-0 text-[9px] uppercase tracking-widest rounded-sm px-1.5 py-0.5 bg-black/50 border border-white/10 text-gray-300 whitespace-nowrap font-mono">
        ${sevLabel}
      </span>
    </div>
    <div class="mt-3 flex items-center justify-between text-xs text-gray-400 font-mono">
      <span class="flex items-center gap-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-map-pin h-3 w-3"
        >
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        ${stateCode}
      </span>
      <span class="font-semibold text-monitor-warning">${expires}</span>
    </div>
    <div class="mt-2 flex items-center justify-between text-[10px] text-gray-500 font-mono uppercase">
      <span>Pop: ${pop}</span>
      <span class="text-monitor-active group-hover:text-white transition-colors">
        DETAILS -&gt;
      </span>
    </div>
  </a>`;
}

async function updateCurrentTopReports() {
  const res = await fetch(
    `https://public.yallsoft.app/rhy/reports.json?t=${new Date().getTime()}`,
  );
  const data = await res.json();

  const topReports = document.getElementById("topReports");

  topReports.innerHTML = data.reports
    .slice(0, 5)
    .map((r, i) => renderReportCard(r, i + 1))
    .join("");
}

async function updateCurrentTopWarnings() {
  const res = await fetch(
    `https://public.yallsoft.app/rhy/top_10_warnings.json?t=${new Date().getTime()}`,
  );
  const data = await res.json();

  const topWarnings = document.getElementById("topWarnings");

  topWarnings.innerHTML = data
    .slice(0, 5)
    .map((w, i) => renderWarningCard(w, i + 1))
    .join("");
}

function renderAffectedRegion(forecastObject) {
  if (
    !forecastObject.affected_regions ||
    forecastObject.affected_regions.length === 0
  )
    return "United States";

  const affectedRegionEls = [];

  for (let i = 1; i <= forecastObject.affected_regions.length; i++) {
    affectedRegionEls.push(
      `<div class="inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary/80 bg-monitor-card border border-monitor-border text-gray-400 font-mono text-xs uppercase">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-map-pin w-3 h-3 mr-1"
        >
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        ${forecastObject.affected_regions[i - 1]}
      </div>
    `,
    );
  }

  return affectedRegionEls.join("");
}

const ICONS = {
  storm: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="lucide lucide-zap w-5 h-5"
         fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
    </svg>
  `,
  alert: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="lucide lucide-triangle-alert w-5 h-5"
         fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
      <path d="M12 9v4"/>
      <path d="M12 17h.01"/>
    </svg>
  `,
  rain: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="lucide lucide-cloud-rain w-5 h-5"
         fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
      <path d="M16 14v6"/>
      <path d="M8 14v6"/>
      <path d="M12 16v6"/>
    </svg>
  `,
  snow: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="lucide lucide-snowflake w-5 h-5"
         fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="12" y1="2" x2="12" y2="22"/>
      <path d="m20 16-4-4 4-4"/>
      <path d="m4 8 4 4-4 4"/>
      <path d="m16 4-4 4-4-4"/>
      <path d="m8 20 4-4 4 4"/>
    </svg>
  `,
  wind: `<svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-wind w-5 h-5"
    >
      <path d="M12.8 19.6A2 2 0 1 0 14 16H2"></path>
      <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"></path>
      <path d="M9.8 4.4A2 2 0 1 1 11 8H2"></path>
    </svg>`,
  temperature: `<svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-thermometer w-5 h-5"
    >
      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>
    </svg>`,
};

function classifyConcern(text) {
  text = text.toLowerCase();

  if (
    text.includes("tornado") ||
    text.includes("damaging") ||
    text.includes("storm")
  )
    return "storm";

  if (text.includes("temperature")) return "temperature";

  if (text.includes("wind")) return "wind";

  if (text.includes("rain") || text.includes("flood") || text.includes("hail"))
    return "rain";

  return "alert"; // fallback
}

function concernColor(text) {
  text = text.toLowerCase();

  if (text.includes("dangerous"))
    return {
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    };

  if (
    text.includes("tornado") ||
    text.includes("severe") ||
    text.includes("damaging") ||
    text.includes("significant")
  )
    return {
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    };

  if (text.includes("moderate") || text.includes("elevat"))
    return {
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    };

  return {
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  };
}

function formatForecastDate(iso) {
  const d = new Date(iso);

  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function updateTomorrowsForecastConcerns(id) {
  const el = document.getElementById(id);
  el.innerHTML = "";

  let concerns = s.tomorrows_forecast_summary.key_concerns.slice(0, 3);

  // Normalize
  if (!concerns) concerns = [];
  if (Array.isArray(concerns[0])) concerns = concerns.flat();

  if (concerns.length === 0) {
    el.innerHTML = `<p class="text-sm text-zinc-500 italic">No key concerns listed.</p>`;
    return;
  }

  // Build animated elements
  concerns.forEach((c) => {
    const div = document.createElement("div");

    div.className = `
      flex items-start gap-2 text-sm font-mono
    `.trim();

    div.innerHTML = `
      <span class="text-monitor-warning mt-0.5 shrink-0">→</span>
      <span class="text-gray-400 uppercase">${c}</span>
    `;

    el.appendChild(div);
  });
}

const concernsCache = {};
const concernNodes = {}; // store DOM nodes per ID
let removalTimers = {}; // to delay removal for exit animation

function updateForecastConcerns(forecastSummaryProduct, id) {
  const container = document.getElementById(id);

  let concerns = forecastSummaryProduct.key_concerns;

  // Normalize
  if (!concerns) concerns = [];
  if (Array.isArray(concerns[0])) concerns = concerns.flat();

  // Ensure node store exists for this ID
  if (!concernNodes[id]) concernNodes[id] = {};

  const oldMap = concernNodes[id];
  const newMap = {};

  // Convert array to indexed list so duplicates work
  concerns.forEach((c, idx) => {
    newMap[idx] = c;
  });

  // If no concerns at all:
  if (concerns.length === 0) {
    container.innerHTML = `<p class="text-sm text-zinc-500 italic">No key concerns listed.</p>`;
    concernNodes[id] = {};
    return;
  }

  // Ensure the container is cleared only once
  container.innerHTML = "";

  // Build final order with diff logic
  Object.keys(newMap).forEach((key, index) => {
    const text = newMap[key];
    const oldNode = oldMap[key];

    // Build new node
    let node;
    if (oldNode && oldNode._text === text) {
      // UNCHANGED — reuse existing node
      node = oldNode.el;
    } else {
      // NEW or UPDATED — create new node
      node = createConcernNode(text, index);
      node.style.opacity = "0";
      node.style.transform = "translateX(-20px)";

      // Staggered reveal
      setTimeout(() => {
        node.style.opacity = "1";
        node.style.transform = "translateX(0)";
      }, index * 100);
    }

    // Set/update map entry
    oldMap[key] = { el: node, _text: text };

    // Append in final order
    container.appendChild(node);
  });

  // Handle REMOVED nodes
  Object.keys(oldMap).forEach((key) => {
    if (!(key in newMap)) {
      const { el } = oldMap[key];

      // Animate out
      el.style.opacity = "0";
      el.style.transform = "translateX(-20px)";

      // Remove after animation
      removalTimers[key] = setTimeout(() => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }, 250);

      // Delete from map
      delete oldMap[key];
    }
  });
}

// Helper that builds a single animated concern node
function createConcernNode(text, index) {
  const type = classifyConcern(text);
  const icon = ICONS[type];
  const { color, bg, border } = concernColor(text);

  const div = document.createElement("div");

  div.className = `
    flex items-center gap-3 p-3 rounded-lg
    border font-mono text-sm
    ${color} ${bg} ${border}
    transition-all duration-300
  `.trim();

  div.innerHTML = `
    <span class="shrink-0">
      ${icon}
    </span>
    <span class="uppercase tracking-wide">${text}</span>
  `;

  return div;
}

function renderForecastSummary(forecastSummaryProduct, id, format = true) {
  const el = document.getElementById(id);
  if (!forecastSummaryProduct?.summary) return;

  const text = forecastSummaryProduct.summary;

  // Split into sentences
  if (format) {
    const sentences = text
      .split(". ")
      .map((x) => x.trim())
      .filter(Boolean);

    let paragraphs = [];

    for (let i = 0; i < sentences.length; i += 3) {
      let group = sentences
        .slice(i, i + 3)
        .join(". ")
        .trim();

      if (!group.endsWith(".")) group += ".";

      paragraphs.push(`<p class="text-zinc-300">${group}</p>`);
    }

    el.innerHTML = paragraphs.join("\n");
  } else {
    el.textContent = `${text}`;
  }
}

function formatShortDate(date) {
  const d = new Date(date);

  if (isNaN(d)) return "Invalid Date";

  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Function to convert an object to an array
 * @param {object} obj - The object to convert
 * @returns {Array<{key: string, value: any}>}
 */
function objectToArray(obj) {
  return Object.entries(obj).map(([key, value]) => ({ key, value }));
}

/**
 *
 * @param {Object} forecastSummaryProduct - The forecast summary object
 * @param {Object.<string, string>} forecastSummaryProduct.daily_breakdown - Key-value pairs of date → summary text.
 * @param {string} id - The DOM element ID to update.
 *
 * @returns {void}
 */
function updateThisWeeksForecastDateSummaries(forecastSummaryProduct, id) {
  const el = document.getElementById(id);
  const breakdown = forecastSummaryProduct.daily_breakdown;
  const dailyArray = objectToArray(breakdown); // [{key, value}, ...]

  // Build lookup of existing cards
  const existingCards = new Map();
  el.querySelectorAll(".forecast-card").forEach((card) => {
    existingCards.set(card.dataset.date, card);
  });

  dailyArray.forEach(({ key: dateKey, value: summary }) => {
    const readable = formatShortDate(dateKey);
    const existing = existingCards.get(dateKey);

    if (existing) {
      // 🔥 Card already exists — check if content changed
      const summaryEl = existing.querySelector("p");
      if (summaryEl.textContent !== summary) {
        summaryEl.textContent = summary;

        // subtle highlight animation for changed card
        existing.style.transition = "background-color 250ms ease";
        existing.style.backgroundColor = "rgba(250,250,250,0.07)";
        setTimeout(() => {
          existing.style.backgroundColor = "rgba(24,24,27,0.5)";
        }, 250);
      }

      existingCards.delete(dateKey); // mark as handled
    } else {
      // 🔥 New card — add it with animation
      const newCard = createForecastCard(readable, summary, dateKey);
      el.appendChild(newCard);
    }
  });

  // 🔥 Remove cards that are no longer in data
  existingCards.forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(5px)";
    setTimeout(() => card.remove(), 200);
  });
}

function updateForecastDate(forecastSummaryProduct, id) {
  const dateEl = document.getElementById(id);

  const iso = forecastSummaryProduct.date || forecastSummaryProduct;

  if (!iso) {
    dateEl.textContent = "Date unavailable";
    return;
  }

  dateEl.textContent = formatForecastDate(iso);
}

async function updateTodaysForecast() {
  const affectedRegionEl = document.getElementById("todaysAffectedRegions");

  renderForecastSummary(s.todays_forecast_summary, "todaysForecastText");
  updateForecastDate(s.todays_forecast_summary, "todaysForecastDate");
  affectedRegionEl.innerHTML = renderAffectedRegion(s.todays_forecast_summary);
  updateForecastConcerns(s.todays_forecast_summary, "todaysKeyConcerns");
}

async function updateTomorrowsForecast() {
  renderForecastSummary(s.tomorrows_forecast_summary, "tomorrowsForecastText");
  updateForecastDate(s.tomorrows_forecast_summary, "tomorrowsForecastDate");
  updateTomorrowsForecastConcerns("tomorrowsKeyConcerns");
}

async function updateThisWeeksForecast() {
  renderForecastSummary(
    s?.this_weeks_forecast_summary,
    "thisWeeksForecastText",
    false,
  );
  updateForecastDate(s?.this_weeks_forecast_summary?.start_date, "startDate");
  updateForecastDate(s?.this_weeks_forecast_summary?.end_date, "endDate");
  updateThisWeeksForecastDateSummaries(
    s.this_weeks_forecast_summary,
    "forecastDays",
  );
}

function createForecastCard(dateStr, summary, dateKey) {
  const card = document.createElement("div");
  card.className =
    "bg-monitor-card border border-monitor-border/30 rounded-lg p-4 hover:border-monitor-active/30 " +
    "opacity-1 translate-y-3 transition-all duration-300";

  card.dataset.date = dateKey; // 🔥 identify card

  const header = document.createElement("div");
  header.className =
    "text-sm font-bold text-monitor-active mb-2 font-tech uppercase tracking-wider";
  header.textContent = dateStr;

  const p = document.createElement("p");
  p.className = "text-xs text-gray-400 font-sans";
  p.textContent = summary;

  card.appendChild(header);
  card.appendChild(p);

  requestAnimationFrame(() => {
    card.style.opacity = "1";
    card.style.transform = "translateY(0)";
  });

  return card;
}

let trendingCache = {};
let trendingNodes = {}; // { id: { index: { el, text } } }
let trendingRemovalTimers = {};

function updateTrendingTopics(id) {
  const container = document.getElementById(id);
  if (!container) return;

  const topics =
    s?.community_analysis?.discord_summary?.summary?.trending_topics || [];

  // Normalize topics list
  if (!Array.isArray(topics)) return;

  // Ensure storage exists for this section
  if (!trendingNodes[id]) trendingNodes[id] = {};

  const oldMap = trendingNodes[id];
  const newMap = {};

  // If no topics
  if (topics.length === 0) {
    container.innerHTML = `<p class="text-sm text-zinc-500 italic">No trending topics.</p>`;
    trendingNodes[id] = {};
    return;
  }

  // Clear container before building new order
  container.innerHTML = "";

  topics.forEach((topic, index) => {
    const oldNode = oldMap[index];
    let node;

    // EXACT same logic as concerns updater:
    // If unchanged, reuse existing node
    if (oldNode && oldNode.text === topic) {
      node = oldNode.el;
    } else {
      // New or updated → create new node
      node = createTrendingNode(topic, index);

      // Start invisible
      node.style.opacity = "0";
      node.style.transform = "translateX(-20px) scale(0)";

      // Stagger reveal animation
      setTimeout(() => {
        node.style.opacity = "1";
        node.style.transform = "translateX(0) scale(1)";
      }, index * 70);
    }

    // Save reference for next diff
    newMap[index] = { el: node, text: topic };

    // Append in order
    container.appendChild(node);
  });

  // Handle REMOVED topics (exit animation)
  Object.keys(oldMap).forEach((key) => {
    if (!(key in newMap)) {
      const { el } = oldMap[key];

      // Fade/slide out before removal
      el.style.opacity = "0";
      el.style.transform = "translateX(-20px) scale(0.8)";

      trendingRemovalTimers[key] = setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 250);

      // Remove from map
      delete oldMap[key];
    }
  });

  // Update stored node map
  trendingNodes[id] = newMap;
}

function createTrendingNode(text, index) {
  const wrapper = document.createElement("div");
  wrapper.className = "trending-chip";
  wrapper.style.transition = `all 0.35s ease ${index * 0.1}s`;

  wrapper.innerHTML = `
    <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-purple-900/30 text-purple-300 border-purple-700/50 font-mono text-xs hover:bg-purple-900/50 cursor-default">
      <svg xmlns="http://www.w3.org/2000/svg"
           width="24" height="24" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round"
           class="lucide lucide-trending-up w-3 h-3 mr-1">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
      ${text}
    </div>
  `;

  return wrapper;
}

function animateTrendingTopics() {
  const chips = document.querySelectorAll(".trending-chip");

  chips.forEach((chip) => {
    requestAnimationFrame(() => {
      chip.style.opacity = "1";
      chip.style.transform = "translateX(0) scale(1)";
    });
  });
}

function renderKeyTakeaways() {
  const keyTakeaways =
    s.community_analysis?.discord_summary?.summary?.key_takeaways;

  let takeawayEls = [];

  for (const takeaway in keyTakeaways) {
    takeawayEls.push(
      `<div class="flex items-start gap-2">
        <span class="text-purple-400 mt-1">></span>
        <span class="text-sm text-gray-300 font-sans">
          ${keyTakeaways[takeaway]}
        </span>
      </div>`,
    );
  }

  return takeawayEls.join("");
}

function updateLiveCommunityPulse() {
  const currentEventsEl = document.getElementById("currentWeatherEvents");
  const publicSentimentEl = document.getElementById("publicSentiment");
  const takeawaysEl = document.getElementById("keyTakeaways");
  const currentEvents =
    s.community_analysis?.discord_summary?.summary?.current_weather_events;
  const publicSentiment =
    s.community_analysis?.discord_summary?.summary?.public_sentiment;

  currentEventsEl.textContent = currentEvents;
  publicSentimentEl.textContent = publicSentiment;
  updateTrendingTopics("trendingTopics");
  takeawaysEl.innerHTML = renderKeyTakeaways();
}

function extractState(location) {
  if (!location) return null;
  return location.split(",").pop().trim();
}

function getSeverityClasses(severity) {
  const s = (severity || "").toLowerCase();

  if (s === "high" || s === "severe" || s === "critical") {
    return "text-red-400 bg-red-500/10 border-red-500/20";
  } else if (s === "medium" || s === "moderate") {
    return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  } else {
    return "text-green-400 bg-green-500/10 border-green-500/20";
  }
}

function getSeverityBorder(severity) {
  const s = (severity || "").toLowerCase();

  if (s === "high" || s === "severe" || s === "critical")
    return "border-l-red-500";
  if (s === "medium" || s === "moderate") return "border-l-amber-500";
  return "border-l-green-500";
}

function getStatusClasses(statusText) {
  if (!statusText) return "text-amber-300 bg-amber-500/10 border-amber-500/30";

  const text = statusText.toLowerCase();

  if (
    text.includes("worsen") ||
    text.includes("escalat") ||
    text.includes("intensify")
  ) {
    return "text-red-300 bg-red-500/10 border-red-500/30";
  }

  if (
    text.includes("improv") ||
    text.includes("eas") ||
    text.includes("calm")
  ) {
    return "text-emerald-300 bg-emerald-500/10 border-emerald-500/30";
  }

  return "text-amber-300 bg-amber-500/10 border-amber-500/30";
}

function severityRank(severity) {
  const s = (severity || "").toLowerCase();
  if (s === "high" || s === "severe" || s === "critical") return 0;
  if (s === "medium" || s === "moderate") return 1;
  if (s === "low" || s === "minor") return 2;
  return 3;
}

async function updateScannerCards() {
  const res = await fetch(
    `https://public.yallsoft.app/rhy/scanners.json?t=${new Date().getTime()}`,
  );
  const data = await res.json();

  const scannerTransmissionsEl = document.getElementById(
    "scannerTransmissions",
  );
  const notableTransmissionsEl = document.getElementById("notableEvents");
  const lowSeverityEl = document.getElementById("lowSeverity"),
    mediumSeverityEl = document.getElementById("mediumSeverity"),
    highSeverityEl = document.getElementById("highSeverity");
  const updatedTimestamp = document.getElementById("scannerUpdatedTimestamp");
  const updateWindowTimestamps = document.getElementById("scannerUpdateWindow");
  const trafficAnalysisEl = document.getElementById("scannerTrafficAnalysis");
  const keyIncidentsEl = document.getElementById("scannerIncidents");
  const noScannerIncidentsEl = document.getElementById(
    "noScannerIncidentsDetected",
  );
  const scannerIncidentContainerEl = document.getElementById(
    "scannerIncidentContainer",
  );
  const incidentCounts = countSeverities(data?.key_incidents);

  scannerTransmissionsEl.textContent = data?.transmissions_analyzed;
  notableTransmissionsEl.textContent = data?.key_incidents?.length;
  lowSeverityEl.textContent = incidentCounts.low;
  mediumSeverityEl.textContent = incidentCounts.medium;
  highSeverityEl.textContent = incidentCounts.high;
  updatedTimestamp.textContent = `${formatTime(data?.summary_timestamp, true)}`;
  updateWindowTimestamps.textContent =
    data?.analysis_period?.start || data?.analysis_period?.end
      ? `Window: ${formatTime(
          data?.analysis_period?.start,
        )} - ${formatTime(data?.analysis_period?.end)}`
      : "Last Update";
  trafficAnalysisEl.textContent = data?.overall_summary;

  const grouped = groupByState(data?.key_incidents);

  keyIncidentsEl.innerHTML = Array.from(grouped.entries())
    .map(([stateKey, incidents]) => {
      const stateAbbr = stateKey === "ZZZ" ? "Unknown" : stateKey;
      const count = incidents.length;

      return `
      <div>
        <!-- State header -->
        <div class="flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin w-3.5 h-3.5 text-gray-500">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <h3 class="text-sm font-bold text-gray-300 font-tech uppercase tracking-wide">${stateAbbr}</h3>
          <div class="inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary/80 bg-monitor-card border border-monitor-border text-gray-500 text-[10px] px-1.5 py-0 font-mono">${count}</div>
        </div>

        <!-- Incident cards for this state -->
        <div class="space-y-2">
          ${incidents
            .map((incident) => {
              const severityClass = getSeverityClasses(incident.severity);
              const severityBorder = getSeverityBorder(incident.severity);
              const severityText = (incident.severity || "INFO").toUpperCase();
              const time = incident.timestamps?.[0]
                ? formatTime(incident.timestamps[0], true)
                : "—";

              const locationTags = (incident.locations || [])
                .map(
                  (
                    loc,
                  ) => `<span class="inline-flex items-center text-[10px] text-gray-500 bg-monitor-card/50 border border-monitor-border/20 px-1.5 py-0.5 rounded font-mono uppercase">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin w-2.5 h-2.5 mr-1 text-gray-600">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    ${loc}
                  </span>`,
                )
                .join("");

              const scannerSources = (incident.scanner_sources || []).join(
                " • ",
              );

              return `
                <div class="rounded-lg border border-monitor-border/30 bg-monitor-card/30 p-3 border-l-4 ${severityBorder}">
                  <div class="flex items-start justify-between gap-3 mb-1.5">
                    <div class="flex items-center gap-2 flex-wrap">
                      <div class="inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-[10px] px-1.5 py-0 font-mono ${severityClass}">${severityText}</div>
                      <span class="text-sm font-medium text-gray-200 font-tech tracking-wide">${incident.type}</span>
                    </div>
                    <div class="text-[10px] text-gray-500 whitespace-nowrap font-mono shrink-0">${time}</div>
                  </div>
                  <p class="text-sm text-gray-400 leading-relaxed font-sans">${incident.description}</p>
                  <div class="flex flex-wrap gap-1.5 mt-2">${locationTags}</div>
                  <div class="mt-2 pt-2 border-t border-monitor-border/20">
                    <div class="flex items-center gap-1 text-[10px] text-gray-600 font-mono">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radio w-2.5 h-2.5">
                        <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path>
                        <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path>
                        <circle cx="12" cy="12" r="2"></circle>
                        <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path>
                        <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path>
                      </svg>
                      <span>${scannerSources}</span>
                    </div>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
    })
    .join("");

  if (grouped.size > 0) {
    scannerIncidentContainerEl.classList.toggle("hidden", false);
    noScannerIncidentsEl.classList.toggle("hidden", true);
  } else {
    scannerIncidentContainerEl.classList.toggle("hidden", true);
    noScannerIncidentsEl.classList.toggle("hidden", false);
  }
}

document.querySelectorAll('[role="tab"]').forEach((tab) => {
  tab.addEventListener("click", () => {
    const key = tab.id.replace("radix-:rh:-trigger-", "");

    /* ---------- Tabs ---------- */
    document.querySelectorAll('[role="tab"]').forEach((t) => {
      t.dataset.state = "inactive";
      t.setAttribute("aria-selected", "false");
      t.tabIndex = -1;
    });

    tab.dataset.state = "active";
    tab.setAttribute("aria-selected", "true");
    tab.tabIndex = 0;

    /* ---------- Panels ---------- */
    document.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
      panel.dataset.state = "inactive";
      panel.setAttribute("hidden", "");
    });

    const activePanel = document.getElementById(`radix-:rh:-content-${key}`);

    if (activePanel) {
      activePanel.dataset.state = "active";
      activePanel.removeAttribute("hidden");

      // 🔥 FORCE re-render every time
      delete activePanel.dataset.rendered;
      renderActivePanels();
    }
  });
});

const HISTORY_POINTS = [
  { id: "yesterday", label: "Yesterday" },
  { id: "this_week_so_far", label: "This Week" },
  { id: "last_week", label: "Last Week" },
  { id: "this_month_so_far", label: "This Month" },
  { id: "last_month", label: "Last Month" },
];

const historyCache = {};

async function preloadHistory() {
  const currentTime = Date.now();

  const results = await Promise.allSettled(
    HISTORY_POINTS.map(async (item) => {
      const res = await fetch(
        `https://public.yallsoft.app/rhy/history/${item.id}.json?t=${currentTime}`,
      );

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data = await res.json();
      return { id: item.id, data };
    }),
  );

  // Process allSettled results
  results.forEach((result, index) => {
    const id = HISTORY_POINTS[index].id;

    if (result.status === "fulfilled") {
      historyCache[id] = result.value.data;
    } else {
      console.warn(`Failed to fetch ${id}:`, result.reason.message);
      historyCache[id] = null;
    }
  });
}

function keyFromPanel(panel) {
  return panel.id.replace("radix-:rh:-content-", "");
}

function renderActivePanels() {
  document.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
    if (panel.dataset.state === "active" && !panel.dataset.rendered) {
      const key = keyFromPanel(panel);
      const data = historyCache[key];

      panel.innerHTML = renderHistoryPanel(data);
      panel.dataset.rendered = "true";
    }
  });
}

function renderList(items, color, emptyName, icon) {
  if (!items || !items.length) {
    return `<p class="text-xs text-zinc-500">${emptyName}</p>`;
  }

  return `
    <ul class="space-y-2 text-xs text-gray-300 font-mono">
      ${items
        .map(
          (item) => `
        <li class="flex items-start gap-2">
          <span class="text-${color} mt-0.5">${icon}</span>
          <span>${item}</span>
        </li>
      `,
        )
        .join("")}
    </ul>
  `;
}

function formatDateRange(period) {
  const start = new Date(period.start);
  const end = new Date(period.end);

  const options = {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  };

  if (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()
  ) {
    // single-day
    return start.toLocaleDateString("en-US", options);
  } else if (start.getFullYear() === end.getFullYear()) {
    // multi-day same year
    const startStr = start.toLocaleDateString("en-US", options);
    const endStr = end.toLocaleDateString("en-US", options);
    return `${startStr} – ${endStr}`;
  } else {
    // multi-year
    return `${start.toLocaleDateString(
      "en-US",
      options,
    )} – ${end.toLocaleDateString("en-US", options)}`;
  }
}

function renderHistoryPanel(data) {
  const dateText = formatDateRange(data.period);
  const coverageTime = data?.coverage?.days
    ? `${data.coverage.days} days`
    : data?.coverage?.hours
      ? `${data.coverage.hours} hrs`
      : null;

  const patternsList =
    data?.patterns?.length > 0 ? data.patterns.slice(0, 4) : "";
  const highlightsList =
    data?.highlights?.length > 0 ? data.highlights.slice(0, 4) : "";

  const combinedPatternsAndHighlights = [...patternsList, ...highlightsList];

  return `
    <div class="rounded-lg border border-monitor-border bg-gradient-to-br from-monitor-active/5 via-monitor-bg to-monitor-active/5 p-4">
      <div class="flex flex-wrap items-center gap-2 text-xs text-gray-400 font-mono">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-range w-4 h-4 text-monitor-active">
          <rect width="18" height="18" x="3" y="4" rx="2"></rect>
          <path d="M16 2v4"></path>
          <path d="M3 10h18"></path>
          <path d="M8 2v4"></path>
          <path d="M17 14h-6"></path>
          <path d="M13 18H7"></path>
          <path d="M7 14h.01"></path>
          <path d="M17 18h.01"></path>
        </svg>
        <span>${dateText}</span>
        <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-monitor-border text-gray-300 font-mono">
          ${coverageTime}
        </div>
      </div>

      ${
        data.trend
          ? `<div class="mt-3 rounded-lg border px-4 py-2.5 font-tech uppercase tracking-wide ${getStatusClasses(
              data.trend,
            )}">
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-4 h-4 flex-shrink-0">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
            <polyline points="16 7 22 7 22 13"></polyline>
          </svg>
          <span class="text-sm font-medium leading-snug">${
            data.trend || ""
          }</span>
        </div>
      </div>`
          : ""
      }

      <p class="mt-3 text-sm text-gray-300 leading-relaxed font-sans">${data.summary}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div class="rounded-lg border border-monitor-border bg-monitor-card/50 p-4">
        <div class="flex items-center gap-2 text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest font-tech">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-4 h-4 text-monitor-warning">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
            <path d="M20 3v4"></path>
            <path d="M22 5h-4"></path>
            <path d="M4 17v2"></path>
            <path d="M5 18H3"></path>
          </svg>
          Major Events
        </div>
        ${renderList(
          data.major_events.slice(0, 5),
          "monitor-warning",
          "No major events highlighted.",
          ">",
        )}
      </div>

      <div class="rounded-lg border border-monitor-border bg-monitor-card/50 p-4">
        <div class="flex items-center gap-2 text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest font-tech">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert w-4 h-4 text-monitor-danger">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
            <path d="M12 9v4"></path>
            <path d="M12 17h.01"></path>
          </svg>
          Alerts
        </div>
        ${renderList(data.alerts.slice(0, 4), "monitor-danger", "No alerts highlighted.", "!")}
      </div>

      <div class="rounded-lg border border-monitor-border bg-monitor-card/50 p-4">
        <div class="flex items-center gap-2 text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest font-tech">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin w-4 h-4 text-monitor-success">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          Active Regions
        </div>
        <div class="flex flex-wrap gap-2">
          ${(data.regions || [])
            .map(
              (r) =>
                `<div class="inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary/80 bg-monitor-card border border-monitor-border text-gray-400 font-mono text-[10px] uppercase">${r}</div>`,
            )
            .join("")}
        </div>
      </div>

      <div class="rounded-lg border border-monitor-border bg-monitor-card/50 p-4">
        <div class="flex items-center gap-2 text-xs text-gray-500 mb-3 uppercase tracking-widest font-tech">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layers w-4 h-4 text-monitor-active">
            <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path>
            <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path>
            <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path>
          </svg>
          Patterns & Highlights
        </div>
        ${renderList(combinedPatternsAndHighlights, "monitor-active", "", "#")}
      </div>
    </div>
  `;
}

const observer = new MutationObserver(renderActivePanels);

function observePanels() {
  document.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
    observer.observe(panel, {
      attributes: true,
      attributeFilter: ["data-state"],
    });
  });
}

// Wait until DOM + Radix markup exist
async function loadHistoryData() {
  await preloadHistory();
  observePanels();
  renderActivePanels();
}

// ==========================
// RUN ALL
// ==========================
function startWeatherUI() {
  loadHistoryData();
  updateBreakingHeadlines();
  updateCurrentTopWarnings();
  updateMiniWIS();
  updateScannerCards();
  updateCurrentTopReports();

  // Refresh every 1 minute (same as RHY)
  setInterval(updateBreakingHeadlines, 60000);
  setInterval(() => {
    updateTimestamp();
    updateCurrentTopWarnings();
    updateMiniWIS();
    updateScannerCards();
    updateCurrentTopReports();
  }, 10000);
}

startWeatherUI();

window.addEventListener("resize", () => {
  if (menuOpen) positionToolsMenu();
});

const elements = document.querySelectorAll(".transition-element");

elements.forEach((el, i) => {
  // Initial state
  el.style.opacity = "0";
  el.style.transform = "translateY(10px)";
  el.style.transition = "opacity 0.2s, transform 0.2s";

  // Animate with stagger
  setTimeout(() => {
    el.style.opacity = "1";
    el.style.transform = "none";
  }, i * 50); // 150ms between each
});
