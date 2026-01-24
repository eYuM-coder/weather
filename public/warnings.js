let lastWarnings = [];

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
    class="h-6 w-6"
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
    class="lucide lucide-zap h-6 w-6"
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
    class="lucide lucide-cloud-rain w-6 h-6"
  >
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
    <path d="M16 14v6"></path>
    <path d="M8 14v6"></path>
    <path d="M12 16v6"></path>
  </svg>
`;

const ICON_WINTER = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-snowflake w-6 h-6"
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
    class="lucide lucide-wind w-6 h-6"
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
    class="lucide lucide-circle-alert h-6 w-6"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" x2="12" y1="8" y2="12"></line>
    <line x1="12" x2="12.01" y1="16" y2="16"></line>
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
    class="lucide lucide-clock w-6 h-6 text-zinc-400"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
`;

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

function getTimes(w) {
  const now = new Date();
  const start = new Date(w.issued_at);
  const exp = new Date(w.expires_at);

  // Total seconds
  const totalSec = Math.floor((exp.getTime() - start.getTime()) / 1000);
  const remainingSec = Math.floor((exp.getTime() - now.getTime()) / 1000);

  // Break into hours, minutes, seconds
  const hrsLeft = Math.floor(remainingSec / 3600);
  const minsLeft = Math.floor((remainingSec % 3600) / 60);
  const secsLeft = remainingSec % 60;

  const totalHrs = Math.floor(totalSec / 3600);
  const totalMins = Math.floor((totalSec % 3600) / 60);
  const totalSecs = totalSec % 60;

  // Percentage elapsed
  const elapsedSec = Math.max(
    Math.floor((now.getTime() - start.getTime()) / 1000),
    0,
  );
  let percentage = remainingSec > 0 ? totalSec > 0 ? Math.min(elapsedSec / totalSec, 1) : 1 : 1;

  return {
    remaining:
      remainingSec > 0
        ? `Status: ${hrsLeft > 0 ? `${hrsLeft}:` : ""}${
            minsLeft < 10 && hrsLeft > 0
              ? `${minsLeft.toString().padStart(2, "0")}:`
              : minsLeft > 0
                ? `${minsLeft}:`
                : ""
          }${
            secsLeft < 10 && minsLeft > 0 && hrsLeft >= 0
              ? secsLeft.toString().padStart(2, "0") +
                ` (${hrsLeft > 0 ? `${hrsLeft}h ` : ""}${minsLeft > 0 ? `${minsLeft}m ` : ""}${secsLeft}s)`
              : minsLeft === 0 && hrsLeft === 0
                ? secsLeft.toString() + "s"
                : secsLeft + ` (${hrsLeft > 0 ? `${hrsLeft}h ` : ""}${minsLeft > 0 ? `${minsLeft}m ` : ""}${secsLeft}s)`
          } remaining`
        : "Expired",
    duration: `Duration: ${totalHrs}h ${totalMins}m ${totalSecs}s total`,
    percentage: percentage.toFixed(6), // more readable than 4 decimals
  };
}

