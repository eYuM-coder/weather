let lastReports = [];

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
      return ICON_ALERT;
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

function renderReportCard(report, index = 1) {
  const icon = getReportIcon(report.event_code);
  const colors = getReportColor(report.event_code);

  const times = getReportTime(report);

  return `<div
      class="reportCard rounded-lg border bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all duration-300 hover:scale-[1.005] tech-card"
      style="border-color: ${hexToRgba(colors?.dark)};
      background-color: ${hexToRgba(colors?.main, 0.082)};"
    >
      <div class="absolute top-0 left-0 right-0 h-0.5" style="background-color: ${hexToRgba(colors?.main)}"></div>
      <div class="flex flex-col space-y-1.5 p-3 md:p-4 pb-2 md:pb-2 border-b border-black/20">
        <h3 class="text-2xl font-semibold leading-none tracking-tight flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <span
              class="text-xl md:text-2xl font-bold font-mono opacity-60"
              style="color: ${hexToRgba(colors?.dark)}"
            >
              #${index.toString().padStart(2, "0")}
            </span>
            <div style="color: ${colors?.main}">${icon}</div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-1.5 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider rounded" style="background-color: ${hexToRgba(colors?.main)}; color: white;">${report.source.toLowerCase() === "measurable" ? "MEASURED" : "OBSERVED"}</span>
                <span class="text-base md:text-lg font-bold font-tech uppercase tracking-wide text-white break-words leading-tight">${report.event_type}</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-white/70 mt-1 font-mono">
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
                <span>${report.location}, ${report.state}</span>
                <span class="text-gray-500">(${report.county_name})</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <div class="text-right hidden sm:block">
              <div
                class="text-base md:text-lg font-bold font-mono"
                style="color: ${colors?.main};"
              >
                ${report.magnitude} ${report.unit}
              </div>
              <div class="text-[10px] text-gray-500 font-tech uppercase tracking-wider">Magnitude</div>
            </div>
            <a
              href="https://www.google.com/maps?q=${report.geometry?.coordinates[1]},${report.geometry?.coordinates[0]}"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 px-3 py-2 rounded transition-all text-xs font-bold font-mono uppercase tracking-wide border hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40"
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
                class="lucide lucide-map-pin w-4 h-4"
              >
                <path
                  d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
                ></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span class="hidden sm:inline">MAP</span>
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
      <div class="p-3 md:p-4 pt-2">
        <div class="flex items-center justify-between sm:hidden">
          <div
            class="text-sm font-bold font-mono"
            style="color: ${colors?.main || void 0}"
          >
            ${report.magnitude} ${report.unit}
          </div>
        </div>
        <div class="flex items-center justify-between font-mono text-[10px] md:text-xs uppercase tracking-wide">
          <span class="time-ago flex items-center gap-1 text-gray-400">
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
              class="lucide lucide-clock w-3 h-3"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${times}
          </span>
          <span class="text-gray-500">${new Date(report.time).toLocaleString()}</span>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div class="bg-black/30 rounded border border-white/5 p-1.5 text-center">
            <p class="text-[9px] uppercase font-tech tracking-wider text-gray-500">Score</p>
            <p class="font-bold text-sm font-mono" style="color: ${hexToRgba(colors?.dark)}">${report.score.toFixed(2)}</p>
          </div>
          <div class="bg-black/30 rounded border border-white/5 p-1.5 text-center">
            <p class="text-[9px] uppercase font-tech tracking-wider text-gray-500">Raw</p>
            <p class="font-bold text-sm font-mono text-white/80">${report.raw_score.toFixed(2)}</p>
          </div>
          <div class="bg-black/30 rounded border border-white/5 p-1.5 text-center">
            <p class="text-[9px] uppercase font-tech tracking-wider text-gray-500">Decay</p>
            <p class="font-bold text-sm font-mono text-white/80">${report.time_factor.toFixed(2)}x</p>
          </div>
        </div>
        ${
          report.remarks
            ? `<div class="mt-2 p-2 bg-black/30 rounded border border-white/5">
            <p class="text-xs text-gray-300 font-mono">${report.remarks}</p>
          </div>`
            : ""
        }
      </div>
    </div>`;
}

// -------------------------------
// SMART UPDATE SYSTEM
// -------------------------------

function renderAllCards(data) {
  const topReports = document.getElementById("reportCards");
  topReports.innerHTML = data
    .map((r, i) => renderReportCard(r, i + 1))
    .join("");
}

function updateChangedCards(oldData, newData) {
  newData.forEach((newR, i) => {
    const oldR = oldData[i];

    // IF NEW WARNING → FULL REPLACE
    if (!oldR || oldR !== newR) {
      replaceCard(newR, i);
      return;
    }
  });
}

function replaceCard(report, index) {
  const card = document.querySelector(
    `#reportCards > div:nth-child(${index + 1})`,
  );
  if (!card) return;

  const temp = document.createElement("div");
  temp.innerHTML = renderReportCard(report, index + 1);

  const newCard = temp.firstElementChild;
  card.replaceWith(newCard);
}

function updateCardTimers(r, index) {
  const card = document.querySelector(
    `#reportCards > div:nth-child(${index + 1})`,
  );
  if (!card) return;

  const timeAgoEl = card.querySelector(".time-ago");
  const times = getReportTime(r);

  if (timeAgoEl)
    timeAgoEl.innerHTML = `
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
      class="lucide lucide-clock w-3 h-3"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
    ${times}
    `;
}

// -------------------------------
// UPDATE LOOP (SMART)
// -------------------------------

async function fetchTopReports() {
  const res = await fetch(
    `https://public.yallsoft.app/rhy/reports.json?t=${new Date().getTime()}`,
  );
  const data = await res.json();

  if (lastReports.length === 0) {
    renderAllCards(data.reports.slice(0, 10));
  } else {
    updateChangedCards(lastReports, data.reports.slice(0, 10));
  }

  lastReports = data.reports.slice(0, 10);
}

function updateAllTimers() {
  lastReports.forEach((r, i) => {
    updateCardTimers(r, i);
  });
}

// INITIAL LOAD
fetchTopReports();

// UPDATE ONLY DIFFS EVERY 10s
setInterval(fetchTopReports, 10000);
setInterval(updateAllTimers, 1000);

window.addEventListener("resize", () => {
  if (menuOpen) positionToolsMenu();
});