function hexToRgba(hex, alpha = 1) {
  // Remove leading "#"
  hex = hex?.replace("#", "").trim();

  // #RGB → convert to #RRGGBB
  if (hex?.length === 3) {
    hex = hex
      .split("")
      .map((x) => x + x)
      .join("");
  }

  // #RRGGBBAA → handle alpha inside hex
  if (hex?.length === 8) {
    const a = parseInt(hex.slice(6, 8), 16) / 255;
    alpha = a; // override manual alpha
    hex = hex.slice(0, 6);
  }

  if (hex?.length !== 6) {
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

function renderHazardDetails(warning) {
  const t = warning?.tags || {};

  const sections = [
    { label: "Hazard", value: t?.HAZARD },
    { label: "Impact", value: t?.IMPACT },
  ];

  return sections
    .filter((s) => s.value && s.value.trim() !== "")
    .map(
      (s) => `
      <div class="space-y-2">
        <p class="font-semibold">${s.label}:</p>
        <p class="text-sm text-muted-foreground">${s.value}</p>
      </div>
      `,
    )
    .join("");
}

function detailBox(label, value, color, classes, svg = null) {
  return `
    <div class="bg-black/30 rounded border border-white/5 p-1.5 md:p-2 text-center">
      <p class="text-[9px] uppercase font-tech tracking-wider text-gray-500">${label}</p>
      <div class="flex items-center justify-center gap-1">
        ${svg === null ? "" : svg}
        <p class="${classes}" ${color ? `style="color: ${color};"` : ""}>
          ${value}
        </p>
      </div>
    </div>
  `;
}

function renderHazardBlock(w, colors) {
  const h = w.tags?.HAZARD;
  if (!h) return "";

  const detailedBox = detailBox(
    "Hazard",
    h,
    colors?.main,
    "font-bold text-[10px] md:text-xs font-mono uppercase truncate",
  );

  return detailedBox;
}

function renderImpactBlock(w, colors) {
  const i = w.tags?.IMPACT;
  if (!i) return "";

  const detailedBox = detailBox(
    "Impact",
    i,
    colors?.main,
    "font-bold text-[10px] md:text-xs font-mono uppercase truncate",
  );

  return detailedBox;
}

function renderDetailGrid(w, colors) {
  const t = w.tags || {};
  const mainColor = hexToRgba(colors?.main ?? "#ffffff");

  const boxes = [];

  if (t.HAZARD)
    boxes.push(
      detailBox(
        "Hazard",
        t.HAZARD,
        colors?.main,
        "font-bold text-[10px] md:text-xs font-mono uppercase truncate",
      ),
    );

  if (t.IMPACT)
    boxes.push(
      detailBox(
        "Impact",
        t.IMPACT,
        colors?.main,
        "font-bold text-[10px] md:text-xs font-mono uppercase truncate",
      ),
    );

  if (t.SOURCE)
    boxes.push(
      detailBox(
        "Source",
        t.SOURCE,
        mainColor,
        "font-bold text-[10px] md:text-xs font-mono uppercase truncate",
      ),
    );

  if (t.MAX_WIND_GUST)
    boxes.push(
      detailBox(
        "Max Wind",
        t.MAX_WIND_GUST,
        mainColor,
        "font-bold text-[10px] md:text-xs font-mono uppercase truncate",
      ),
    );

  if (t.MAX_HAIL_SIZE)
    boxes.push(
      detailBox(
        "Max Hail",
        t.MAX_HAIL_SIZE,
        mainColor,
        "font-bold text-[10px] md:text-xs font-mono uppercase truncate",
      ),
    );

  if (t.THUNDERSTORM_DAMAGE_THREAT)
    boxes.push(
      detailBox(
        "Damage Threat",
        t.THUNDERSTORM_DAMAGE_THREAT,
        mainColor,
        "font-bold text-[10px] md:text-xs font-mono uppercase truncate",
      ),
    );

  if (t.TIME_MOT_LOC) {
    const d = Math.round(t.TIME_MOT_LOC.direction);
    const s = Math.round(t.TIME_MOT_LOC.speed);
    boxes.push(
      detailBox(
        "Vector",
        `${s}KT`,
        null,
        "font-bold text-xs font-mono uppercase text-white",
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation w-3 h-3 text-white/70" style="transform: rotate(${d}deg);"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`,
      ),
    );
  }

  if (!boxes.length) return "";

  return `${boxes.join("")}`;
}

function getStateCodes(warning, colors) {
  if (!warning.states || warning.states.length === 0) return "";

  // Extract "code" (e.g., "MI", "KS")
  const unique = Array.from(
    new Map(warning.states.map((s) => [s.code, s])).values(),
  );

  // Join into clean string: "KS, MO"
  return unique.map((s) => `${s.code}`).join(", ");
}

function getCountyNames(warning) {
  if (!warning.counties || warning.counties.length === 0) return "";

  const unique = [...new Set(warning.counties.map((c) => c.trim()))];

  return unique.map((c) => `${c}`).join(", ");
}

function renderWarningBadges(b) {
  // Build an array of badge JSX/HTML elements (depending on environment)
  const badges = [];

  if (b.emergency) {
    badges.push(
      `<span class="px-1.5 py-0.5 md:px-2 md:py-1 bg-red-600 text-white text-xs font-bold rounded">EMERGENCY</span>`,
    );
  }

  if (b.tags?.PDS) {
    badges.push(
      `<span class="px-1.5 py-0.5 md:px-2 md:py-1 bg-purple-600 text-white text-xs font-bold rounded">PDS</span>`,
    );
  }

  if (b.tags?.THUNDERSTORM_DAMAGE_THREAT === "DESTRUCTIVE") {
    badges.push(
      `<span class="px-1.5 py-0.5 md:px-2 md:py-1 bg-red-600 text-white text-xs font-bold rounded">DESTRUCTIVE</span>`,
    );
  }

  if (b.tags?.THUNDERSTORM_DAMAGE_THREAT === "CONSIDERABLE" && !b.tags?.PDS) {
    badges.push(
      `<span class="px-1.5 py-0.5 md:px-2 md:py-1 bg-orange-600 text-white text-xs font-bold rounded">CONSIDERABLE</span>`,
    );
  }

  if (b.tags?.TORNADO === "OBSERVED") {
    badges.push(
      `<span class="px-1.5 py-0.5 md:px-2 md:py-1 bg-red-700 text-white text-xs font-bold rounded">CONFIRMED</span>`,
    );
  }

  // Add the title as the last element
  badges.push(
    `<span class="text-base md:text-lg font-bold font-tech uppercase tracking-wide text-white break-words leading-tight">${b.title}</span>`,
  );

  return badges.join(""); // Combine all badges into a single string for template literal
}

function renderWarningCard(warning, index = 1) {
  const icon = getIcon(warning);
  const colors = getWarningColor(warning.product, warning.significance);

  const times = getTimes(warning);

  const category = getSeverity(warning);

  const stateCode = getStateCodes(warning, colors);
  const counties = getCountyNames(warning);
  const sections = renderHazardDetails(warning);
  const pop = warning.population ? formatNumber(warning.population) : "—";

  return `<div
      class="warningCard rounded-lg border bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all duration-300 hover:scale-[1.005] tech-card${
        category === "extreme"
          ? " ring-4 ring-red-600/60 shadow-2xl"
          : category === "severe"
            ? " ring-2 ring-orange-500/50 shadow-xl"
            : ""
      }"
      style="border-color: ${hexToRgba(colors?.dark || "#FFA500")};
      background-color: ${hexToRgba(colors?.main || "#FFA500", 0.125)};
      --warning-color: ${colors?.main || hexToRgba("#FFA500", 0.125)};
      --warning-dark: ${colors?.dark || "#FFA500"}"
    >
    ${
      category === "extreme"
        ? `<div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 animate-gradient"></div>`
        : category === "severe"
          ? `<div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-600"></div>`
          : ""
    }
      <div class="flex flex-col space-y-1.5 p-3 md:p-4 pb-2 md:pb-2 border-b border-black/20">
        <h3 class="text-2xl font-semibold leading-none tracking-tight flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <span
              class="text-xl md:text-2xl font-bold font-mono opacity-60"
              style="color: ${hexToRgba(colors?.dark || "#666")}"
            >
              #${index.toString().padStart(2, "0")}
            </span>
            <div style="color: ${colors?.main || "#FFA500"};">${icon}</div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                ${renderWarningBadges(warning)}
              </div>
              <div class="flex items-center gap-2 text-xs text-white/70 mt-1 font-mono">
                ${stateCode}: ${counties}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <div class="text-right hidden sm:block">
              <div
                class="text-base md:text-lg font-bold font-mono"
                style="color: ${colors?.main};"
              >
                ${pop}
              </div>
              <div class="text-[10px] text-gray-500 font-tech uppercase tracking-wider">Pop. Impact</div>
            </div>
            <a
              href="https://web.weatherwise.app/#wid=${warning.id}&wr=${index}"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 px-3 py-2 rounded transition-all text-xs font-bold font-mono uppercase tracking-wide border hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] bg-blue-600 hover:bg-blue-700 text-white border-blue-400"
            >
              <img
                src="/WeatherWise_Black_Border.png"
                alt="WeatherWise"
                class="w-4 h-4 object-contain"
              />
              <span class="hidden sm:inline">RADAR</span>
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
                class="lucide lucide-external-link w-3 h-3"
              >
                <path d="M15 3h6v6"></path>
                <path d="M10 14 21 3"></path>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              </svg>
            </a>
          </div>
        </h3>
      </div>
      <div class="p-3 md:p-4 pt-3 relative space-y-3">
        <div class="flex items-center justify-between sm:hidden">
          <div
            class="text-sm font-bold font-mono"
            style="color: ${colors?.main || void 0}"
          >
            POP: ${pop}
          </div>
        </div>
        <div class="flex items-center justify-between font-mono text-[10px] md:text-xs uppercase tracking-wide">
          <span class="expires-text text-gray-400">
            ${times?.remaining}
          </span>
          <span class="total-text text-gray-500">${times?.duration}</span>
        </div>
        <div class="relative w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
          <div
            class="progress-fill h-full rounded-full transition-all duration-300"
            style="width: ${times.percentage * 100}%; background-color: ${
              colors?.main || "#FFA500"
            };"
          ></div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          ${renderDetailGrid(warning, colors)}
        </div>
        <div class="pt-2 border-t border-white/5 mt-1">
          <button
            class="flex items-center justify-between w-full text-[10px] font-mono text-gray-500 hover:text-white transition-colors uppercase tracking-wide py-1 group"
          >
            <span
              class="flex items-center gap-2 group-hover:text-monitor-active transition-colors"
            >
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
                class="lucide lucide-file-text w-3 h-3"
              >
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                <path d="M10 9H8"></path><path d="M16 13H8"></path>
                <path d="M16 17H8"></path>
              </svg>
              Raw CAP Protocol Text
            </span>
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
              class="lucide lucide-chevron-down w-3 h-3"
            >
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          </button>
          <div
            class="cap-text hidden mt-2 p-3 bg-black/50 rounded border border-white/10 overflow-x-auto"
          >
            <pre
              class="text-[10px] text-gray-400 font-mono whitespace-pre-wrap leading-relaxed"
            >${warning.text.trim()}</pre>
          </div>
        </div>
      </div>
    </div>`;
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  // Only target the RAW CAP toggle button
  if (!btn.textContent.includes("Raw CAP")) return;

  const container = btn.closest(".warningCard");
  if (!container) return;

  const cap = container.querySelector(".cap-text");
  if (!cap) return;

  cap.classList.toggle("hidden");

  // rotate chevron
  const chevron = btn.querySelector(".lucide-chevron-down");
  if (chevron) {
    chevron.style.transform = cap.classList.contains("hidden")
      ? "rotate(0deg)"
      : "rotate(180deg)";
  }
});

// -------------------------------
// SMART UPDATE SYSTEM
// -------------------------------

function renderAllCards(data) {
  const topWarnings = document.getElementById("warningCards");
  topWarnings.innerHTML = data
    .map((w, i) => renderWarningCard(w, i + 1))
    .join("");
  applyButtonHoverEffects();
}

function updateChangedCards(oldData, newData) {
  newData.forEach((newW, i) => {
    const oldW = oldData[i];

    // IF NEW WARNING → FULL REPLACE
    if (!oldW || oldW.id !== newW.id) {
      replaceCard(newW, i);
      return;
    }
  });
}

function replaceCard(warning, index) {
  const card = document.querySelector(
    `#warningCards > div:nth-child(${index + 1})`,
  );
  if (!card) return;

  const temp = document.createElement("div");
  temp.innerHTML = renderWarningCard(warning, index + 1);

  const newCard = temp.firstElementChild;
  card.replaceWith(newCard);

  applyButtonHoverEffects(); // rebind button hover
}

function updateCardTimers(w, index) {
  const card = document.querySelector(
    `#warningCards > div:nth-child(${index + 1})`,
  );
  if (!card) return;

  const expiresEl = card.querySelector(".expires-text");
  const totalEl = card.querySelector(".total-text");
  const barEl = card.querySelector(".progress-fill");
  const times = getTimes(w);

  if (expiresEl) expiresEl.textContent = `${times.remaining}`;
  if (totalEl) totalEl.textContent = `${times.duration}`;
  if (barEl) barEl.style.width = `${times.percentage * 100}%`;
}

// -------------------------------
// UPDATE LOOP (SMART)
// -------------------------------

async function fetchTopWarnings() {
  const res = await fetch(
    `https://public.yallsoft.app/rhy/top_10_warnings.json?t=${new Date().getTime()}`,
  );
  const data = await res.json();

  if (lastWarnings.length === 0) {
    renderAllCards(data);
  } else {
    updateChangedCards(lastWarnings, data);
  }

  lastWarnings = data;
}

function updateAllTimers() {
  lastWarnings.forEach((w, i) => {
    updateCardTimers(w, i);
  });
}

function applyButtonHoverEffects() {
  const buttons = document.querySelectorAll(".wwRadarBtn");

  buttons.forEach((btn) => {
    const main = btn.dataset.main;
    const dark = btn.dataset.dark;

    btn.addEventListener("mouseenter", () => {
      btn.style.backgroundColor = dark;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.backgroundColor = main;
    });
  });
}

// INITIAL LOAD
fetchTopWarnings();

// UPDATE ONLY DIFFS EVERY 10s
setInterval(fetchTopWarnings, 10000);
setInterval(updateAllTimers, 1000);

window.addEventListener("resize", () => {
  if (menuOpen) positionToolsMenu();
});
